# Software Requirement Specification (SRS)
## Chức năng: Quản lý đơn hàng cá nhân (Order History & Tracking)
**Mã chức năng:** USER-04  
**Trạng thái:** Draft  
**Người soạn thảo:** Ngô Đức Dũng  
**Vai trò:** Developer

---

### 1. Mô tả tổng quan
Chức năng cho phép người dùng (User) đã đăng nhập có thể xem lại toàn bộ lịch sử các đơn hàng thực phẩm hữu cơ đã đặt. Khách hàng có thể theo dõi trạng thái giao hàng hiện tại và thực hiện thao tác hủy đơn hàng nếu đơn đó chưa được Admin xử lý.

### 2. Luồng nghiệp vụ (User Workflow)
| Bước | Hành động người dùng | Phản hồi hệ thống |
| :--- | :--- | :--- |
| 1 | Truy cập trang "Tài khoản cá nhân" -> Chọn "Đơn hàng của tôi" | Truy vấn DB, hiển thị danh sách các đơn hàng của user đó (sắp xếp theo thời gian mới nhất). |
| 2 | Bấm "Xem chi tiết" vào một mã đơn hàng cụ thể | Hiển thị thông tin chi tiết: Danh sách sản phẩm, tổng tiền, phương thức thanh toán, địa chỉ nhận và trạng thái hiện tại. |
| 3 | Khách hàng bấm "Hủy đơn hàng" (chỉ hiển thị khi đơn đang ở trạng thái "Đang xử lý") | Hiển thị Popup xác nhận: "Bạn có chắc chắn muốn hủy đơn hàng này không?". |
| 4 | Xác nhận "Đồng ý" hủy | Cập nhật trạng thái đơn hàng thành "Đã hủy", hoàn lại số lượng tồn kho (nếu có), hiển thị thông báo thành công. |
| 5 | Xem tiến trình giao hàng | Hiển thị thanh tiến trình (Timeline): Đang xử lý -> Đang giao -> Đã giao thành công. |

### 3. Yêu cầu dữ liệu
* **Input (Tham số URL/Nút bấm):** `order_id` (integer) để xem chi tiết hoặc gửi request hủy đơn.
* **Database:** * Truy vấn bảng `orders` (điều kiện `user_id` khớp với người đang đăng nhập).
  * Truy vấn bảng `order_details` để lấy danh sách sản phẩm trong đơn.
  * Các trạng thái (Status): `pending` (Đang xử lý), `shipping` (Đang giao), `completed` (Đã giao), `cancelled` (Đã hủy).

### 4. Ràng buộc kỹ thuật & Bảo mật
* **Authorization:** Phải kiểm tra quyền sở hữu. Người dùng `user_id = A` tuyệt đối không được phép xem hoặc hủy đơn hàng của `user_id = B` (ngay cả khi họ cố tình đổi tham số `order_id` trên thanh URL). Trả về lỗi 403 Forbidden nếu vi phạm.
* **Logic Hủy đơn:** Nút "Hủy đơn" chỉ được phép hiển thị và hoạt động (cả frontend lẫn backend) khi status của đơn hàng là `pending` (Đang xử lý).

### 5. Trường hợp ngoại lệ & Xử lý lỗi
* **Ngoại lệ:** Khách hàng dùng phần mềm thứ 3 (như Postman) gửi request ép buộc hủy một đơn hàng đang ở trạng thái "Đang giao" hoặc "Đã giao".
* **Xử lý:** Backend từ chối request, không cập nhật Database và trả về thông báo lỗi: "Không thể hủy đơn hàng đã được xuất kho và đang giao".

### 6. Giao diện (UI/UX)
* Danh sách đơn hàng nên hiển thị dạng thẻ (Card) hoặc bảng (Table) có màu sắc phân biệt trạng thái (VD: Xanh lá cho Đã giao, Vàng cho Đang xử lý, Đỏ cho Đã hủy).
* Nút Hủy đơn có màu đỏ cảnh báo.
