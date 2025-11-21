const express = require('express');
const router = express.Router();
const nguoiDungCtrl = require('../controllers/nguoiDungController');
const baiVietCtrl = require('../controllers/baiVietController');

router.post('/dang-ky', nguoiDungCtrl.dangKy);
router.post('/dang-nhap', nguoiDungCtrl.dangNhap);
router.get('/nguoi-dung/:id', baiVietCtrl.verifyToken, nguoiDungCtrl.getUser);
// router.put('/nguoi-dung/:id', baiVietCtrl.verifyToken, nguoiDungCtrl.updateUser); // Multer handled in server.js

// router.post('/dang-bai', baiVietCtrl.verifyToken, baiVietCtrl.dangBai); // Multer handled in server.js
router.get('/bai-viet', baiVietCtrl.getAllBaiViet);
router.get('/bai-viet/:id', baiVietCtrl.getBaiVietById);
router.get('/bai-viet/:id/xem', baiVietCtrl.tangLuotXem);
router.get('/dia-diem/:id', baiVietCtrl.getDiaDiemByBaiViet);
router.get('/phuong-tien/:id', baiVietCtrl.getPhuongTienByBaiViet);
router.get('/khach-san/:id', baiVietCtrl.getKhachSanByBaiViet);
router.get('/do-an/:id', baiVietCtrl.getDoAnByBaiViet);

router.get('/hashtag/:id', baiVietCtrl.getHashtagByBaiViet);
router.get('/bai-viet/nguoi-dung/:id_nguoi_dung', baiVietCtrl.verifyToken, baiVietCtrl.getBaiVietByUser);

router.get('/icons', baiVietCtrl.getIcons);
router.get('/reaction/:id', baiVietCtrl.getReactionsByBaiViet);
router.get('/reaction/:id/my', baiVietCtrl.verifyToken, baiVietCtrl.getMyReaction);
router.post('/reaction', baiVietCtrl.verifyToken, baiVietCtrl.addReaction);

router.get('/binh-luan/:id', baiVietCtrl.getBinhLuanByBaiViet);
router.post('/binh-luan', baiVietCtrl.verifyToken, baiVietCtrl.addBinhLuan);

router.get('/chia-se/:id', baiVietCtrl.getChiaSeCount);
router.post('/chia-se', baiVietCtrl.verifyToken, baiVietCtrl.addChiaSe);

// Report post
router.post('/bao-cao', baiVietCtrl.verifyToken, baiVietCtrl.baoCaoBaiViet);

// Admin routes
router.get('/admin/bao-cao', baiVietCtrl.verifyToken, baiVietCtrl.verifyAdmin, baiVietCtrl.getBaoCao);
router.put('/admin/bao-cao/:id', baiVietCtrl.verifyToken, baiVietCtrl.verifyAdmin, baiVietCtrl.xuLyBaoCao);

// User reports
router.get('/bao-cao/nguoi-dung/:id_nguoi_dung', baiVietCtrl.verifyToken, baiVietCtrl.getBaoCaoByUser);

// Delete post
router.delete('/bai-viet/:id', baiVietCtrl.verifyToken, baiVietCtrl.deleteBaiViet);

// Admin post management
router.put('/admin/bai-viet/:id/hide', baiVietCtrl.verifyToken, baiVietCtrl.verifyAdmin, baiVietCtrl.hideBaiViet);
router.put('/admin/bai-viet/:id/unhide', baiVietCtrl.verifyToken, baiVietCtrl.verifyAdmin, baiVietCtrl.unhideBaiViet);

// Admin user management
router.get('/admin/nguoi-dung', baiVietCtrl.verifyToken, baiVietCtrl.verifyAdmin, nguoiDungCtrl.getAllUsers);
router.put('/admin/nguoi-dung/:id/promote', baiVietCtrl.verifyToken, baiVietCtrl.verifyAdmin, nguoiDungCtrl.promoteUser);
router.put('/admin/nguoi-dung/:id/demote', baiVietCtrl.verifyToken, baiVietCtrl.verifyAdmin, nguoiDungCtrl.demoteUser);
router.put('/admin/nguoi-dung/:id/ban', baiVietCtrl.verifyToken, baiVietCtrl.verifyAdmin, nguoiDungCtrl.banUser);
router.put('/admin/nguoi-dung/:id/unban', baiVietCtrl.verifyToken, baiVietCtrl.verifyAdmin, nguoiDungCtrl.unbanUser);

// Admin post management
router.get('/admin/bai-viet', baiVietCtrl.verifyToken, baiVietCtrl.verifyAdmin, nguoiDungCtrl.getAllPosts);

// Admin stats
router.get('/admin/thong-ke', baiVietCtrl.verifyToken, baiVietCtrl.verifyAdmin, nguoiDungCtrl.getStats);

module.exports = router;
