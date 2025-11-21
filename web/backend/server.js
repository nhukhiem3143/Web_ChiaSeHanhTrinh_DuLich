const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { connectDB } = require('./database');
const apiRoutes = require('./routes/api');
const baiVietCtrl = require('./controllers/baiVietController');
const nguoiDungCtrl = require('./controllers/nguoiDungController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Frontend static files - PHẢI ĐẶT TRƯỚC CÁC ROUTES KHÁC
const frontendPath = path.join(__dirname, '..', 'frontend');
const frontendPagePath = path.join(frontendPath, 'page');
const frontendCssPath = path.join(frontendPath, 'css');
const frontendJsPath = path.join(frontendPath, 'js');

// Serve CSS files
app.use('/css', express.static(frontendCssPath));
// Serve JS files
app.use('/js', express.static(frontendJsPath));
// Serve page files
app.use('/page', express.static(frontendPagePath));

// Upload folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Routes với upload (phải đặt trước app.use('/api', apiRoutes))
app.post('/api/dang-bai', baiVietCtrl.verifyToken, upload.single('anh_bia'), baiVietCtrl.dangBai);
app.put('/api/nguoi-dung/:id', baiVietCtrl.verifyToken, upload.single('anh_dai_dien'), nguoiDungCtrl.updateUser);

// Root endpoint - Serve website frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPagePath, 'index.html'));
});

// Serve other HTML pages
app.get('/dang-ky', (req, res) => {
    res.sendFile(path.join(frontendPagePath, 'dang-ky.html'));
});

app.get('/dang-nhap', (req, res) => {
    res.sendFile(path.join(frontendPagePath, 'dang-nhap.html'));
});

app.get('/dang-bai', (req, res) => {
    res.sendFile(path.join(frontendPagePath, 'dang-bai.html'));
});

// xem-bai.html - có thể có query parameter id
app.get('/xem-bai*', (req, res) => {
    res.sendFile(path.join(frontendPagePath, 'xem-bai.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(frontendPagePath, 'admin.html'));
});

app.get('/ca-nhan', (req, res) => {
    res.sendFile(path.join(frontendPagePath, 'ca-nhan.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server đang hoạt động' });
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File quá lớn. Kích thước tối đa là 5MB' });
        }
        return res.status(400).json({ message: 'Lỗi upload file: ' + err.message });
    }
    
    if (err) {
        console.error('Error:', err);
        return res.status(500).json({ message: err.message || 'Lỗi server' });
    }
    
    next();
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Không tìm thấy endpoint' });
});

// Connect to database and start server
connectDB();
app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại port ${PORT}`);
    console.log(`🌐 Website: http://localhost:${PORT}`);
    console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
});