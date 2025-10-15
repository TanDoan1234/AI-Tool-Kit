
# Trình tạo biểu mẫu bằng AI (AI Form Generator)

Đây là một ứng dụng web thông minh giúp tự động tạo bản xem trước của Google Form từ các câu hỏi được cung cấp dưới định dạng JSON, HTML, hoặc Markdown. Sau khi xem trước, bạn có thể tạo một Google Form thực tế trong tài khoản Google của mình chỉ với một cú nhấp chuột.

## Tính năng chính

- **Phân tích thông minh**: Sử dụng Google Gemini để phân tích văn bản thô (JSON, Markdown, HTML) và chuyển đổi thành một cấu trúc biểu mẫu hợp lệ.
- **Xem trước trực quan**: Cung cấp bản xem trước của biểu mẫu được tạo ra, giúp bạn hình dung kết quả cuối cùng.
- **Tích hợp Google Forms**: Tự động tạo một Google Form mới trong tài khoản Google của bạn thông qua Google Forms API.
- **Hỗ trợ nhiều định dạng**: Chấp nhận đầu vào dưới nhiều định dạng phổ biến.
- **Giao diện hiện đại**: Giao diện người dùng sạch sẽ, dễ sử dụng được xây dựng bằng React và Tailwind CSS.

---

## Hướng dẫn Cấu hình và Lấy API

Để ứng dụng hoạt động đầy đủ, bạn cần lấy ba loại "chìa khóa" (API keys) từ các dịch vụ của Google. Dưới đây là hướng dẫn chi-tiết-từng-bước.

### Điều kiện tiên quyết
- Một tài khoản Google.
- Một trình duyệt web.

### Bước 1: Lấy Gemini API Key

Đây là key để sử dụng mô hình ngôn ngữ của Google (Gemini) để phân tích câu hỏi của bạn.

1.  Truy cập **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2.  Đăng nhập bằng tài khoản Google của bạn.
3.  Nhấp vào nút **"Create API key in new project"**.
4.  Một API key sẽ được tạo ra. Sao chép (copy) key này và lưu lại cẩn thận.

> **Key này sẽ được dán vào ô `Gemini API Key` trong ứng dụng.**

### Bước 2: Cấu hình Google Cloud và Lấy Keys

Phần này phức tạp hơn một chút vì chúng ta cần hai loại key từ Google Cloud Platform (GCP) để tạo form và cho phép người dùng đăng nhập.

#### 2.1. Tạo một dự án Google Cloud mới

1.  Truy cập **[Google Cloud Console](https://console.cloud.google.com/)**.
2.  Ở góc trên cùng bên trái, nhấp vào menu chọn dự án (bên cạnh logo "Google Cloud").
3.  Nhấp vào **"NEW PROJECT"**.
4.  Đặt tên cho dự án (ví dụ: `AI Form Generator Project`) và nhấp **"CREATE"**.

#### 2.2. Kích hoạt Google Forms API

1.  Đảm bảo bạn đang ở trong dự án vừa tạo.
2.  Sử dụng thanh tìm kiếm ở trên cùng, gõ **"Google Forms API"** và chọn kết quả tương ứng.
3.  Nhấp vào nút **"ENABLE"**. Đợi một lát để API được kích hoạt.

#### 2.3. Tạo Google Cloud API Key

Key này dùng để xác thực các yêu cầu đến Google Forms API.

1.  Từ menu điều hướng bên trái (☰), đi đến **APIs & Services > Credentials**.
2.  Nhấp vào **"+ CREATE CREDENTIALS"** ở trên cùng và chọn **"API key"**.
3.  Một API key sẽ được tạo. Sao chép và lưu lại key này.
4.  (Khuyến nghị) Nhấp vào **"EDIT API KEY"**, và trong phần "API restrictions", chọn "Restrict key" và chỉ cho phép **"Google Forms API"** để tăng cường bảo mật.

> **Key này sẽ được dán vào ô `Google Cloud API Key` trong ứng dụng.**

#### 2.4. Cấu hình Màn hình chấp thuận OAuth (OAuth Consent Screen)

Đây là màn hình mà người dùng sẽ thấy khi họ đăng nhập bằng Google.

1.  Trong menu bên trái, vẫn ở trang **APIs & Services**, chọn **"OAuth consent screen"**.
2.  Chọn **"External"** cho User Type và nhấp **"CREATE"**.
3.  Điền các thông tin bắt buộc:
    -   **App name**: Tên ứng dụng của bạn (ví dụ: `AI Form Generator`).
    -   **User support email**: Chọn email của bạn.
    -   **Developer contact information**: Nhập lại email của bạn.
4.  Nhấp **"SAVE AND CONTINUE"**.
5.  Ở bước "Scopes", bạn không cần thêm gì, cứ nhấp **"SAVE AND CONTINUE"**.
6.  Ở bước "Test users", đây là bước **RẤT QUAN TRỌNG** để tránh lỗi `403: access_denied`.
    -   Nhấp vào **"+ ADD USERS"**.
    -   Nhập địa chỉ email Google mà bạn sẽ dùng để đăng nhập và tạo form. Bạn có thể thêm nhiều email nếu muốn.
    -   Nhấp **"ADD"**.
7.  Nhấp **"SAVE AND CONTINUE"**, sau đó nhấp **"BACK TO DASHBOARD"**.

#### 2.5. Tạo Google Cloud Client ID

Đây là "chứng minh thư" cho ứng dụng web của bạn khi yêu cầu đăng nhập.

1.  Quay lại trang **Credentials** (APIs & Services > Credentials).
2.  Nhấp vào **"+ CREATE CREDENTIALS"** và chọn **"OAuth client ID"**.
3.  Trong mục "Application type", chọn **"Web application"**.
4.  Đặt một cái tên (ví dụ: `Web Client for Form Generator`).
5.  Trong phần **"Authorized JavaScript origins"**, đây là bước **QUAN TRỌNG** để tránh lỗi `redirect_uri_mismatch`.
    -   Nhấp **"+ ADD URI"**.
    -   Nhập địa chỉ mà bạn đang chạy ứng dụng. Ví dụ:
        -   `http://localhost:3000` (nếu bạn chạy trên máy local)
        -   `http://127.0.0.1:3000`
        -   Nếu bạn đang dùng một web editor, hãy sao chép URL của trang đó (ví dụ: `https://stackblitz.com`, `https://codesandbox.io`).
6.  Trong phần **"Authorized redirect URIs"**, bạn cũng cần thêm các địa chỉ tương tự.
7.  Nhấp **"CREATE"**.
8.  **Client ID** của bạn sẽ hiện ra. Sao chép và lưu lại giá trị này.

> **ID này sẽ được dán vào ô `Google Cloud Client ID` trong ứng dụng.**

---

## Hướng dẫn sử dụng ứng dụng

Sau khi đã có đủ 3 loại key, bạn có thể bắt đầu sử dụng.

#### Bước 1: Nhập API Keys vào ứng dụng

1.  Mở ứng dụng.
2.  Nhấp vào biểu tượng bánh răng cài đặt (⚙️) ở góc trên bên phải.
3.  Dán 3 keys bạn đã lấy được vào các ô tương ứng.
4.  Nhấp **"Save and Reload"**. Trang sẽ tự động tải lại để áp dụng cấu hình mới.

#### Bước 2: Tạo bản xem trước

1.  Sử dụng menu thả xuống để chọn một ví dụ có sẵn (Markdown, JSON, hoặc HTML).
2.  Hoặc, xóa nội dung trong ô và dán văn bản chứa các câu hỏi của riêng bạn.
3.  Nhấp vào nút **"Generate Form Preview"**.
4.  Chờ một vài giây để AI phân tích và hiển thị bản xem trước của biểu mẫu bên dưới.

#### Bước 3: Tạo Google Form thực tế

1.  Sau khi bản xem trước hiện ra, một khu vực mới sẽ xuất hiện ở dưới cùng.
2.  Nhấp vào **"Sign in with Google"**.
3.  Một cửa sổ pop-up sẽ hiện ra, hãy đăng nhập bằng chính tài khoản Google mà bạn đã thêm vào danh sách "Test users" ở bước 2.4.
4.  Sau khi đăng nhập thành công, nút sẽ đổi thành **"Create Google Form"**.
5.  Nhấp vào nút đó. Ứng dụng sẽ gọi API và tạo một biểu mẫu mới trong Google Drive của bạn.
6.  Khi hoàn tất, một liên kết đến biểu mẫu mới tạo sẽ được hiển thị. Bạn có thể sao chép liên kết này hoặc nhấp vào "Create another form" để bắt đầu lại.
