# Software Requirement Specification (SRS)
## Chức năng: Tìm kiếm và Lọc sản phẩm (Search & Filter)
**Mã chức năng:** USER-03  
**Trạng thái:** Draft  

---

### 1. Mô tả tổng quan
Cho phép người dùng tìm kiếm các sản phẩm thực phẩm tự nhiên thông qua từ khóa (tên sản phẩm, mô tả) và kết hợp với các bộ lọc (mức giá, danh mục, nguồn gốc xuất xứ) để nhanh chóng tìm được mặt hàng mong muốn.

### 2. Luồng nghiệp vụ (User Workflow)
| Bước | Hành động người dùng | Phản hồi hệ thống |
| :--- | :--- | :--- |
| 1 | Nhập từ khóa vào ô tìm kiếm trên Header và nhấn Enter | Gửi request tìm kiếm (GET) lên server với từ khóa tương ứng. |
| 2 | Hoặc: Truy cập trang danh sách sản phẩm và chọn các bộ lọc (VD: Giá dưới 100k, Loại: Rau củ) | Hệ thống tiếp nhận tham số lọc và truy vấn cơ sở dữ liệu. |
| 3 | Hệ thống xử lý truy vấn | Tìm kiếm sử dụng toán tử LIKE hoặc Full-text search kết hợp điều kiện lọc (WHERE). |
| 4 | Trả về kết quả | Hiển thị danh sách các sản phẩm thỏa mãn điều kiện, có phân trang (pagination). |
| 5 | Không tìm thấy kết quả | Hiển thị thông báo: "Không tìm thấy sản phẩm nào phù hợp với tìm kiếm của bạn" và gợi ý một số sản phẩm nổi bật. |

### 3. Yêu cầu dữ liệu
* **Input (Tham số URL):** `keyword` (string), `category_id` (integer), `min_price` (decimal), `max_price` (decimal), `sort_by` (price_asc, price_desc, newest).
* **Database:** Truy vấn chủ yếu trên bảng `products` (cột name, description, price) và join với bảng `categories`.

### 4. Ràng buộc kỹ thuật & Bảo mật
* Các tham số tìm kiếm phải được escape (làm sạch) trước khi đưa vào câu truy vấn SQL để phòng chống lỗi bảo mật SQL Injection.
* Giới hạn độ dài của từ khóa tìm kiếm (ví dụ: tối đa 100 ký tự) để tránh spam request làm chậm server.
* Nên hỗ trợ tính năng Debounce (trì hoãn gửi request vài trăm mili-giây) nếu làm tìm kiếm gợi ý trực tiếp (Live Search) qua AJAX.

### 5. Trường hợp ngoại lệ & Xử lý lỗi
* **Ngoại lệ:** Người dùng nhập các ký tự đặc biệt không hợp lệ (ví dụ: `<script>`, `!@#$%`).
* **Xử lý:** Loại bỏ các ký tự đặc biệt, chỉ giữ lại chữ cái và số, hoặc hiển thị thông báo "Từ khóa chứa ký tự không hợp lệ".

### 6. Giao diện (UI/UX)
* Thanh tìm kiếm hiển thị rõ ràng trên thanh điều hướng (Navbar) ở mọi trang.
* Cột bộ lọc (Sidebar Filter) sử dụng Checkbox (cho danh mục) và Slider (cho khoảng giá) để thao tác trực quan.
* Duy trì các giá trị đã lọc/tìm kiếm trên giao diện để người dùng biết họ đang xem kết quả theo tiêu chí nào.
