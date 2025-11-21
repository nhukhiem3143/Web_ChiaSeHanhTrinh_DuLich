const { sql } = require('../database');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Chưa xác thực. Vui lòng đăng nhập' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.id;
        req.userName = decoded.ten_dang_nhap;
        req.isAdmin = decoded.la_admin || false;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token đã hết hạn. Vui lòng đăng nhập lại' });
        }
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

// Verify admin
const verifyAdmin = (req, res, next) => {
    if (!req.isAdmin) {
        return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
    }
    next();
};

const dangBai = async (req, res) => {
    const { tieu_de, mo_ta_ngan, noi_dung, ngay_bat_dau, ngay_ket_thuc, tong_chi_phi, ten_dia_diem, loai_dia_diem, dia_chi, gia_tien, ghi_chu } = req.body;
    const id_nguoi_dung = req.userId;
    const anh_bia = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Validation
    if (!tieu_de || tieu_de.trim().length < 5) {
        return res.status(400).json({ message: 'Tiêu đề phải có ít nhất 5 ký tự' });
    }
    
    if (!noi_dung || noi_dung.trim().length < 50) {
        return res.status(400).json({ message: 'Nội dung phải có ít nhất 50 ký tự' });
    }
    
    // Validate date format if provided
    if (ngay_bat_dau && ngay_ket_thuc && new Date(ngay_ket_thuc) < new Date(ngay_bat_dau)) {
        return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
    }
    
    // Validate loai_dia_diem if provided
    if (loai_dia_diem && !['tham_quan', 'an_uong', 'nghi_ngoi', 'hoat_dong'].includes(loai_dia_diem)) {
        return res.status(400).json({ message: 'Loại địa điểm không hợp lệ' });
    }
    
    try {
        await sql.query`
            INSERT INTO BaiViet (id_nguoi_dung, tieu_de, mo_ta_ngan, noi_dung, anh_bia, ngay_bat_dau, ngay_ket_thuc, tong_chi_phi) 
            VALUES (${id_nguoi_dung}, ${tieu_de.trim()}, ${mo_ta_ngan?.trim() || null}, ${noi_dung.trim()}, ${anh_bia}, ${ngay_bat_dau || null}, ${ngay_ket_thuc || null}, ${tong_chi_phi || null})
        `;
        
        const bvResult = await sql.query`SELECT TOP 1 id_bai_viet FROM BaiViet ORDER BY id_bai_viet DESC`;
        const id_bai_viet = bvResult.recordset[0].id_bai_viet;
        
        if (ten_dia_diem && loai_dia_diem) {
            await sql.query`
                INSERT INTO BaiViet_DiaDiem (id_bai_viet, ten_dia_diem, loai_dia_diem, dia_chi, gia_tien, ghi_chu) 
                VALUES (${id_bai_viet}, ${ten_dia_diem.trim()}, ${loai_dia_diem}, ${dia_chi?.trim() || null}, ${gia_tien || null}, ${ghi_chu?.trim() || null})
            `;
        }
        
        res.status(201).json({ message: 'Đăng bài thành công', id_bai_viet });
    } catch (err) {
        console.error('Lỗi đăng bài:', err);
        res.status(500).json({ message: 'Lỗi đăng bài. Vui lòng thử lại sau' });
    }
};

const getAllBaiViet = async (req, res) => {
    try {
        const result = await sql.query`
            SELECT bv.*, nd.ho_ten, nd.ten_dang_nhap, nd.anh_dai_dien,
                   (SELECT COUNT(*) FROM BinhLuan WHERE id_bai_viet = bv.id_bai_viet) as so_binh_luan,
                   (SELECT COUNT(*) FROM ReactionBaiViet WHERE id_bai_viet = bv.id_bai_viet) as so_reaction,
                   (SELECT COUNT(*) FROM ChiaSe WHERE id_bai_viet = bv.id_bai_viet) as so_chia_se,
                   CASE WHEN EXISTS (SELECT 1 FROM BaiViet_DiaDiem WHERE id_bai_viet = bv.id_bai_viet AND loai_dia_diem = 'hoat_dong') THEN 1 ELSE 0 END as has_hoat_dong,
                   CASE WHEN EXISTS (SELECT 1 FROM BaiViet_DiaDiem WHERE id_bai_viet = bv.id_bai_viet AND loai_dia_diem = 'nghi_ngoi') THEN 1 ELSE 0 END as has_nghi_ngoi,
                   CASE WHEN EXISTS (SELECT 1 FROM BaiViet_DiaDiem WHERE id_bai_viet = bv.id_bai_viet AND loai_dia_diem = 'an_uong') THEN 1 ELSE 0 END as has_an_uong,
                   CASE WHEN EXISTS (SELECT 1 FROM BaiViet_DiaDiem WHERE id_bai_viet = bv.id_bai_viet AND loai_dia_diem = 'tham_quan') THEN 1 ELSE 0 END as has_tham_quan,
                   (
                       SELECT STRING_AGG('#' + h.ten_hashtag, ' ')
                       FROM BaiViet_Hashtag bvh
                       INNER JOIN Hashtag h ON bvh.id_hashtag = h.id_hashtag
                       WHERE bvh.id_bai_viet = bv.id_bai_viet
                   ) as hashtags
            FROM BaiViet bv
            INNER JOIN NguoiDung nd ON bv.id_nguoi_dung = nd.id_nguoi_dung
            WHERE bv.trang_thai = N'cong_khai'
            ORDER BY bv.ngay_dang DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy danh sách bài viết:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu bài viết' });
    }
};

const getBaiVietById = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID bài viết không hợp lệ' });
    }

    try {
        const result = await sql.query`
            SELECT bv.*, nd.ho_ten, nd.ten_dang_nhap, nd.anh_dai_dien,
                   (
                       SELECT STRING_AGG('#' + h.ten_hashtag, ' ')
                       FROM BaiViet_Hashtag bvh
                       INNER JOIN Hashtag h ON bvh.id_hashtag = h.id_hashtag
                       WHERE bvh.id_bai_viet = bv.id_bai_viet
                   ) as hashtags
            FROM BaiViet bv
            INNER JOIN NguoiDung nd ON bv.id_nguoi_dung = nd.id_nguoi_dung
            WHERE bv.id_bai_viet = ${id} AND bv.trang_thai = N'cong_khai'
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi lấy bài viết:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu bài viết' });
    }
};

const getDiaDiemByBaiViet = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`SELECT * FROM BaiViet_DiaDiem WHERE id_bai_viet = ${id}`;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
    }
};

const getBaiVietByUser = async (req, res) => {
    const { id_nguoi_dung } = req.params;
    
    if (parseInt(id_nguoi_dung) !== req.userId) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    try {
        const result = await sql.query`
            SELECT bv.*, 
                   (SELECT COUNT(*) FROM BinhLuan WHERE id_bai_viet = bv.id_bai_viet) as so_binh_luan,
                   (SELECT COUNT(*) FROM ReactionBaiViet WHERE id_bai_viet = bv.id_bai_viet) as so_reaction,
                   (SELECT COUNT(*) FROM ChiaSe WHERE id_bai_viet = bv.id_bai_viet) as so_chia_se
            FROM BaiViet bv
            WHERE bv.id_nguoi_dung = ${id_nguoi_dung}
            ORDER BY bv.ngay_dang DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy bài viết của người dùng:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu bài viết' });
    }
};

const tangLuotXem = async (req, res) => {
    const { id } = req.params;
    try {
        await sql.query`UPDATE BaiViet SET luot_xem = ISNULL(luot_xem, 0) + 1 WHERE id_bai_viet = ${id}`;
        res.json({ message: 'Đã tăng lượt xem' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật lượt xem' });
    }
};

const getHashtagByBaiViet = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`SELECT * FROM BaiViet_Hashtag WHERE id_bai_viet = ${id}`;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
    }
};

// Emoji reactions: 😍 (love), 😭 (cry), 😆 (laugh), 😠 (angry), 👍 (like), 👎 (dislike)
const EMOJI_REACTIONS = {
    'love': '😍',
    'cry': '😭',
    'laugh': '😆',
    'angry': '😠',
    'like': '👍',
    'dislike': '👎'
};

const getIcons = async (req, res) => {
    try {
        // Trả về emoji reactions thay vì từ database
        const emojis = Object.entries(EMOJI_REACTIONS).map(([key, emoji]) => ({
            id_icon: key,
            ten_icon: key,
            emoji: emoji,
            ten_hien_thi: key === 'love' ? 'Yêu thích' : 
                         key === 'cry' ? 'Buồn' :
                         key === 'laugh' ? 'Haha' :
                         key === 'angry' ? 'Phẫn nộ' :
                         key === 'like' ? 'Thích' : 'Không thích'
        }));
        res.json(emojis);
    } catch (err) {
        console.error('Lỗi lấy reactions:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu reactions' });
    }
};

const getReactionsByBaiViet = async (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID bài viết không hợp lệ' });
    }
    
    try {
        // Lấy reactions với emoji type (lưu trong id_icon field nhưng là string emoji type)
        const result = await sql.query`
            SELECT r.id_reaction, r.id_bai_viet, r.id_nguoi_dung, r.id_icon as emoji_type, r.ngay_reaction,
                   nd.ho_ten, nd.ten_dang_nhap, nd.anh_dai_dien
            FROM ReactionBaiViet r
            INNER JOIN NguoiDung nd ON r.id_nguoi_dung = nd.id_nguoi_dung
            WHERE r.id_bai_viet = ${id}
            ORDER BY r.ngay_reaction DESC
        `;
        
        // Thêm emoji và format lại data
        const reactions = result.recordset.map(r => ({
            ...r,
            emoji: EMOJI_REACTIONS[r.emoji_type] || '👍',
            emoji_type: r.emoji_type
        }));
        
        // Thống kê số lượng từng loại reaction
        const stats = {};
        result.recordset.forEach(r => {
            const type = r.emoji_type || 'like';
            stats[type] = (stats[type] || 0) + 1;
        });
        
        res.json({
            reactions: reactions,
            stats: stats,
            total: result.recordset.length
        });
    } catch (err) {
        console.error('Lỗi lấy reactions:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu reactions' });
    }
};

const addReaction = async (req, res) => {
    const { id_bai_viet, emoji_type } = req.body;
    const id_nguoi_dung = req.userId;
    
    // Validation
    if (!id_bai_viet || !emoji_type) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    
    // Validate emoji type
    if (!EMOJI_REACTIONS[emoji_type]) {
        return res.status(400).json({ message: 'Loại reaction không hợp lệ' });
    }
    
    try {
        // Check if post exists
        const postCheck = await sql.query`
            SELECT id_bai_viet FROM BaiViet WHERE id_bai_viet = ${id_bai_viet}
        `;
        if (postCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }
        
        // Check existing reaction
        const existingReaction = await sql.query`
            SELECT id_reaction, id_icon FROM ReactionBaiViet 
            WHERE id_bai_viet = ${id_bai_viet} AND id_nguoi_dung = ${id_nguoi_dung}
        `;
        
        if (existingReaction.recordset.length > 0) {
            const existingType = existingReaction.recordset[0].id_icon;
            // Nếu click vào cùng loại reaction, xóa reaction (unreact)
            if (existingType === emoji_type) {
                await sql.query`
                    DELETE FROM ReactionBaiViet 
                    WHERE id_bai_viet = ${id_bai_viet} AND id_nguoi_dung = ${id_nguoi_dung}
                `;
                return res.json({ message: 'Đã bỏ reaction', action: 'removed' });
            } else {
                // Nếu khác loại, cập nhật reaction mới (thay đổi reaction như Facebook)
                await sql.query`
                    UPDATE ReactionBaiViet 
                    SET id_icon = ${emoji_type}, ngay_reaction = GETDATE()
                    WHERE id_bai_viet = ${id_bai_viet} AND id_nguoi_dung = ${id_nguoi_dung}
                `;
                return res.json({ message: 'Đã thay đổi reaction', action: 'updated' });
            }
        } else {
            // Chưa có reaction, thêm mới
            // Lưu emoji_type vào id_icon field (vì database vẫn dùng id_icon nhưng ta lưu string)
            await sql.query`
                INSERT INTO ReactionBaiViet (id_bai_viet, id_nguoi_dung, id_icon) 
                VALUES (${id_bai_viet}, ${id_nguoi_dung}, ${emoji_type})
            `;
            return res.json({ message: 'Thêm reaction thành công', action: 'added' });
        }
    } catch (err) {
        console.error('Lỗi thêm reaction:', err);
        res.status(500).json({ message: 'Lỗi thêm reaction' });
    }
};

// Get current user's reaction for a post
const getMyReaction = async (req, res) => {
    const { id } = req.params;
    const id_nguoi_dung = req.userId;
    
    try {
        const result = await sql.query`
            SELECT id_icon as emoji_type 
            FROM ReactionBaiViet 
            WHERE id_bai_viet = ${id} AND id_nguoi_dung = ${id_nguoi_dung}
        `;
        
        if (result.recordset.length > 0) {
            const emojiType = result.recordset[0].emoji_type;
            res.json({ 
                hasReaction: true,
                emoji_type: emojiType,
                emoji: EMOJI_REACTIONS[emojiType] || '👍'
            });
        } else {
            res.json({ hasReaction: false });
        }
    } catch (err) {
        console.error('Lỗi lấy reaction của user:', err);
        res.status(500).json({ message: 'Lỗi lấy reaction' });
    }
};

const getBinhLuanByBaiViet = async (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID bài viết không hợp lệ' });
    }
    
    try {
        const result = await sql.query`
            SELECT bl.*, nd.ho_ten, nd.ten_dang_nhap, nd.anh_dai_dien
            FROM BinhLuan bl
            INNER JOIN NguoiDung nd ON bl.id_nguoi_dung = nd.id_nguoi_dung
            WHERE bl.id_bai_viet = ${id}
            ORDER BY bl.ngay_binh_luan DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy bình luận:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu bình luận' });
    }
};

const addBinhLuan = async (req, res) => {
    const { id_bai_viet, noi_dung} = req.body;
    const id_nguoi_dung = req.userId;

    // Validation
    if (!id_bai_viet || !noi_dung) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    if (noi_dung.trim().length < 1) {
        return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
    }

    if (noi_dung.trim().length > 1000) {
        return res.status(400).json({ message: 'Nội dung bình luận quá dài (tối đa 1000 ký tự)' });
    }

    try {
        // Check if post exists
        const postCheck = await sql.query`
            SELECT id_bai_viet FROM BaiViet WHERE id_bai_viet = ${id_bai_viet}
        `;
        if (postCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        await sql.query`
            INSERT INTO BinhLuan (id_bai_viet, id_nguoi_dung, noi_dung)
            VALUES (${id_bai_viet}, ${id_nguoi_dung}, ${noi_dung.trim()})
        `;

        res.status(201).json({ message: 'Thêm bình luận thành công' });
    } catch (err) {
        console.error('Lỗi thêm bình luận:', err);
        res.status(500).json({ message: 'Lỗi thêm bình luận' });
    }
};

const getChiaSeCount = async (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID bài viết không hợp lệ' });
    }
    
    try {
        const result = await sql.query`
            SELECT COUNT(*) as count 
            FROM ChiaSe 
            WHERE id_bai_viet = ${id}
        `;
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Lỗi lấy số lượt chia sẻ:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
    }
};

const addChiaSe = async (req, res) => {
    const { id_bai_viet, noi_dung } = req.body;
    const id_nguoi_dung = req.userId;
    
    // Validation
    if (!id_bai_viet) {
        return res.status(400).json({ message: 'Thiếu ID bài viết' });
    }
    
    try {
        // Check if post exists
        const postCheck = await sql.query`
            SELECT id_bai_viet FROM BaiViet WHERE id_bai_viet = ${id_bai_viet}
        `;
        if (postCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }
        
        // Check if already shared by this user
        const existingShare = await sql.query`
            SELECT id_chia_se FROM ChiaSe 
            WHERE id_bai_viet = ${id_bai_viet} AND id_nguoi_dung = ${id_nguoi_dung}
        `;
        if (existingShare.recordset.length > 0) {
            return res.status(409).json({ message: 'Bạn đã chia sẻ bài viết này rồi' });
        }
        
        await sql.query`
            INSERT INTO ChiaSe (id_bai_viet, id_nguoi_dung, noi_dung) 
            VALUES (${id_bai_viet}, ${id_nguoi_dung}, ${noi_dung?.trim() || null})
        `;
        
        res.status(201).json({ message: 'Chia sẻ thành công' });
    } catch (err) {
        console.error('Lỗi chia sẻ:', err);
        res.status(500).json({ message: 'Lỗi chia sẻ' });
    }
};

// Report post
const baoCaoBaiViet = async (req, res) => {
    const { id_bai_viet, ly_do } = req.body;
    const id_nguoi_dung = req.userId;

    // Validation
    if (!id_bai_viet || !ly_do) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    try {
        // Check if post exists
        const postCheck = await sql.query`
            SELECT id_bai_viet FROM BaiViet WHERE id_bai_viet = ${id_bai_viet}
        `;
        if (postCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        await sql.query`
            INSERT INTO BaoCaoBaiViet (id_bai_viet, id_nguoi_dung, ly_do)
            VALUES (${id_bai_viet}, ${id_nguoi_dung}, ${ly_do.trim()})
        `;

        res.status(201).json({ message: 'Báo cáo thành công. Cảm ơn bạn đã phản hồi!' });
    } catch (err) {
        console.error('Lỗi báo cáo bài viết:', err);
        res.status(500).json({ message: 'Lỗi báo cáo bài viết' });
    }
};

// Get reports (Admin only)
const getBaoCao = async (req, res) => {
    try {
        const result = await sql.query`
            SELECT bc.*, bv.tieu_de, nd.ho_ten as ten_nguoi_bao_cao, nd.email as email_nguoi_bao_cao
            FROM BaoCaoBaiViet bc
            INNER JOIN BaiViet bv ON bc.id_bai_viet = bv.id_bai_viet
            INNER JOIN NguoiDung nd ON bc.id_nguoi_dung = nd.id_nguoi_dung
            WHERE bc.trang_thai = N'cho_xu_ly'
            ORDER BY bc.ngay_bao_cao DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy báo cáo:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu báo cáo' });
    }
};

// Get user's reports
const getBaoCaoByUser = async (req, res) => {
    const { id_nguoi_dung } = req.params;

    if (parseInt(id_nguoi_dung) !== req.userId) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    try {
        const result = await sql.query`
            SELECT bc.*, bv.tieu_de
            FROM BaoCaoBaiViet bc
            LEFT JOIN BaiViet bv ON bc.id_bai_viet = bv.id_bai_viet
            WHERE bc.id_nguoi_dung = ${id_nguoi_dung}
            ORDER BY bc.ngay_bao_cao DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy báo cáo của người dùng:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu báo cáo' });
    }
};

// Delete post permanently (by owner or admin)
const deleteBaiViet = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const isAdmin = req.isAdmin;

    try {
        // Check if post exists and get owner
        const postCheck = await sql.query`
            SELECT id_nguoi_dung FROM BaiViet WHERE id_bai_viet = ${id}
        `;

        if (postCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        const postOwner = postCheck.recordset[0].id_nguoi_dung;

        // Allow deletion if user is owner or admin
        if (parseInt(userId) !== parseInt(postOwner) && !isAdmin) {
            return res.status(403).json({ message: 'Không có quyền xóa bài viết này' });
        }

        // Delete related records first to avoid foreign key constraints
        await sql.query`DELETE FROM BaiViet_DiaDiem WHERE id_bai_viet = ${id}`;
        await sql.query`DELETE FROM ReactionBaiViet WHERE id_bai_viet = ${id}`;
        await sql.query`DELETE FROM BinhLuan WHERE id_bai_viet = ${id}`;
        await sql.query`DELETE FROM ChiaSe WHERE id_bai_viet = ${id}`;
        await sql.query`DELETE FROM BaiViet_Hashtag WHERE id_bai_viet = ${id}`;
        await sql.query`DELETE FROM BaoCaoBaiViet WHERE id_bai_viet = ${id}`;

        // Finally delete the post
        await sql.query`DELETE FROM BaiViet WHERE id_bai_viet = ${id}`;

        res.json({ message: 'Xóa bài viết thành công' });
    } catch (err) {
        console.error('Lỗi xóa bài viết:', err);
        res.status(500).json({ message: 'Lỗi xóa bài viết' });
    }
};

// Handle report (Admin only)
const xuLyBaoCao = async (req, res) => {
    const { id } = req.params;
    const { trang_thai, ghi_chu_admin } = req.body;
    
    const validStatuses = ['cho_xu_ly', 'dang_xu_ly', 'da_xu_ly', 'tu_choi'];
    if (!validStatuses.includes(trang_thai)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    
    try {
        await sql.query`
            UPDATE BaoCaoBaiViet 
            SET trang_thai = ${trang_thai}, ghi_chu_admin = ${ghi_chu_admin || null}
            WHERE id_bao_cao = ${id}
        `;
        
        // Nếu báo cáo được chấp nhận và yêu cầu ẩn/xóa bài viết
        if (trang_thai === 'da_xu_ly' && req.body.hanh_dong === 'an_bai') {
            await sql.query`
                UPDATE BaiViet 
                SET trang_thai = N'an'
                WHERE id_bai_viet = (SELECT id_bai_viet FROM BaoCaoBaiViet WHERE id_bao_cao = ${id})
            `;
        }
        
        res.json({ message: 'Cập nhật báo cáo thành công' });
    } catch (err) {
        console.error('Lỗi xử lý báo cáo:', err);
        res.status(500).json({ message: 'Lỗi xử lý báo cáo' });
    }
};

const getPhuongTienByBaiViet = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`SELECT * FROM BaiViet_PhuongTien WHERE id_bai_viet = ${id}`;
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy phương tiện:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu phương tiện' });
    }
};

// Thêm hàm getKhachSanByBaiViet
const getKhachSanByBaiViet = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`SELECT * FROM BaiViet_KhachSan WHERE id_bai_viet = ${id}`;
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy khách sạn:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu khách sạn' });
    }
};

// Thêm hàm getDoAnByBaiViet
const getDoAnByBaiViet = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`SELECT * FROM BaiViet_DoAn WHERE id_bai_viet = ${id}`;
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi lấy đồ ăn:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu đồ ăn' });
    }
};

// Hide post (Admin only)
const hideBaiViet = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if post exists
        const postCheck = await sql.query`
            SELECT id_bai_viet, trang_thai FROM BaiViet WHERE id_bai_viet = ${id}
        `;

        if (postCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        // Update status to 'an'
        await sql.query`
            UPDATE BaiViet SET trang_thai = N'an' WHERE id_bai_viet = ${id}
        `;

        res.json({ message: 'Ẩn bài viết thành công' });
    } catch (err) {
        console.error('Lỗi ẩn bài viết:', err);
        res.status(500).json({ message: 'Lỗi ẩn bài viết' });
    }
};

// Unhide post (Admin only)
const unhideBaiViet = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if post exists
        const postCheck = await sql.query`
            SELECT id_bai_viet, trang_thai FROM BaiViet WHERE id_bai_viet = ${id}
        `;

        if (postCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        // Update status to 'cong_khai'
        await sql.query`
            UPDATE BaiViet SET trang_thai = N'cong_khai' WHERE id_bai_viet = ${id}
        `;

        res.json({ message: 'Hiện lại bài viết thành công' });
    } catch (err) {
        console.error('Lỗi hiện lại bài viết:', err);
        res.status(500).json({ message: 'Lỗi hiện lại bài viết' });
    }
};

// Sửa module.exports để thêm các hàm mới (thêm vào list export hiện có)
module.exports = {
    dangBai,
    getAllBaiViet,
    getBaiVietById,
    getBaiVietByUser,
    verifyToken,
    verifyAdmin,
    getDiaDiemByBaiViet,
    getPhuongTienByBaiViet,
    getKhachSanByBaiViet,
    getDoAnByBaiViet,
    tangLuotXem,
    getHashtagByBaiViet,
    getIcons,
    getReactionsByBaiViet,
    addReaction,
    getMyReaction,
    getBinhLuanByBaiViet,
    addBinhLuan,
    getChiaSeCount,
    addChiaSe,
    baoCaoBaiViet,
    getBaoCao,
    getBaoCaoByUser,
    deleteBaiViet,
    xuLyBaoCao,
    hideBaiViet,
    unhideBaiViet
};
