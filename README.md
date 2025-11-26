# 🌴 Website Chia Sẻ Trải Nhiệm và Hành Trình Du Lịch  
Nền tảng chia sẻ kinh nghiệm du lịch toàn diện được xây dựng bằng Node.js, Express.js và MSSQL, bao gồm xác thực người dùng, quản lý nội dung, tương tác xã hội và thiết kế đáp ứng.

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Tính Năng](#tính-năng)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt](#cài-đặt)
- [Cấu Hình](#cấu-hình)
- [Cách Sử Dụng](#cách-sử-dụng)
- [Tài Liệu API](#tài-liệu-api)
- [Lược Đồ Cơ Sở Dữ Liệu](#lược-đồ-cơ-sở-dữ-liệu)
- [Kiểm Thử](#kiểm-thử)
- [Triển Khai](#triển-khai)
- [Đóng Góp](#đóng-góp)
- [Liên Hệ](#liên-hệ)

## 🎯 Tổng Quan

Nền Tảng Blog Du Lịch là ứng dụng web toàn diện cho phép người dùng chia sẻ trải nghiệm du lịch thông qua các bài viết phong phú. Nền tảng hỗ trợ đăng ký và xác thực người dùng, tạo nội dung với hỗ trợ đa phương tiện, tương tác xã hội bao gồm reactions và bình luận, cùng các tính năng quản lý nội dung toàn diện.

## ✨ Tính Năng

### 🔐 Xác Thực & Phân Quyền
- Đăng ký và đăng nhập người dùng với xác thực dựa trên JWT
- Mã hóa mật khẩu an toàn bằng bcrypt
- Xác thực và làm sạch dữ liệu đầu vào
- Quản lý phiên với làm mới token

### 📝 Quản Lý Nội Dung
- Tạo bài viết blog phong phú với tải lên hình ảnh
- Hệ thống phân loại và gắn thẻ bài viết
- Tích hợp lịch trình du lịch (ngày tháng, địa điểm, chi phí)
- Kiểm duyệt nội dung và quản lý người dùng

### 💬 Tương Tác Xã Hội
- Hệ thống reaction đa loại (thích, yêu thích, cười, tức giận, v.v.)
- Hệ thống bình luận lồng nhau
- Chức năng chia sẻ bài viết
- Thống kê tương tác thời gian thực

### 👤 Quản Lý Người Dùng
- Quản lý hồ sơ người dùng với tải lên avatar
- Bảng điều khiển cá nhân để quản lý nội dung
- Theo dõi hoạt động và phân tích

### 🎨 Giao Diện Người Dùng
- Thiết kế đáp ứng được tối ưu cho máy tính để bàn và di động
- UI/UX hiện đại với điều hướng trực quan
- Quản lý tải lên và thư viện hình ảnh
- Xác thực biểu mẫu thời gian thực

## 🛠 Công Nghệ Sử Dụng

### Backend
- **Runtime**: Node.js 18.x+
- **Framework**: Express.js 4.x
- **Cơ Sở Dữ Liệu**: Microsoft SQL Server 2017+
- **Xác Thực**: JSON Web Tokens (JWT)
- **Bảo Mật**: bcrypt để mã hóa mật khẩu
- **Tải Lên File**: Multer
- **CORS**: Chia sẻ tài nguyên cross-origin

### Frontend
- **Markup**: HTML5
- **Styling**: CSS3 với thiết kế đáp ứng
- **Scripting**: JavaScript thuần (ES6+)
- **HTTP Client**: Fetch API
- **Xử Lý Hình Ảnh**: API tải lên file gốc

### Công Cụ Phát Triển
- **Quản Lý Phiên Bản**: Git
- **Quản Lý Gói**: npm
- **Client Cơ Sở Dữ Liệu**: SQL Server Management Studio
- **Kiểm Thử API**: Postman/Insomnia

## 📁 Cấu Trúc Dự Án

```
web/
│
├── backend/                          # Ứng dụng backend
│   ├── controllers/                  # Xử lý yêu cầu
│   │   ├── baiVietController.js      # Logic quản lý bài viết
│   │   └── nguoiDungController.js    # Logic quản lý người dùng
│   │
│   ├── routes/                       # Định nghĩa route API
│   │   └── api.js                    # Route API chính
│   │
│   ├── uploads/                      # Thư mục tải lên file
│   │
│   ├── database.js                   # Kết nối cơ sở dữ liệu
│   ├── server.js                     # Điểm vào ứng dụng
│   └── package.json                  # Dependencies và scripts
│
├── frontend/                         # Ứng dụng frontend
│   ├── css/                          # Stylesheets
│   │   ├── style.css                 # Styles toàn cục
│   │   ├── trang-chu.css             # Styles trang chủ
│   │   ├── auth.css                  # Styles xác thực
│   │   ├── dang-bai.css              # Styles tạo bài viết
│   │   ├── admin.css                 # Styles trang Admin
│   │   └── ca-nhan.css               # Styles trang cá nhân
│   │
│   ├── js/                           # Scripts phía client
│   │   ├── trang-chu.js              # Logic trang chủ
│   │   ├── dang-ky.js                # Logic đăng ký
│   │   ├── dang-nhap.js              # Logic đăng nhập
│   │   ├── dang-bai.js               # Logic tạo bài viết
│   │   ├── xem-bai.js                # Logic chi tiết bài viết
│   │   ├── admin.js                  # Logic trang Admin
│   │   └── ca-nhan.js                # Logic trang cá nhân
│   │
│   └── page/                         # Trang HTML
│       ├── index.html                # Trang chủ
│       ├── dang-ky.html              # Trang đăng ký
│       ├── dang-nhap.html            # Trang đăng nhập
│       ├── dang-bai.html             # Trang tạo bài viết
│       ├── xem-bai.html              # Trang chi tiết bài viết
│       ├── admin.html                # Trang Admin
│       └── ca-nhan.html              # Trang cá nhân
│
├── database/                         # Scripts cơ sở dữ liệu
│   └── tao-bang.sql                  # Lược đồ cơ sở dữ liệu
│
├── .gitignore                        # Quy tắc git ignore
└── README.md                         # Tài liệu dự án
```

## 💻 Yêu Cầu Hệ Thống

### Yêu Cầu Hệ Thống
- **Hệ Điều Hành**: Windows 10+, Linux (Ubuntu 18.04+), hoặc macOS 10.14+
- **Bộ Nhớ**: Tối thiểu 4GB RAM (khuyến nghị 8GB)
- **Lưu Trữ**: 500MB dung lượng trống

### Phụ Thuộc Phần Mềm
- **Node.js**: Phiên bản 18.0.0 trở lên
- **npm**: Phiên bản 8.0.0 trở lên (đi kèm với Node.js)
- **Microsoft SQL Server**: 2017 trở lên
- **SQL Server Management Studio**: Để quản lý cơ sở dữ liệu
- **Git**: Để quản lý phiên bản

### Yêu Cầu Mạng
- Kết nối internet để cài đặt gói
- Truy cập mạng cục bộ để kết nối cơ sở dữ liệu

## 📦 Cài Đặt

### 1. Clone Repository
```bash
git clone <repository-url>
cd web
```

### 2. Thiết Lập Backend
```bash
cd backend
npm install
```

### 3. Thiết Lập Cơ Sở Dữ Liệu
1. Cài đặt Microsoft SQL Server
2. Tạo cơ sở dữ liệu mới
3. Thực thi script lược đồ:
   ```sql
   -- Chạy nội dung của database/tao-bang.sql trong SQL Server Management Studio
   ```
## ⚙️ Cấu Hình

### Cấu Hình Cơ Sở Dữ Liệu
Cập nhật cài đặt kết nối cơ sở dữ liệu trong `backend/database.js` hoặc sử dụng biến môi trường như trên.

### Cấu Hình Tải Lên File
Ứng dụng hỗ trợ tải lên hình ảnh với các ràng buộc sau:
- **Kích thước file tối đa**: 5MB mỗi hình ảnh
- **Định dạng cho phép**: JPEG, PNG, GIF
- **Vị trí lưu trữ**: `backend/uploads/`

### Cấu Hình Bảo Mật
- Thay đổi `JWT_SECRET` thành chuỗi ngẫu nhiên mạnh trong production
- Cấu hình cài đặt CORS cho domain production
- Thiết lập HTTPS trong môi trường production

## 🚀 Cách Sử Dụng

### Chế Độ Phát Triển

1. **Khởi Động Server Backend**:
   ```bash
   cd backend
   npm start
   ```
   Server sẽ khởi động trên `http://localhost:3000`

2. **Khởi Động Frontend**:
   - Mở `frontend/page/index.html` trong trình duyệt web
   - Hoặc sử dụng extension server cục bộ trong IDE
   - Hoặc phục vụ với bất kỳ server file tĩnh nào

### Truy Cập Ứng Dụng

- **Frontend**: Mở `http://localhost:3000` trong trình duyệt
- **API Base URL**: `http://localhost:3000/api`
- **Admin Panel**: Truy cập qua xác thực người dùng

## 📚 Tài Liệu API

### Xác Thực

Tất cả endpoints đã xác thực yêu cầu header sau:
```
Authorization: Bearer <jwt_token>
```

### Endpoints Cốt Lõi

#### Xác Thực
- `POST /api/dang-ky` - Đăng ký người dùng
- `POST /api/dang-nhap` - Đăng nhập người dùng

#### Bài Viết
- `GET /api/bai-viet` - Lấy tất cả bài viết
- `GET /api/bai-viet/:id` - Lấy chi tiết bài viết
- `POST /api/dang-bai` - Tạo bài viết mới
- `GET /api/bai-viet/:id/xem` - Tăng số lượt xem

#### Quản Lý Người Dùng
- `GET /api/nguoi-dung/:id` - Lấy hồ sơ người dùng
- `PUT /api/nguoi-dung/:id` - Cập nhật hồ sơ người dùng

#### Tính Năng Xã Hội
- `GET /api/reaction/:id` - Lấy reactions của bài viết
- `POST /api/reaction` - Thêm/cập nhật reaction
- `GET /api/binh-luan/:id` - Lấy bình luận của bài viết
- `POST /api/binh-luan` - Thêm bình luận
- `GET /api/chia-se/:id` - Lấy số lượt chia sẻ
- `POST /api/chia-se` - Chia sẻ bài viết

#### Dữ Liệu Du Lịch
- `GET /api/dia-diem/:id` - Lấy địa điểm của bài viết
- `GET /api/hashtag/:id` - Lấy hashtag của bài viết

### Định Dạng Phản Hồi

#### Phản Hồi Thành Công
```json
{
  "status": "success",
  "data": { ... },
  "message": "Hoạt động hoàn thành thành công"
}
```

#### Phản Hồi Lỗi
```json
{
  "status": "error",
  "message": "Mô tả lỗi",
  "code": "ERROR_CODE"
}
```

## 🗄️ Lược Đồ Cơ Sở Dữ Liệu

### Bảng Cốt Lõi

1. **NguoiDung** - Tài khoản và hồ sơ người dùng
2. **BaiViet** - Bài viết blog và nội dung
3. **BaiViet_DiaDiem** - Địa điểm du lịch liên kết với bài viết
4. **Hashtag** - Thẻ nội dung
5. **BaiViet_Hashtag** - Quan hệ bài viết-thẻ
6. **IconReaction** - Các loại reaction có sẵn
7. **ReactionBaiViet** - Reactions của người dùng đến bài viết
8. **BinhLuan** - Bình luận và trả lời
9. **ChiaSe** - Hồ sơ chia sẻ bài viết

### Quan Hệ
- Người dùng có thể tạo nhiều bài viết
- Bài viết có thể có nhiều địa điểm, hashtag, reactions và bình luận
- Bình luận hỗ trợ trả lời lồng nhau
- Reactions được liên kết với các loại reaction cụ thể

## 🧪 Kiểm Thử

### Danh Sách Kiểm Thử Thủ Công

#### Xác Thực
- [ ] Đăng ký người dùng với dữ liệu hợp lệ/không hợp lệ
- [ ] Đăng nhập với thông tin đúng/sai
- [ ] Xác thực token JWT và hết hạn
- [ ] Chức năng đặt lại mật khẩu

#### Quản Lý Nội Dung
- [ ] Tạo bài viết với tất cả trường bắt buộc
- [ ] Tải lên và xác thực hình ảnh
- [ ] Chỉnh sửa và xóa bài viết
- [ ] Hiển thị và định dạng nội dung

#### Tính Năng Xã Hội
- [ ] Thêm reactions vào bài viết
- [ ] Tạo bình luận và luồng
- [ ] Chức năng chia sẻ bài viết
- [ ] Cập nhật thời gian thực (nếu được triển khai)

#### Giao Diện Người Dùng
- [ ] Thiết kế đáp ứng trên các kích thước màn hình khác nhau
- [ ] Xác thực biểu mẫu và thông báo lỗi
- [ ] Tải hình ảnh và tối ưu hóa
- [ ] Điều hướng và trải nghiệm người dùng

### Kiểm Thử API

Sử dụng công cụ như Postman hoặc Insomnia để kiểm thử endpoints API:

1. Import collection API (nếu có)
2. Kiểm thử luồng xác thực
3. Xác minh hoạt động CRUD cho tất cả tài nguyên
4. Kiểm thử xử lý lỗi và trường hợp biên

## 🚢 Triển Khai

### Danh Sách Kiểm Tra Production

- [ ] Cập nhật biến môi trường cho production
- [ ] Cấu hình cơ sở dữ liệu production
- [ ] Thiết lập chứng chỉ SSL/TLS
- [ ] Cấu hình reverse proxy (nginx/apache)
- [ ] Thiết lập giám sát và ghi log
- [ ] Cấu hình chiến lược sao lưu
- [ ] Kiểm thử hiệu suất và khả năng mở rộng

## 🤝 Đóng Góp

1. Fork repository
2. Tạo nhánh tính năng (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi của bạn (`git commit -m 'Add amazing feature'`)
4. Push lên nhánh (`git push origin feature/amazing-feature`)
5. Mở Pull Request

**Người Duy Trì Dự Án**: Nguyễn Như Khiêm
- **Email**: nhukhiem24@gmail.com
- **GitHub**: [@nhukhiem3143](https://github.com/nhukhiem3143)

**Repository Dự Án**: [https://github.com/nhukhiem3143/Web_ChiaSeHanhTrinh_DuLich](https://github.com/nhukhiem3143/Web_ChiaSeHanhTrinh_DuLich)

---

**Được xây dựng với ❤️ dành cho những người yêu du lịch**

