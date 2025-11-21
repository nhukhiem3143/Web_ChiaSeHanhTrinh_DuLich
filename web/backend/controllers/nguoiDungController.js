const { sql } = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';

// Validation helpers
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const dangKy = async (req, res) => {
    const { ten_dang_nhap, mat_khau, email, ho_ten } = req.body;
    
    // Validation
    if (!ten_dang_nhap || !mat_khau || !email || !ho_ten) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }
    
    if (ten_dang_nhap.length < 3) {
        return res.status(400).json({ message: 'Tên đăng nhập phải có ít nhất 3 ký tự' });
    }
    
    if (mat_khau.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    
    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Email không hợp lệ' });
    }
    
    try {
        // Check if username exists
        const checkUser = await sql.query`
            SELECT id_nguoi_dung FROM NguoiDung WHERE ten_dang_nhap = ${ten_dang_nhap}
        `;
        if (checkUser.recordset.length > 0) {
            return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' });
        }
        
        // Check if email exists
        const checkEmail = await sql.query`
            SELECT id_nguoi_dung FROM NguoiDung WHERE email = ${email}
        `;
        if (checkEmail.recordset.length > 0) {
            return res.status(409).json({ message: 'Email đã được sử dụng' });
        }
        
        const hashedPassword = await bcrypt.hash(mat_khau, 10);
        await sql.query`
            INSERT INTO NguoiDung (ten_dang_nhap, mat_khau, ho_ten, email) 
            VALUES (${ten_dang_nhap}, ${hashedPassword}, ${ho_ten}, ${email})
        `;
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        res.status(500).json({ message: 'Lỗi đăng ký. Vui lòng thử lại sau' });
    }
};

const dangNhap = async (req, res) => {
    const { ten_dang_nhap, mat_khau } = req.body;
    
    // Validation
    if (!ten_dang_nhap || !mat_khau) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }
    
    try {
        const result = await sql.query`
            SELECT * FROM NguoiDung 
            WHERE ten_dang_nhap = ${ten_dang_nhap} AND trang_thai = 1
        `;
        const user = result.recordset[0];
        
        if (!user) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }
        
        const isPasswordValid = await bcrypt.compare(mat_khau, user.mat_khau);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }
        
        const token = jwt.sign(
            { 
                id: user.id_nguoi_dung, 
                ten_dang_nhap: user.ten_dang_nhap,
                la_admin: user.la_admin || false
            }, 
            SECRET,
            { expiresIn: '7d' }
        );
        
        const vai_tro = user.la_admin ? 'admin' : 'user';
        console.log('Backend vai_tro:', vai_tro);
        res.json({
            token,
            id_nguoi_dung: user.id_nguoi_dung,
            ten_dang_nhap: user.ten_dang_nhap,
            ho_ten: user.ho_ten,
            email: user.email,
            vai_tro
        });
    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ message: 'Lỗi đăng nhập. Vui lòng thử lại sau' });
    }
};

const getUser = async (req, res) => {
    const { id } = req.params;
    
    if (parseInt(id) !== req.userId) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    try {
        const result = await sql.query`
            SELECT 
                id_nguoi_dung, 
                ten_dang_nhap, 
                ho_ten, 
                email, 
                anh_dai_dien, 
                tieu_su, 
                ngay_tao, 
                ngay_cap_nhat
            FROM NguoiDung 
            WHERE id_nguoi_dung = ${id} AND trang_thai = 1
        `;
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi lấy thông tin người dùng:', err);
        res.status(500).json({ message: 'Lỗi lấy thông tin người dùng' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    
    if (parseInt(id) !== req.userId) {
        return res.status(403).json({ message: 'Không có quyền cập nhật' });
    }
    
    const { tieu_su } = req.body;
    const anh_dai_dien = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
        if (anh_dai_dien) {
            await sql.query`
                UPDATE NguoiDung 
                SET tieu_su = ${tieu_su || null}, 
                    anh_dai_dien = ${anh_dai_dien}, 
                    ngay_cap_nhat = GETDATE() 
                WHERE id_nguoi_dung = ${id}
            `;
        } else {
            await sql.query`
                UPDATE NguoiDung 
                SET tieu_su = ${tieu_su || null}, 
                    ngay_cap_nhat = GETDATE() 
                WHERE id_nguoi_dung = ${id}
            `;
        }
        
        res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
        console.error('Lỗi cập nhật người dùng:', err);
        res.status(500).json({ message: 'Lỗi cập nhật thông tin' });
    }
};

// Admin functions
const getAllUsers = async (req, res) => {
    try {
        const result = await sql.query`
            SELECT nd.*,
                   (SELECT COUNT(*) FROM BaiViet WHERE id_nguoi_dung = nd.id_nguoi_dung) as so_bai_viet,
                   (SELECT COUNT(*) FROM BinhLuan WHERE id_nguoi_dung = nd.id_nguoi_dung) as so_binh_luan,
                   (SELECT COUNT(*) FROM BaoCaoBaiViet WHERE id_nguoi_dung = nd.id_nguoi_dung) as so_bao_cao
            FROM NguoiDung nd
            ORDER BY nd.ngay_tao DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy danh sách người dùng:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu người dùng' });
    }
};

const promoteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await sql.query`
            UPDATE NguoiDung SET la_admin = 1 WHERE id_nguoi_dung = ${id}
        `;
        res.json({ message: 'Thăng admin thành công' });
    } catch (err) {
        console.error('Lỗi thăng admin:', err);
        res.status(500).json({ message: 'Lỗi thăng admin' });
    }
};

const demoteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await sql.query`
            UPDATE NguoiDung SET la_admin = 0 WHERE id_nguoi_dung = ${id}
        `;
        res.json({ message: 'Hạ admin thành công' });
    } catch (err) {
        console.error('Lỗi hạ admin:', err);
        res.status(500).json({ message: 'Lỗi hạ admin' });
    }
};

const banUser = async (req, res) => {
    const { id } = req.params;
    const { ly_do } = req.body;
    try {
        await sql.query`
            UPDATE NguoiDung SET trang_thai = 0 WHERE id_nguoi_dung = ${id}
        `;
        res.json({ message: 'Cấm tài khoản thành công' });
    } catch (err) {
        console.error('Lỗi cấm tài khoản:', err);
        res.status(500).json({ message: 'Lỗi cấm tài khoản' });
    }
};

const unbanUser = async (req, res) => {
    const { id } = req.params;
    try {
        await sql.query`
            UPDATE NguoiDung SET trang_thai = 1 WHERE id_nguoi_dung = ${id}
        `;
        res.json({ message: 'Bỏ cấm tài khoản thành công' });
    } catch (err) {
        console.error('Lỗi bỏ cấm tài khoản:', err);
        res.status(500).json({ message: 'Lỗi bỏ cấm tài khoản' });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const result = await sql.query`
            SELECT bv.*, nd.ten_dang_nhap,
                   (SELECT COUNT(*) FROM BinhLuan WHERE id_bai_viet = bv.id_bai_viet) as so_binh_luan,
                   (SELECT COUNT(*) FROM ReactionBaiViet WHERE id_bai_viet = bv.id_bai_viet) as so_reaction,
                   (SELECT COUNT(*) FROM ChiaSe WHERE id_bai_viet = bv.id_bai_viet) as so_chia_se
            FROM BaiViet bv
            INNER JOIN NguoiDung nd ON bv.id_nguoi_dung = nd.id_nguoi_dung
            ORDER BY bv.ngay_dang DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy danh sách bài viết:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu bài viết' });
    }
};

const getStats = async (req, res) => {
    try {
        const tongNguoiDung = await sql.query`SELECT COUNT(*) as count FROM NguoiDung WHERE trang_thai = 1`;
        const tongBaiViet = await sql.query`SELECT COUNT(*) as count FROM BaiViet`;
        const tongBaoCao = await sql.query`SELECT COUNT(*) as count FROM BaoCaoBaiViet`;
        const tongBinhLuan = await sql.query`SELECT COUNT(*) as count FROM BinhLuan`;
        const tongReaction = await sql.query`SELECT COUNT(*) as count FROM ReactionBaiViet`;
        const tongChiaSe = await sql.query`SELECT COUNT(*) as count FROM ChiaSe`;

        res.json({
            tong_nguoi_dung: tongNguoiDung.recordset[0].count,
            tong_bai_viet: tongBaiViet.recordset[0].count,
            tong_bao_cao: tongBaoCao.recordset[0].count,
            tong_binh_luan: tongBinhLuan.recordset[0].count,
            tong_reaction: tongReaction.recordset[0].count,
            tong_chia_se: tongChiaSe.recordset[0].count
        });
    } catch (err) {
        console.error('Lỗi lấy thống kê:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu thống kê' });
    }
};

module.exports = { dangKy, dangNhap, getUser, updateUser, getAllUsers, promoteUser, demoteUser, banUser, unbanUser, getAllPosts, getStats };
