# Software Requirement Specification (SRS)
## Chức năng: Quản lý Sản phẩm (Product Management)
**Mã chức năng:** ADMIN-01  
**Trạng thái:** Draft  

---

### 1. Mô tả tổng quan
Khu vực dành riêng cho Admin để thực hiện các thao tác CRUD (Thêm, Sửa, Xóa) thông tin thực phẩm tự nhiên, quản lý giá bán, hình ảnh và kiểm soát tồn kho.

### 2. Luồng nghiệp vụ (User Workflow)
| Bước | Hành động của Admin | Phản hồi hệ thống |
| :--- | :--- | :--- |
| 1 | Truy cập Dashboard -> Quản lý sản phẩm | Hiển thị bảng danh sách sản phẩm hiện có (có phân trang). |
| 2 | Bấm "Thêm sản phẩm mới" | Hiển thị Form nhập liệu (Tên, Mô tả, Giá, Danh mục, Tồn kho, Upload Ảnh). |
| 3 | Điền thông tin và bấm "Lưu" | Validate dữ liệu. Upload file ảnh lên Server/Cloud. Lưu record vào Database. |
| 4 | Bấm "Sửa" hoặc "Xóa" một sản phẩm | Cập nhật lại thông tin mới hoặc đánh dấu xóa mềm (Soft Delete) khỏi hệ thống. |

### 3. Yêu cầu dữ liệu 
* **Input:** Tên SP (string), Mô tả (text), Giá (decimal), Số lượng tồn kho (integer), Hình ảnh (file png/jpg).
* **Database:** Bảng `products`. Các trường bắt buộc không được NULL.

### 4. Ràng buộc kỹ thuật & Bảo mật 
* **Phân quyền:** Chỉ tài khoản có Role = `Admin` mới được truy cập các Route này (Middleware Authorization).
* Kích thước ảnh upload tối đa 2MB, chỉ nhận định dạng hình ảnh hợp lệ.

### 5. Trường hợp ngoại lệ & Xử lý lỗi
* **Ngoại lệ:** Admin vô tình xóa một sản phẩm đang nằm trong các Đơn hàng (Orders) đã đặt.
* **Xử lý:** Không xóa cứng dữ liệu trong DB mà áp dụng Soft Delete (ẩn sản phẩm trên frontend), hoặc báo lỗi "Không thể xóa sản phẩm đã phát sinh giao dịch".
