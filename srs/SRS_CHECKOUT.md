# Software Requirement Specification (SRS)
## Chức năng: Thanh toán & Đặt hàng (Checkout)
**Mã chức năng:** USER-02  
**Trạng thái:** Draft  

---

### 1. Mô tả tổng quan
Xử lý quy trình đặt hàng cuối cùng của User, bao gồm việc nhập địa chỉ giao hàng và lựa chọn phương thức thanh toán trực tuyến (VNPay / MoMo / ZaloPay) hoặc COD.

### 2. Luồng nghiệp vụ (User Workflow)
| Bước | Hành động người dùng | Phản hồi hệ thống |
| :--- | :--- | :--- |
| 1 | Bấm "Thanh toán" từ Giỏ hàng | Chuyển sang trang Checkout, yêu cầu đăng nhập nếu chưa có session. |
| 2 | Nhập thông tin: Tên, SĐT, Địa chỉ giao hàng | Validate dữ liệu đầu vào không được để trống. |
| 3 | Chọn Cổng thanh toán (VNPay/MoMo/ZaloPay) | Lưu thông tin đơn hàng trạng thái "Chờ thanh toán", redirect sang trang của Cổng thanh toán tương ứng. |
| 4 | Thực hiện quét mã/thanh toán trên App | Cổng thanh toán trả kết quả về callback URL của hệ thống. |
| 5 | Hoàn tất | Cập nhật trạng thái đơn hàng thành "Đã thanh toán", trừ tồn kho, gửi email xác nhận. |

### 3. Yêu cầu dữ liệu 
* **Input:** Tên người nhận, SĐT, Địa chỉ chi tiết, Phương thức thanh toán (Enum).
* **Database:** Lưu vào bảng `orders` (thông tin chung) và `order_details` (chi tiết sản phẩm mua).

### 4. Ràng buộc kỹ thuật & Bảo mật 
* Dữ liệu gửi sang VNPay/MoMo/ZaloPay phải được mã hóa chữ ký (Checksum/Signature) bằng Secret Key để chống giả mạo request.
* Bắt buộc dùng HTTPS.

### 5. Trường hợp ngoại lệ & Xử lý lỗi
* **Ngoại lệ:** Người dùng hủy thanh toán trên cổng VNPay/MoMo và quay lại web.
* **Xử lý:** Chuyển đơn hàng sang trạng thái "Đã hủy" hoặc "Thanh toán thất bại" và hiển thị nút "Thử thanh toán lại".
