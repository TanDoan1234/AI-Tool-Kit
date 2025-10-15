import React, { useEffect, useRef } from 'react';

// Make Mermaid's type available globally for the component
declare global {
    interface Window {
        mermaid?: {
            run: (options?: { nodes: Array<Element>, suppressErrors?: boolean }) => void;
        };
    }
}

interface DiagramPreviewProps {
  diagramCode: string;
}

const DiagramPreview: React.FC<DiagramPreviewProps> = ({ diagramCode }) => {
    const mermaidRef = useRef<HTMLPreElement>(null);
    
    // Using a key based on the code ensures that React replaces the DOM element,
    // which helps in reliably re-triggering Mermaid's rendering logic.
    const componentKey = btoa(diagramCode); 

    useEffect(() => {
        if (window.mermaid && mermaidRef.current) {
            try {
                window.mermaid.run({
                    nodes: [mermaidRef.current]
                });
            } catch (e) {
                console.error("Mermaid rendering error:", e);
                if (mermaidRef.current) {
                     mermaidRef.current.innerHTML = `Error rendering diagram. Please check your syntax.<br><br>${(e as Error).message}`;
                }
            }
        }
    }, [diagramCode, componentKey]);

  return (
    <div key={componentKey} className="flex justify-center items-center p-4 bg-white rounded-md min-h-[300px]">
        {/* The 'mermaid' class is essential for Mermaid.js to find and render the diagram */}
        <pre ref={mermaidRef} className="mermaid w-full">
            {diagramCode}
        </pre>
    </div>
  );
};

export default DiagramPreview;