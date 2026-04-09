# 🛒 Website Bán Thực Phẩm Tự Nhiên (Organic Shop)

> **Đề tài thực tập tốt nghiệp** — Lớp LTWNC-D18CNPM2

Hệ thống website hỗ trợ người dùng tìm kiếm sản phẩm hữu cơ, quản lý giỏ hàng, đặt hàng và theo dõi đơn hàng. Phía quản trị hỗ trợ quản lý sản phẩm, danh mục, người dùng và đơn hàng.

---

## 👥 Thành viên nhóm

| STT | Họ và tên | MSSV | Vai trò |
|---|---|---|---|
| 1 | Nguyễn Đức Minh | 23810310259 | Nhóm trưởng |
| 2 | Ngô Đức Dũng | 23810310264 | Thành viên |
| 3 | Vũ Minh Thành | 23810310236 | Thành viên |

---

## 🚀 Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | Đang cập nhật |
| Backend | Java 17, Spring Boot 3, Spring Security, Spring Data JPA |
| Database | MySQL |
| API Docs | Swagger / OpenAPI |
| Thanh toán | VNPay / MoMo (cấu hình mẫu) |

---

## 📋 Tài liệu Đặc tả Yêu cầu Phần mềm (SRS)

Các tài liệu SRS được lưu trong thư mục [`/srs/`](./srs/).

| Mã | Chức năng | Tài liệu | Trạng thái |
|---|---|---|---|
| USER-01 | Giỏ hàng | [SRS_CART.md](./srs/SRS_CART.md) | ✅ 100% |
| USER-02 | Thanh toán & Đặt hàng | [SRS_CHECKOUT.md](./srs/SRS_CHECKOUT.md) | ✅ 100% |
| USER-03 | Tìm kiếm & Lọc sản phẩm | [SRS_SEARCH.md](./srs/SRS_SEARCH.md) | ✅ 100% |
| USER-04 | Quản lý đơn hàng | [SRS_USER_ORDER.md](./srs/SRS_USER_ORDER.md) | ✅ 100% |
| USER-05 | Đánh giá & Bình luận | [SRS_REVIEW.md](./srs/SRS_REVIEW.md) | 🔄 Đang cập nhật |
| USER-06 | Quản lý hồ sơ người dùng | [SRS_USER_PROFILE.md](./srs/SRS_USER_PROFILE.md) | ✅ 100% |
| ADMIN-01 | Quản lý sản phẩm | [SRS_ADMIN_PRODUCT.md](./srs/SRS_ADMIN_PRODUCT.md) | ✅ 100% |
| ADMIN-02 | Quản lý đơn hàng | [SRS_ADMIN_ORDER.md](./srs/SRS_ADMIN_ORDER.md) | ✅ 100% |
| ADMIN-03 | Quản lý người dùng & phân quyền | [SRS_ADMIN_USER.md](./srs/SRS_ADMIN_USER.md) | ✅ 100% |
| ADMIN-04 | Quản lý tin tức / blog | [SRS_BLOG.md](./srs/SRS_BLOG.md) | ⏳ Chưa triển khai |

---

## 🗂️ Cấu trúc thư mục dự án

```text
Organic-Shop/
├── backend/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/organicshop/backend/
│           │   ├── config/           # Cấu hình bảo mật, OpenAPI, khởi tạo dữ liệu
│           │   ├── controller/       # REST API controllers
│           │   ├── dto/              # Data Transfer Objects
│           │   ├── entity/           # JPA entities
│           │   ├── repository/       # Spring Data JPA repositories
│           │   ├── security/         # JWT, UserDetails, filter
│           │   ├── service/          # Service interfaces
│           │   └── service/impl/     # Service implementations
│           └── resources/
│               └── application.yaml  # Cấu hình hệ thống
├── frontend/                         # Chưa cập nhật mã nguồn hoàn chỉnh
├── reports/                          # Báo cáo tiến độ
├── srs/                              # Tài liệu đặc tả chức năng
├── DECUONG.md
├── data.txt
└── README.md
```

---

## 📈 Tiến độ dự án

**Hoàn thành: 50%**

### ✅ Hoàn thành
- Xác thực người dùng: đăng ký, đăng nhập bằng JWT
- Quản lý sản phẩm, danh mục, giỏ hàng, đơn hàng
- Quản lý hồ sơ người dùng
- Tích hợp Swagger để kiểm thử API
- Khởi tạo tài khoản mặc định khi chạy backend

### 🔄 Đang làm
- Hoàn thiện đánh giá / bình luận sản phẩm
- Hoàn thiện tích hợp thanh toán

### ⏳ Chưa làm
- Hoàn thiện frontend
- Hoàn thiện module blog / tin tức

---

## ⚙️ Hướng dẫn cài đặt & Chạy Code

### **Yêu cầu**
- Git
- Java JDK 17
- Maven 3.8+
- MySQL 8.x

### **Bước 1: Clone dự án**
```bash
git clone <LINK_GIT_CUA_DU_AN>
cd Organic-Shop
```

### **Bước 2: Tạo database**
Tạo database MySQL tên `organic_shop`.

```sql
CREATE DATABASE organic_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### **Bước 3: Kiểm tra cấu hình kết nối**
Mở file `backend/src/main/resources/application.yaml` và kiểm tra:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/organic_shop?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: root
    password: Nguyen123456789-
```

Nếu máy bạn dùng tài khoản MySQL khác thì sửa lại `username` và `password`.

### **Bước 4: Chạy backend**
```bash
cd backend
mvn spring-boot:run
```

Sau khi chạy thành công:

- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`

### **Tài khoản mặc định**
- Admin: `admin@organicshop.com` / `Admin@123`
- User: `user@organicshop.com` / `User@123`

---

## 🔧 Thông tin backend

### API chính
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/products`
- `GET /api/categories`
- `GET /api/users/me`
- `POST /api/orders`

### Khởi tạo dữ liệu mặc định
File `backend/src/main/java/com/organicshop/backend/config/InitialApp.java` sẽ tự tạo tài khoản mặc định nếu chưa tồn tại trong database.

---

## 📝 Ghi chú

- Backend dùng `Spring Boot + JPA + MySQL + JWT`
- Hibernate đang cấu hình `ddl-auto: update`, vì vậy bảng sẽ được tự tạo/cập nhật theo entity
- Thư mục `frontend` hiện chưa có cấu hình chạy hoàn chỉnh
- Các cấu hình thanh toán hiện ở mức mẫu, cần điền thông tin thực tế nếu triển khai thật

---

*Hà Nội, 09 tháng 04 năm 2026*
