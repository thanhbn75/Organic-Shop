# Software Requirement Specification (SRS)
## Chức năng: Quản lý Đơn hàng (Admin Order Management)
**Mã chức năng:** ADMIN-02  
**Trạng thái:** Draft  

### 1. Mô tả tổng quan
Cho phép Admin/Nhân viên quản lý toàn bộ vòng đời của các đơn hàng trên hệ thống, từ lúc khách đặt (Chờ xác nhận) cho đến khi giao thành công hoặc hủy.

### 2. Luồng nghiệp vụ
| Bước | Hành động của Admin | Phản hồi hệ thống |
| :--- | :--- | :--- |
| 1 | Truy cập Dashboard -> Quản lý Đơn hàng | Hiển thị danh sách toàn bộ đơn hàng, có bộ lọc theo trạng thái. |
| 2 | Bấm "Xem chi tiết" đơn hàng Pending | Hiển thị thông tin khách hàng, sản phẩm, tổng tiền. |
| 3 | Chuyển trạng thái sang "Đang giao" | Lưu database, cập nhật trạng thái hiển thị cho User. |
| 4 | Chuyển trạng thái "Hoàn thành" | Xác nhận đơn hàng thành công, kích hoạt form đánh giá cho User. |

### 3. Yêu cầu dữ liệu
* **Input:** `order_id`, `status` (chuỗi trạng thái mới).
* **Database:** Cập nhật cột `status` trong bảng `orders`.

### 4. Ràng buộc kỹ thuật & Bảo mật
* Chỉ tài khoản có Role `Admin` hoặc `Staff` mới được phép thao tác.
* Không thể lùi trạng thái (ví dụ: Không thể chuyển từ "Hoàn thành" về "Đang xử lý").

### 5. Trường hợp ngoại lệ & Xử lý lỗi
* **Trường hợp:** Hủy đơn hàng đã thanh toán online (VNPay/Momo).
* **Xử lý:** Cập nhật trạng thái "Đã hủy" và kích hoạt quy trình hoàn tiền (Refund logic) ngoài hệ thống, ghi log cẩn thận.
