# Software Requirement Specification (SRS)
## Chức năng: Quản lý Người dùng & Phân quyền
**Mã chức năng:** ADMIN-03  
**Trạng thái:** Draft  

### 1. Mô tả tổng quan
Admin có quyền xem danh sách khách hàng, cấp quyền nhân viên, hoặc khóa các tài khoản có hành vi gian lận (spam, boom hàng).

### 2. Luồng nghiệp vụ
| Bước | Hành động của Admin | Phản hồi hệ thống |
| :--- | :--- | :--- |
| 1 | Truy cập Quản lý Người dùng | Hiển thị danh sách Users (Tên, Email, Vai trò, Trạng thái). |
| 2 | Bấm "Khóa tài khoản" | Cập nhật status tài khoản thành Inactive, buộc User đó đăng xuất. |
| 3 | Bấm "Phân quyền" | Hiển thị popup chọn Role (Admin, Staff, User). |

### 3. Yêu cầu dữ liệu
* **Input:** `user_id`, `role`, `status`.
* **Database:** Cập nhật bảng `users`.

### 4. Ràng buộc kỹ thuật & Bảo mật
* Admin không thể tự khóa tài khoản của chính mình hoặc tự hạ quyền của mình.
* Thao tác đổi quyền phải được mã hóa và lưu vào Audit Log.
