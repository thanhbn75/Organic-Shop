# Software Requirement Specification (SRS)
## Chức năng: Quản lý Thông tin cá nhân
**Mã chức năng:** USER-06  
**Trạng thái:** Draft  

### 1. Mô tả tổng quan
User cập nhật thông tin cá nhân, thay đổi mật khẩu và quản lý các địa chỉ nhận hàng để tiện cho việc thanh toán.

### 2. Luồng nghiệp vụ
| Bước | Hành động của User | Phản hồi hệ thống |
| :--- | :--- | :--- |
| 1 | Chọn "Đổi mật khẩu" | Form yêu cầu: Mật khẩu cũ, Mật khẩu mới. So khớp DB bằng thuật toán Hash. |
| 2 | Thêm "Địa chỉ giao hàng" | Nhập địa chỉ mới, lưu thành danh sách để chọn nhanh lúc Checkout. |

### 3. Ràng buộc kỹ thuật
* Đổi mật khẩu bắt buộc phải nhập đúng mật khẩu cũ. Khi đổi xong, các session đăng nhập trên thiết bị khác sẽ bị vô hiệu hóa.
