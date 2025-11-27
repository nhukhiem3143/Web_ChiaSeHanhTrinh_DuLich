# 🌴 Website Chia Sẻ Trải Nhiệm và Hành Trình Du Lịch  
Nền tảng chia sẻ kinh nghiệm du lịch toàn diện được xây dựng bằng Node.js, Express.js và MSSQL, bao gồm xác thực người dùng, quản lý nội dung, tương tác xã hội và thiết kế đáp ứng.

# Link Youtube
https://youtu.be/wK3VD_rZh2g  

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Tính Năng](#tính-năng)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt](#cài-đặt)
- [Cấu Hình](#cấu-hình)
- [Cách Sử Dụng](#cách-sử-dụng)
- [Lược Đồ Cơ Sở Dữ Liệu](#lược-đồ-cơ-sở-dữ-liệu)
- [Kiểm Thử](#kiểm-thử)
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

## 🛠 Công Nghệ Sử Dụng

### Backend
- **Runtime**: Node.js 18.x+
- **Framework**: Express.js 4.x
- **Cơ Sở Dữ Liệu**: Microsoft SQL Server 2017+
- **Xác Thực**: JSON Web Tokens (JWT)
- **Bảo Mật**: bcrypt để mã hóa mật khẩu
- **Tải Lên File**: Multer

### Frontend
- **Markup**: HTML5
- **Styling**: CSS3 với thiết kế đáp ứng
- **Scripting**: JavaScript thuần (ES6+)
- **HTTP Client**: Fetch API
- **Xử Lý Hình Ảnh**: API tải lên file gốc

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
- **Admin Panel**: Truy cập qua xác thực người dùng

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

#### Trang đăng ký
<img width="1776" height="1017" alt="Screenshot 2025-11-23 230057" src="https://github.com/user-attachments/assets/0150a0f2-c15f-4c73-a94a-a4f0862df3cd" />

#### Trang đăng nhập
<img width="1417" height="876" alt="Screenshot 2025-11-23 234707" src="https://github.com/user-attachments/assets/5746791c-0669-4b7f-880c-f42f5140d41f" />

#### Trang chủ  
<img width="1417" height="876" alt="Screenshot 2025-11-23 234707" src="https://github.com/user-attachments/assets/9cb06d65-3e99-4ed6-ac66-4ad73fda95d0" />

#### Trang cá nhân người dùng
<img width="1240" height="879" alt="Screenshot 2025-11-23 234826" src="https://github.com/user-attachments/assets/5c5e1742-0667-4dcf-9085-77d812583247" />
<img width="945" height="478" alt="image" src="https://github.com/user-attachments/assets/0815dfac-233a-45af-8d8a-ae92ae95d32f" />

#### Đăng bài viết mới
<img width="810" height="719" alt="image" src="https://github.com/user-attachments/assets/2fdc9394-f57c-491c-b7ee-e997fd60ec24" />  
<img width="577" height="632" alt="image" src="https://github.com/user-attachments/assets/7aca040c-7b03-4268-837c-56125ba74f1e" />  
<img width="568" height="708" alt="image" src="https://github.com/user-attachments/assets/60a26bc5-8104-4d2e-a8e4-38c0752b53f9" />  

#### Trang quản trị viên
<img width="1852" height="873" alt="Screenshot 2025-11-24 010649" src="https://github.com/user-attachments/assets/237f4eab-9601-423f-baa6-b934787cfdc2" />

##### Quản lý các bài viết
<img width="1844" height="887" alt="Screenshot 2025-11-24 011226" src="https://github.com/user-attachments/assets/7e772343-bd04-4cd0-a56e-3c6b486a7bd2" />

##### Quản lý người dùng
<img width="1866" height="882" alt="Screenshot 2025-11-24 011232" src="https://github.com/user-attachments/assets/e5fba9d3-f7e0-4045-8e2a-aff91dec8411" />

##### Quản lý báo cáo
<img width="1871" height="965" alt="Screenshot 2025-11-24 011236" src="https://github.com/user-attachments/assets/4e2faffb-856f-4f46-8ad2-2e88608a2aad" />

**Người Duy Trì Dự Án**: Nguyễn Như Khiêm
- **Email**: nhukhiem24@gmail.com
- **GitHub**: [@nhukhiem3143](https://github.com/nhukhiem3143)

**Repository Dự Án**: [https://github.com/nhukhiem3143/Web_ChiaSeHanhTrinh_DuLich](https://github.com/nhukhiem3143/Web_ChiaSeHanhTrinh_DuLich)

