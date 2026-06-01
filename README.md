# Website Bán Thực Phẩm Hữu Cơ - Organic Shop

## Tên đề tài

**Xây dựng website bán thực phẩm hữu cơ Organic Shop**

## Giới thiệu website/hệ thống

Organic Shop là hệ thống website hỗ trợ kinh doanh thực phẩm hữu cơ, giúp khách hàng xem danh sách sản phẩm, tìm kiếm và lọc sản phẩm, quản lý giỏ hàng, đặt hàng, thanh toán và theo dõi đơn hàng. Hệ thống cũng có khu vực quản trị để admin quản lý sản phẩm, danh mục, người dùng, đơn hàng, tồn kho, bài viết/blog và theo dõi thông tin tổng quan.

Backend cung cấp REST API bảo mật bằng JWT, tích hợp Swagger/OpenAPI để kiểm thử API, hỗ trợ đăng nhập Google, gửi email, thanh toán VNPay và chatbot AI. Frontend được xây dựng bằng React + Vite, giao tiếp với backend thông qua API.

## Danh sách thành viên

| STT | Họ và tên | MSSV | Vai trò |
| --- | --- | --- | --- |
| 1 | Nguyễn Đức Minh | 23810310259 | Nhóm trưởng |
| 2 | Ngô Đức Dũng | 23810310264 | Thành viên |
| 3 | Vũ Minh Thành | 23810310236 | Thành viên |

## Phân công nhiệm vụ cụ thể

| Thành viên | Nhiệm vụ |
| --- | --- |
| Nguyễn Đức Minh | Phụ trách backend, thiết kế database, xây dựng API xác thực, quản lý người dùng, phân quyền, tích hợp JWT, Swagger/OpenAPI và cấu hình hệ thống. |
| Ngô Đức Dũng | Phụ trách chức năng khách hàng: sản phẩm, danh mục, tìm kiếm/lọc sản phẩm, giỏ hàng, đặt hàng, thanh toán và theo dõi đơn hàng. |
| Vũ Minh Thành | Phụ trách frontend, giao diện người dùng, giao diện quản trị, tích hợp API, hiển thị dữ liệu sản phẩm, đơn hàng, đánh giá, blog và chatbot AI. |

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Axios, Lucide React |
| Backend | Java 17, Spring Boot 3.2.4, Spring Web, Spring Security, Spring Data JPA, Validation |
| Database | MySQL 8.x |
| Cache | Redis |
| API Docs | Swagger / OpenAPI |
| Authentication | JWT, Google OAuth2 |
| Mapping | MapStruct |
| Email | Spring Mail, Gmail SMTP |
| Thanh toán | VNPay Sandbox |
| AI | OpenAI API cấu hình qua biến môi trường |
| Build tools | Maven, npm |

## Chức năng chính

- Đăng ký, đăng nhập, xác thực bằng JWT và đăng nhập Google.
- Xem danh sách sản phẩm, chi tiết sản phẩm, danh mục, tìm kiếm và lọc sản phẩm.
- Quản lý giỏ hàng, đặt hàng, thanh toán VNPay và theo dõi trạng thái đơn hàng.
- Quản lý hồ sơ người dùng, địa chỉ giao hàng, đánh giá và bình luận sản phẩm.
- Quản trị sản phẩm, danh mục, người dùng, đơn hàng, tồn kho và bài viết/blog.
- Tích hợp Swagger để kiểm thử API và chatbot AI hỗ trợ tư vấn sản phẩm.

## Hướng dẫn cài đặt

### Yêu cầu môi trường

- Git
- Java JDK 17
- Maven 3.8+
- Node.js 18+
- npm
- MySQL 8.x
- Redis, nếu dùng chức năng cache

### Clone source code

```bash
git clone https://github.com/thanhbn75/Organic-Shop
cd Organic-Shop
```

### Tạo database

Tạo database MySQL tên `organic_shop`.

```sql
CREATE DATABASE organic_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Cấu hình backend

Mở file `backend/src/main/resources/application.yaml` và kiểm tra các thông tin kết nối:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/organic_shop?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: root
    password: root
```

Nếu máy dùng tài khoản MySQL khác, hãy đổi `DB_USERNAME`, `DB_PASSWORD` hoặc sửa trực tiếp trong file cấu hình. Một số cấu hình có thể đặt bằng biến môi trường:

```bash
DB_URL=jdbc:mysql://localhost:3306/organic_shop
DB_USERNAME=root
DB_PASSWORD=<MAT_KHAU_MYSQL>
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
OPENAI_API_KEY=<OPENAI_API_KEY_NEU_CO>
CLIENT_ID=<GOOGLE_CLIENT_ID_NEU_CO>
CLIENT_SECRET=<GOOGLE_CLIENT_SECRET_NEU_CO>
```

### Cài đặt frontend

```bash
cd frontend
npm install
```

## Hướng dẫn chạy project

### Chạy backend

```bash
cd backend
mvn spring-boot:run
```

Sau khi chạy thành công:

- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

### Chạy frontend

Mở terminal khác:

```bash
cd frontend
npm run dev
```

Sau khi chạy thành công:

- Frontend: `http://localhost:3000`

### Build frontend

```bash
cd frontend
npm run build
```

### Preview frontend sau khi build

```bash
cd frontend
npm run preview
```

## Tài khoản demo

Hệ thống tự tạo tài khoản demo khi backend chạy lần đầu nếu database chưa có dữ liệu tương ứng.

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@organicshop.com` | `Admin@123` |
| User | `user@organicshop.com` | `User@123` |

## Hình ảnh minh họa hệ thống

| Màn hình | Hình ảnh |
| --- | --- |
| Trang chủ | <img width="1920" height="1020" alt="trangchu" src="https://github.com/user-attachments/assets/588f794a-3530-4f20-854e-d6dccb2269f0" />
|
| Danh sách sản phẩm |<img width="1920" height="1020" alt="sanpham" src="https://github.com/user-attachments/assets/f21829e8-0b36-4ac5-88e4-199cdce95acc" />
|
| Chi tiết sản phẩm |<img width="1920" height="1020" alt="ttsanpham" src="https://github.com/user-attachments/assets/3f26e049-3732-4d75-b784-a7736a975181" />
|
| Giỏ hàng |<img width="1920" height="1020" alt="giohang" src="https://github.com/user-attachments/assets/8347d664-ea0a-421f-a0b5-d3e8c92d9d09" />
|
| Thanh toán |<img width="1920" height="1020" alt="thanhtoan" src="https://github.com/user-attachments/assets/df476983-aaf9-494e-b4f5-28012aaa51e5" />
|
| Quản trị |<img width="1920" height="1020" alt="quantri1" src="https://github.com/user-attachments/assets/536b92e8-c968-4dd0-a92a-fd41e595204e" />
<img width="1920" height="1020" alt="quantri2" src="https://github.com/user-attachments/assets/c307f22a-ebec-4864-83b1-d151b3a81df0" />
<img width="1920" height="1020" alt="quantri3" src="https://github.com/user-attachments/assets/d6f6ea6d-8bae-4067-a2e6-3cf4a7c32807" />
<img width="1920" height="1020" alt="quantri4" src="https://github.com/user-attachments/assets/d26165e7-e03d-4c6d-81f0-c4743b9063e3" />
<img width="1920" height="1020" alt="quantri5" src="https://github.com/user-attachments/assets/5d67bde1-76ed-4daa-8e43-31dc86c7c5a8" />
<img width="1920" height="1020" alt="quantri6" src="https://github.com/user-attachments/assets/38bc69dc-df94-4c48-9239-00ab6d083614" />
|

## Link video demo

https://drive.google.com/file/d/1hh7W_QrNx_keDJrwUnfUfVCOGTYTkFGC/view
## Link online đã deploy

https://test-organic-shop.pages.dev/

## Cấu trúc thư mục dự án

```text
Organic-Shop/
├── backend/                  # Source code Spring Boot backend
├── frontend/                 # Source code React + Vite frontend
├── docs/images/              # Ảnh minh họa hệ thống
├── img-data/                 # Ảnh dữ liệu và ảnh màn hình hiện có
├── reports/                  # Báo cáo tiến độ
├── srs/                      # Tài liệu đặc tả yêu cầu phần mềm
├── DECUONG.md
└── README.md
```

## Tài liệu liên quan

- Tài liệu SRS: [`srs`](./srs)
- Báo cáo tiến độ: [`reports`](./reports)
- Ảnh dữ liệu hiện có: [`img-data`](./img-data)

## Ghi chú

- Backend dùng `ddl-auto: update`, vì vậy các bảng sẽ được Hibernate tự tạo hoặc cập nhật theo entity.
- Các cấu hình Google OAuth2, VNPay và OpenAI cần điền thông tin thật nếu triển khai đầy đủ.
- Redis nên được bật nếu muốn sử dụng đầy đủ các chức năng cache.
