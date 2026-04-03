# Software Requirement Specification (SRS)
## Chức năng: Quản lý Tin tức / Blog
**Mã chức năng:** ADMIN-04  
**Trạng thái:** Draft  

### 1. Mô tả tổng quan
Khu vực đăng tải các bài viết về thực phẩm hữu cơ, mẹo sức khỏe để tăng tương tác và SEO cho website.

### 2. Luồng nghiệp vụ
| Bước | Hành động | Phản hồi hệ thống |
| :--- | :--- | :--- |
| 1 | Admin chọn "Thêm bài viết mới" | Mở Text Editor (như CKEditor/TinyMCE) để soạn thảo. |
| 2 | Nhập Tiêu đề, Nội dung, Ảnh bìa và Lưu | Lưu vào DB, hiển thị bài viết ra trang Blog của User. |

### 3. Yêu cầu dữ liệu
* **Database:** Bảng `posts` (id, title, content, thumbnail, author_id, created_at).

### 4. Ràng buộc kỹ thuật
* Trình soạn thảo văn bản Rich Text (WYSIWYG) phải sanitize HTML để chống tấn công XSS.
