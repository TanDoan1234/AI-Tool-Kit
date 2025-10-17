// Declare global variables from CDN scripts
declare const mammoth: any;
declare const marked: any;
declare const TurndownService: any;
declare const Papa: any;
declare const jspdf: any;
declare const docx: any;
declare const saveAs: any;

// Helper to get file extension
const getExtension = (filename: string) => filename.split('.').pop()?.toLowerCase() || '';

// Helper to safely extract plain text from an HTML string
function getTextFromHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

// --- Conversion Functions ---

async function docxToHtml(arrayBuffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}

function htmlToMarkdown(html: string): string {
  const turndownService = new TurndownService();
  return turndownService.turndown(html);
}

function markdownToHtml(markdown: string): string {
  return marked.parse(markdown);
}

function jsonToCsv(jsonString: string): string {
  try {
    const data = JSON.parse(jsonString);
    // Papa.unparse expects an array of objects or an array of arrays.
    const dataToUnparse = Array.isArray(data) ? data : (data.data && Array.isArray(data.data)) ? data.data : [data];
    return Papa.unparse(dataToUnparse);
  } catch (e) {
    throw new Error("Invalid JSON data for CSV conversion. It should be an array of objects.");
  }
}

function csvToJson(csvString: string): string {
  const result = Papa.parse(csvString, { header: true, skipEmptyLines: true });
  if (result.errors.length) {
      console.error("CSV Parsing errors:", result.errors);
      throw new Error(`CSV parsing error on row ${result.errors[0].row}: ${result.errors[0].message}`);
  }
  return JSON.stringify(result.data, null, 2);
}

// --- Output/Download Functions ---

function downloadPdf(text: string, filename: string) {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 10, 10);
    doc.save(filename);
}

async function downloadDocx(text: string, filename: string) {
    const { Document, Packer, Paragraph, TextRun } = docx;

    const doc = new Document({
        sections: [{
            children: text.split('\n').map(line => new Paragraph({
                children: [new TextRun(line)],
            })),
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
}

// --- Main Service Logic ---

interface ConvertParams {
  content: string | ArrayBuffer;
  filename: string;
  outputFormat: string;
}

export interface ConversionResult {
  format: string;
  content: string;
  isBinary: boolean;
  filename: string;
}

export async function performConversion({ content, filename, outputFormat }: ConvertParams): Promise<ConversionResult> {
    const inputFormat = getExtension(filename);
    const outputFilename = `${filename.split('.').slice(0, -1).join('.') || 'converted'}.${outputFormat}`;

    // Path 1: Data-to-data conversions (JSON <-> CSV)
    if (inputFormat === 'json' && outputFormat === 'csv') {
        const csvContent = jsonToCsv(content as string);
        return { format: 'csv', content: csvContent, isBinary: false, filename: outputFilename };
    }
    if (inputFormat === 'csv' && outputFormat === 'json') {
        const jsonContent = csvToJson(content as string);
        return { format: 'json', content: jsonContent, isBinary: false, filename: outputFilename };
    }

    // Path 2: Document conversions (DOCX, MD, HTML, TXT -> various)
    // First, normalize input to a common format: HTML
    let htmlContent = '';
    if (inputFormat === 'docx') {
        if (!(content instanceof ArrayBuffer)) {
            throw new Error("Internal error: DOCX file content must be an ArrayBuffer.");
        }
        htmlContent = await docxToHtml(content);
    } else if (inputFormat === 'md') {
        htmlContent = markdownToHtml(content as string);
    } else if (inputFormat === 'html') {
        htmlContent = content as string;
    } else { // txt, and other text-based files like json, csv when not doing data-to-data conversion
        // Wrap in <pre> to preserve whitespace and line breaks
        const pre = document.createElement('pre');
        pre.textContent = content as string;
        htmlContent = pre.outerHTML;
    }

    // Second, convert from HTML to the desired output format
    switch (outputFormat) {
        case 'html':
            return { format: 'html', content: htmlContent, isBinary: false, filename: outputFilename };
        case 'md':
            return { format: 'markdown', content: htmlToMarkdown(htmlContent), isBinary: false, filename: outputFilename };
        case 'txt':
            const textContent = getTextFromHtml(htmlContent);
            return { format: 'text', content: textContent, isBinary: false, filename: outputFilename };
        case 'pdf':
            const textForPdf = getTextFromHtml(htmlContent);
            downloadPdf(textForPdf, outputFilename);
            return { format: 'pdf', content: `PDF file '${outputFilename}' has been generated for download.`, isBinary: true, filename: outputFilename };
        case 'docx':
            const textForDocx = getTextFromHtml(htmlContent);
            await downloadDocx(textForDocx, outputFilename);
            return { format: 'docx', content: `Word file '${outputFilename}' has been generated for download.`, isBinary: true, filename: outputFilename };
        default:
            throw new Error(`Conversion from '${inputFormat}' to '${outputFormat}' is not supported with this tool.`);
    }
}