USE [master]
GO

-- 1. Tạo Database (Sử dụng đường dẫn mặc định của SQL Server)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'DuLichWebsite')
BEGIN
    CREATE DATABASE [DuLichWebsite]
END
GO

USE [DuLichWebsite]
GO

-- Bật Full-Text Search (Cần thiết cho tính năng tìm kiếm Hashtag)
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = 'ft_catalog')
    BEGIN
        CREATE FULLTEXT CATALOG [ft_catalog] AS DEFAULT;
    END
END
GO

-- =============================================
-- 2. TẠO CÁC BẢNG (TABLES)
-- =============================================

-- Bảng Người Dùng
CREATE TABLE [dbo].[NguoiDung](
    [id_nguoi_dung] INT IDENTITY(1,1) PRIMARY KEY,
    [ten_dang_nhap] NVARCHAR(100) NOT NULL UNIQUE,
    [mat_khau] NVARCHAR(255) NOT NULL,
    [ho_ten] NVARCHAR(200) NOT NULL,
    [email] NVARCHAR(200) NOT NULL UNIQUE,
    [la_admin] BIT DEFAULT 0,
    [anh_dai_dien] NVARCHAR(255) NULL,
    [tieu_su] NVARCHAR(500) NULL,
    [ngay_tao] DATETIME DEFAULT GETDATE(),
    [ngay_cap_nhat] DATETIME DEFAULT GETDATE(),
    [trang_thai] BIT DEFAULT 1 -- 1: Active, 0: Blocked
)
GO

-- Bảng Bài Viết
CREATE TABLE [dbo].[BaiViet](
    [id_bai_viet] INT IDENTITY(1,1) PRIMARY KEY,
    [id_nguoi_dung] INT NOT NULL,
    [tieu_de] NVARCHAR(255) NOT NULL,
    [mo_ta_ngan] NVARCHAR(500) NULL,
    [noi_dung] NVARCHAR(MAX) NOT NULL,
    [anh_bia] NVARCHAR(255) NULL,
    [ngay_bat_dau] DATE NULL,
    [ngay_ket_thuc] DATE NULL,
    [tong_chi_phi] DECIMAL(15, 2) NULL,
    [ngay_dang] DATETIME DEFAULT GETDATE(),
    [ngay_cap_nhat] DATETIME DEFAULT GETDATE(),
    [luot_xem] INT DEFAULT 0,
    [trang_thai] NVARCHAR(50) DEFAULT N'cong_khai', -- cong_khai, rieng_tu, xoa_mem
    [hashtag] NVARCHAR(MAX) NULL,
    FOREIGN KEY ([id_nguoi_dung]) REFERENCES [dbo].[NguoiDung]([id_nguoi_dung]) ON DELETE CASCADE
)
GO

-- Bảng Hashtag
CREATE TABLE [dbo].[Hashtag](
    [id_hashtag] INT IDENTITY(1,1) PRIMARY KEY,
    [ten_hashtag] NVARCHAR(100) NOT NULL UNIQUE
)
GO

-- Bảng Liên kết Bài Viết - Hashtag
CREATE TABLE [dbo].[BaiViet_Hashtag](
    [id_bai_viet] INT NOT NULL,
    [id_hashtag] INT NOT NULL,
    PRIMARY KEY ([id_bai_viet], [id_hashtag]),
    FOREIGN KEY ([id_bai_viet]) REFERENCES [dbo].[BaiViet]([id_bai_viet]) ON DELETE CASCADE,
    FOREIGN KEY ([id_hashtag]) REFERENCES [dbo].[Hashtag]([id_hashtag])
)
GO

-- Bảng Chi tiết: Địa điểm
CREATE TABLE [dbo].[BaiViet_DiaDiem](
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [id_bai_viet] INT NOT NULL,
    [ten_dia_diem] NVARCHAR(255) NOT NULL,
    [loai_dia_diem] NVARCHAR(50) NOT NULL CHECK ([loai_dia_diem] IN ('hoat_dong', 'nghi_ngoi', 'an_uong', 'tham_quan')),
    [dia_chi] NVARCHAR(500) NULL,
    [gia_tien] DECIMAL(15, 2) NULL,
    [ghi_chu] NVARCHAR(MAX) NULL,
    [anh_dia_diem] NVARCHAR(MAX) NULL,
    FOREIGN KEY ([id_bai_viet]) REFERENCES [dbo].[BaiViet]([id_bai_viet]) ON DELETE CASCADE
)
GO

-- Bảng Chi tiết: Đồ ăn (Có thể gộp vào DiaDiem tùy logic, nhưng giữ nguyên theo DB cũ)
CREATE TABLE [dbo].[BaiViet_DoAn](
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [id_bai_viet] INT NOT NULL,
    [ten] NVARCHAR(255) NOT NULL,
    [dia_chi] NVARCHAR(500) NULL,
    [mon_an] NVARCHAR(MAX) NULL,
    [gia_tb] DECIMAL(15, 2) NULL,
    [danh_gia] NVARCHAR(MAX) NULL,
    [hinh_anh] NVARCHAR(MAX) NULL,
    FOREIGN KEY ([id_bai_viet]) REFERENCES [dbo].[BaiViet]([id_bai_viet]) ON DELETE CASCADE
)
GO

-- Bảng Chi tiết: Khách sạn
CREATE TABLE [dbo].[BaiViet_KhachSan](
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [id_bai_viet] INT NOT NULL,
    [ten] NVARCHAR(255) NOT NULL,
    [dia_chi] NVARCHAR(500) NULL,
    [gia_phong] DECIMAL(15, 2) NULL,
    [so_sao] INT NULL,
    [danh_gia] NVARCHAR(MAX) NULL,
    [hinh_anh] NVARCHAR(MAX) NULL,
    FOREIGN KEY ([id_bai_viet]) REFERENCES [dbo].[BaiViet]([id_bai_viet]) ON DELETE CASCADE
)
GO

-- Bảng Chi tiết: Phương tiện
CREATE TABLE [dbo].[BaiViet_PhuongTien](
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [id_bai_viet] INT NOT NULL,
    [ten_phuong_tien] NVARCHAR(255) NOT NULL,
    [chi_phi] DECIMAL(15, 2) NULL,
    [mo_ta] NVARCHAR(MAX) NULL,
    [hinh_anh] NVARCHAR(MAX) NULL,
    FOREIGN KEY ([id_bai_viet]) REFERENCES [dbo].[BaiViet]([id_bai_viet]) ON DELETE CASCADE
)
GO

-- Bảng Bình Luận
CREATE TABLE [dbo].[BinhLuan](
    [id_binh_luan] INT IDENTITY(1,1) PRIMARY KEY,
    [id_bai_viet] INT NOT NULL,
    [id_nguoi_dung] INT NOT NULL,
    [noi_dung] NVARCHAR(1000) NOT NULL,
    [ngay_binh_luan] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([id_bai_viet]) REFERENCES [dbo].[BaiViet]([id_bai_viet]) ON DELETE CASCADE,
    FOREIGN KEY ([id_nguoi_dung]) REFERENCES [dbo].[NguoiDung]([id_nguoi_dung])
)
GO

-- Bảng Reaction (Like/Love/...)
CREATE TABLE [dbo].[ReactionBaiViet](
    [id_reaction] INT IDENTITY(1,1) PRIMARY KEY,
    [id_bai_viet] INT NOT NULL,
    [id_nguoi_dung] INT NOT NULL,
    [id_icon] NVARCHAR(20) NOT NULL CHECK ([id_icon] IN ('dislike', 'angry', 'cry', 'laugh', 'love', 'like')),
    [ngay_reaction] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([id_bai_viet]) REFERENCES [dbo].[BaiViet]([id_bai_viet]) ON DELETE CASCADE,
    FOREIGN KEY ([id_nguoi_dung]) REFERENCES [dbo].[NguoiDung]([id_nguoi_dung]),
    CONSTRAINT [UQ_reaction] UNIQUE ([id_bai_viet], [id_nguoi_dung]) -- Mỗi người chỉ react 1 lần/bài
)
GO

-- Bảng Chia sẻ
CREATE TABLE [dbo].[ChiaSe](
    [id_chia_se] INT IDENTITY(1,1) PRIMARY KEY,
    [id_bai_viet] INT NOT NULL,
    [id_nguoi_dung] INT NOT NULL,
    [noi_dung] NVARCHAR(500) NULL,
    [ngay_chia_se] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([id_bai_viet]) REFERENCES [dbo].[BaiViet]([id_bai_viet]) ON DELETE CASCADE,
    FOREIGN KEY ([id_nguoi_dung]) REFERENCES [dbo].[NguoiDung]([id_nguoi_dung])
)
GO

-- Bảng Báo cáo vi phạm
CREATE TABLE [dbo].[BaoCaoBaiViet](
    [id_bao_cao] INT IDENTITY(1,1) PRIMARY KEY,
    [id_bai_viet] INT NOT NULL,
    [id_nguoi_dung] INT NOT NULL,
    [ly_do] NVARCHAR(MAX) NULL,
    [trang_thai] NVARCHAR(50) DEFAULT N'cho_xu_ly', -- cho_xu_ly, da_xu_ly, bo_qua
    [ngay_bao_cao] DATETIME DEFAULT GETDATE(),
    [ghi_chu_admin] NVARCHAR(MAX) NULL,
    FOREIGN KEY ([id_bai_viet]) REFERENCES [dbo].[BaiViet]([id_bai_viet]) ON DELETE CASCADE,
    FOREIGN KEY ([id_nguoi_dung]) REFERENCES [dbo].[NguoiDung]([id_nguoi_dung])
)
GO

-- Bảng Icon
CREATE TABLE [dbo].[Icon](
    [id_icon] NVARCHAR(20) PRIMARY KEY,
    [ten_icon] NVARCHAR(50),
    [anh_icon] NVARCHAR(255)
)
GO

-- =============================================
-- 3. STORED PROCEDURES
-- =============================================

-- Proc 1: Lấy bài viết theo Hashtag (Tìm kiếm)
CREATE PROCEDURE [dbo].[sp_LayBaiVietTheoHashtag]
    @ten_hashtag NVARCHAR(100)
AS
BEGIN
    DECLARE @sql NVARCHAR(MAX) = '
    SELECT bv.*, COUNT(*) OVER() AS total_count
    FROM BaiViet bv
    WHERE CONTAINS(hashtag, @search_term)
    AND bv.trang_thai = N''cong_khai''
    ORDER BY bv.ngay_dang DESC';
    
    DECLARE @search_term NVARCHAR(100) = '"' + @ten_hashtag + '"';
    
    EXEC sp_executesql @sql, N'@search_term NVARCHAR(100)', @search_term = @search_term;
END
GO

-- Proc 2: Tăng lượt xem
CREATE PROCEDURE [dbo].[sp_TangLuotXem]
    @id_bai_viet INT
AS
BEGIN
    UPDATE BaiViet 
    SET luot_xem = luot_xem + 1 
    WHERE id_bai_viet = @id_bai_viet;
END;
GO

-- Proc 3: Thống kê bài viết (View, Comment, Share)
CREATE PROCEDURE [dbo].[sp_ThongKeBaiViet]
    @id_bai_viet INT
AS
BEGIN
    SELECT
        bv.id_bai_viet,
        bv.tieu_de,
        bv.luot_xem,
        (SELECT COUNT(*) FROM BinhLuan WHERE id_bai_viet = bv.id_bai_viet) AS tong_binh_luan,
        (SELECT COUNT(*) FROM ChiaSe WHERE id_bai_viet = bv.id_bai_viet) AS tong_chia_se,
        (SELECT COUNT(*) FROM ReactionBaiViet WHERE id_bai_viet = bv.id_bai_viet) AS tong_reaction
    FROM BaiViet bv
    WHERE bv.id_bai_viet = @id_bai_viet;
END
GO

-- Proc 4: Thống kê Dashboard Admin
CREATE PROCEDURE [dbo].[sp_ThongKeAdmin]
AS
BEGIN
    SELECT
        COUNT(*) AS tong_posts,
        SUM(ISNULL(luot_xem, 0)) AS tong_views,
        AVG(ISNULL(tong_chi_phi, 0)) AS chi_phi_tb,
        COUNT(DISTINCT id_nguoi_dung) AS tong_users
    FROM BaiViet
    WHERE trang_thai = N'cong_khai';
END
GO