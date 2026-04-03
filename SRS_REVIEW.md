# Software Requirement Specification (SRS)
## Chức năng: Đánh giá & Bình luận (Rating & Review)
**Mã chức năng:** USER-05  
**Trạng thái:** Draft  

### 1. Mô tả tổng quan
Khách hàng có thể để lại nhận xét và chấm điểm (1-5 sao) cho các nông sản họ đã mua.

### 2. Luồng nghiệp vụ
| Bước | Hành động của User | Phản hồi hệ thống |
| :--- | :--- | :--- |
| 1 | Vào đơn hàng "Đã giao", bấm "Đánh giá" | Hiển thị form chấm sao và nhập text. |
| 2 | Gửi đánh giá | Lưu DB, tính toán lại điểm trung bình (Rating) của sản phẩm đó và hiển thị ngoài trang chủ. |

### 3. Yêu cầu dữ liệu
* **Database:** Bảng `reviews` (product_id, user_id, rating_star, comment).

### 4. Ràng buộc kỹ thuật
* Chỉ user **đã mua sản phẩm đó và đơn hàng đã hoàn thành** mới được phép bình luận (Tránh spam review ảo).
