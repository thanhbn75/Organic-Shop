# Software Requirement Specification (SRS)
## Chức năng: Giỏ hàng (Shopping Cart)
**Mã chức năng:** USER-01  
**Trạng thái:** Draft  

---

### 1. Mô tả tổng quan
Cho phép người dùng (User) quản lý danh sách các sản phẩm thực phẩm hữu cơ muốn mua. Hỗ trợ thêm mới, xóa sản phẩm, cập nhật số lượng và tự động tính tổng tiền thanh toán.

### 2. Luồng nghiệp vụ (User Workflow)
| Bước | Hành động người dùng | Phản hồi hệ thống |
| :--- | :--- | :--- |
| 1 | Bấm "Thêm vào giỏ" tại trang chi tiết sản phẩm | Kiểm tra số lượng tồn kho. Thêm sản phẩm vào Session/Database giỏ hàng. |
| 2 | Truy cập trang Giỏ hàng | Hiển thị danh sách sản phẩm, giá, số lượng, và Tổng tiền tạm tính. |
| 3 | Thay đổi số lượng (Tăng/Giảm) | Cập nhật lại số lượng trong giỏ, tính toán lại tổng tiền hiển thị ngay lập tức. |
| 4 | Bấm "Xóa" một sản phẩm | Loại bỏ sản phẩm khỏi danh sách, tính lại tổng tiền. |

### 3. Yêu cầu dữ liệu 
* **Input:** Mã sản phẩm (ID), Số lượng (Quantity).
* **Database:** Lưu giỏ hàng tạm trong Session (khách chưa đăng nhập) hoặc bảng `carts` (khách đã đăng nhập).

### 4. Ràng buộc kỹ thuật & Bảo mật 
* Số lượng cập nhật tối đa không được vượt quá số lượng **Tồn kho** thực tế của sản phẩm.
* Các thao tác Thêm/Sửa/Xóa nên dùng AJAX để không phải tải lại toàn bộ trang.

### 5. Trường hợp ngoại lệ & Xử lý lỗi
* **Ngoại lệ:** Sản phẩm trong giỏ hàng vừa hết hàng khi khách hàng đang xem.
* **Xử lý:** Hiển thị cảnh báo màu đỏ: "Sản phẩm hiện đã hết hàng, vui lòng xóa khỏi giỏ" và vô hiệu hóa nút chuyển sang Thanh toán.
