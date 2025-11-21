// Global variables
let currentPostId = null;
let myCurrentReaction = null;
let reactionStats = {};

// Emoji reactions
const EMOJI_REACTIONS = {
    'love': '😍',
    'cry': '😭',
    'laugh': '😆',
    'angry': '😠',
    'like': '👍',
    'dislike': '👎'
};

const EMOJI_LABELS = {
    'love': 'Yêu thích',
    'cry': 'Buồn',
    'laugh': 'Haha',
    'angry': 'Phẫn nộ',
    'like': 'Thích',
    'dislike': 'Không thích'
};

// Global helper functions
function showSuccessMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message success';
    msgDiv.textContent = message;
    const container = document.querySelector('.post-detail-container');
    if (container) {
        container.insertBefore(msgDiv, container.firstChild);
        setTimeout(() => msgDiv.remove(), 3000);
    }
}

function showErrorMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message error';
    msgDiv.textContent = message;
    const container = document.querySelector('.post-detail-container');
    if (container) {
        container.insertBefore(msgDiv, container.firstChild);
        setTimeout(() => msgDiv.remove(), 5000);
    }
}

// Load post detail
async function loadBaiVietDetail(id) {
    try {
        // Tăng lượt xem
        await fetch(`/api/bai-viet/${id}/xem`);
        
        const response = await fetch(`/api/bai-viet/${id}`);
        if (!response.ok) {
            throw new Error('Không tìm thấy bài viết');
        }
        
        const bv = await response.json();

        // Store post data globally for other functions to access
        window.currentPostData = bv;

        // Format date
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        // Format date and time for travel dates
        const formatDateTime = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            const time = date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const datePart = date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            return `${time} Ngày ${datePart}`;
        };
        
        const formatCurrency = (amount) => {
            if (!amount) return '0';
            return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
        };
        
        const authorInitial = bv.ho_ten ? bv.ho_ten.charAt(0).toUpperCase() : (bv.ten_dang_nhap ? bv.ten_dang_nhap.charAt(0).toUpperCase() : '?');
        
        // Render post header
        const postHeader = document.getElementById('postHeader');
        postHeader.innerHTML = `
            <div class="post-author-info">
                ${bv.anh_dai_dien ? `
                    <img src="${bv.anh_dai_dien}" alt="${bv.ho_ten || bv.ten_dang_nhap}" class="author-avatar-large">
                ` : `
                    <div class="author-avatar-large">${authorInitial}</div>
                `}
                <div class="author-details">
                    <h3>${bv.ho_ten || bv.ten_dang_nhap || 'Người dùng'}</h3>
                    <div class="post-time">${formatDate(bv.ngay_dang)}</div>
                </div>
            </div>
            <h1 class="post-title-large">${bv.tieu_de || 'Không có tiêu đề'}</h1>
            ${bv.mo_ta_ngan ? `<p class="post-description">${bv.mo_ta_ngan}</p>` : ''}
        `;
        
        // Render post image
        const postImageContainer = document.getElementById('postImageContainer');
        if (bv.anh_bia) {
            postImageContainer.innerHTML = `<img src="${bv.anh_bia}" alt="${bv.tieu_de}" class="post-image-large">`;
        } else {
            postImageContainer.innerHTML = '';
        }
        
        // Render post content
        const postContent = document.getElementById('postContent');
        postContent.innerHTML = `
            <div style="white-space: pre-wrap; line-height: 1.8;">${bv.noi_dung || ''}</div>
            ${bv.ngay_bat_dau || bv.ngay_ket_thuc || bv.tong_chi_phi ? `
                <div class="travel-dates">
                    ${bv.ngay_bat_dau ? `<div class="start-date">${formatDateTime(bv.ngay_bat_dau)}</div>` : ''}
                    ${bv.ngay_ket_thuc ? `<div class="end-date">${formatDateTime(bv.ngay_ket_thuc)}</div>` : ''}
                    ${bv.tong_chi_phi ? `<div class="cost">${formatCurrency(bv.tong_chi_phi)}</div>` : ''}
                </div>
            ` : ''}
        `;
        
        // Render post meta
        const postMetaInfo = document.getElementById('postMetaInfo');
        postMetaInfo.innerHTML = `
            <div class="post-stats-bar">
                <span>👁️ ${bv.luot_xem || 0} lượt xem</span>
            </div>
        `;
        
        // Load hashtags, locations, reactions, comments
        await loadHashtag(id);
        await loadTravelInfo(id);
        await loadReactions(id);
        await loadBinhLuan(id);
        await loadChiaSe(id);
        
        
    } catch (error) {
        console.error('Error loading post:', error);
        const postHeader = document.getElementById('postHeader');
        postHeader.innerHTML = `
            <div style="text-align: center; padding: var(--spacing-2xl);">
                <h2>⚠️ Không tìm thấy bài viết</h2>
                <p>${error.message}</p>
                <a href="/" class="btn btn-primary mt-3">Về trang chủ</a>
            </div>
        `;
    }
}

// Load travel info (combines all travel-related data)
async function loadTravelInfo(id) {
    await loadDiaDiem(id);
    await loadPhuongTien(id);
    await loadKhachSan(id);
    await loadDoAn(id);
}

// Load locations
async function loadDiaDiem(id) {
    try {
        const response = await fetch(`/api/dia-diem/${id}`);
        if (!response.ok) return;
        
        const diaDiems = await response.json();
        const locationSection = document.getElementById('locationSection');
        const locationList = document.getElementById('locationList');
        
        if (!diaDiems || diaDiems.length === 0) {
            locationSection.style.display = 'none';
            return;
        }
        
        locationSection.style.display = 'block';
        locationList.innerHTML = '';
        locationList.className = 'location-list';

        diaDiems.forEach((dd, index) => {
            const locationCard = document.createElement('div');
            locationCard.className = 'location-card';
            
            const loaiLabels = {
                'tham_quan': 'Tham Quan',
                'an_uong': 'Ăn Uống',
                'nghi_ngoi': 'Nghỉ Ngơi',
                'hoat_dong': 'Hoạt Động'
            };
            
            const formatCurrency = (amount) => {
                if (!amount) return 'Miễn phí';
                return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
            };
            
            locationCard.innerHTML = `
                <div class="location-name">📍 ${dd.ten_dia_diem}</div>
                <div class="location-type">${loaiLabels[dd.loai_dia_diem] || dd.loai_dia_diem}</div>
                ${dd.dia_chi ? `<div class="location-address">${dd.dia_chi}</div>` : ''}
                ${dd.gia_tien ? `<div class="location-price">💰 ${formatCurrency(dd.gia_tien)}</div>` : ''}
                ${dd.ghi_chu ? `<div style="margin-top: var(--spacing-sm); color: var(--text-secondary); font-size: 0.875rem;">${dd.ghi_chu}</div>` : ''}
                ${dd.dia_chi ? `
                    <div class="map-container">
                        <iframe 
                            src="https://www.google.com/maps?q=${encodeURIComponent(dd.dia_chi)}&output=embed" 
                            allowfullscreen>
                        </iframe>
                    </div>
                ` : ''}
            `;
            locationList.appendChild(locationCard);
        });
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

async function loadPhuongTien(id) {
    try {
        const response = await fetch(`/api/phuong-tien/${id}`);
        if (!response.ok) return;
        
        const phuongTiens = await response.json();
        const phuongTienSection = document.getElementById('phuongTienSection');
        const phuongTienList = document.getElementById('phuongTienList');
        
        if (!phuongTiens || phuongTiens.length === 0) {
            if (phuongTienSection) phuongTienSection.style.display = 'none';
            return;
        }
        
        if (phuongTienSection) phuongTienSection.style.display = 'block';
        if (phuongTienList) phuongTienList.innerHTML = '';
        
        phuongTiens.forEach((pt, index) => {
            const phuongTienCard = document.createElement('div');
            phuongTienCard.className = 'location-card';
            
            const formatCurrency = (amount) => {
                if (!amount) return 'Miễn phí';
                return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
            };
            
            phuongTienCard.innerHTML = `
                <div class="location-name">🚗 ${pt.ten_phuong_tien}</div>
                ${pt.chi_phi ? `<div class="location-price">💰 ${formatCurrency(pt.chi_phi)}</div>` : ''}
                ${pt.mo_ta ? `<div style="margin-top: var(--spacing-sm); color: var(--text-secondary); font-size: 0.875rem;">${pt.mo_ta}</div>` : ''}
            `;
            if (phuongTienList) phuongTienList.appendChild(phuongTienCard);
        });
    } catch (error) {
        console.error('Error loading phương tiện:', error);
    }
}

async function loadKhachSan(id) {
    try {
        const response = await fetch(`/api/khach-san/${id}`);
        if (!response.ok) return;
        
        const khachSans = await response.json();
        const khachSanSection = document.getElementById('khachSanSection');
        const khachSanList = document.getElementById('khachSanList');
        
        if (!khachSans || khachSans.length === 0) {
            if (khachSanSection) khachSanSection.style.display = 'none';
            return;
        }
        
        if (khachSanSection) khachSanSection.style.display = 'block';
        if (khachSanList) khachSanList.innerHTML = '';
        
        khachSans.forEach((ks, index) => {
            const khachSanCard = document.createElement('div');
            khachSanCard.className = 'location-card';
            
            const formatCurrency = (amount) => {
                if (!amount) return 'Miễn phí';
                return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
            };
            
            khachSanCard.innerHTML = `
                <div class="location-name">🏨 ${ks.ten}</div>
                ${ks.dia_chi ? `<div class="location-address">${ks.dia_chi}</div>` : ''}
                ${ks.gia_phong ? `<div class="location-price">💰 ${formatCurrency(ks.gia_phong)}</div>` : ''}
                ${ks.so_sao ? `<div class="location-type">⭐ ${ks.so_sao} sao</div>` : ''}
                ${ks.danh_gia ? `<div style="margin-top: var(--spacing-sm); color: var(--text-secondary); font-size: 0.875rem;">${ks.danh_gia}</div>` : ''}
            `;
            if (khachSanList) khachSanList.appendChild(khachSanCard);
        });
    } catch (error) {
        console.error('Error loading khách sạn:', error);
    }
}

async function loadDoAn(id) {
    try {
        const response = await fetch(`/api/do-an/${id}`);
        if (!response.ok) return;
        
        const doAns = await response.json();
        const doAnSection = document.getElementById('doAnSection');
        const doAnList = document.getElementById('doAnList');
        
        if (!doAns || doAns.length === 0) {
            if (doAnSection) doAnSection.style.display = 'none';
            return;
        }
        
        if (doAnSection) doAnSection.style.display = 'block';
        if (doAnList) doAnList.innerHTML = '';
        
        doAns.forEach((da, index) => {
            const doAnCard = document.createElement('div');
            doAnCard.className = 'location-card';
            
            const formatCurrency = (amount) => {
                if (!amount) return 'Miễn phí';
                return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
            };
            
            doAnCard.innerHTML = `
                <div class="location-name">🍲 ${da.ten}</div>
                ${da.dia_chi ? `<div class="location-address">${da.dia_chi}</div>` : ''}
                ${da.mon_an ? `<div class="location-type">${da.mon_an}</div>` : ''}
                ${da.gia_tb ? `<div class="location-price">💰 ${formatCurrency(da.gia_tb)}</div>` : ''}
                ${da.danh_gia ? `<div style="margin-top: var(--spacing-sm); color: var(--text-secondary); font-size: 0.875rem;">${da.danh_gia}</div>` : ''}
            `;
            if (doAnList) doAnList.appendChild(doAnCard);
        });
    } catch (error) {
        console.error('Error loading đồ ăn:', error);
    }
}

// Load hashtags
async function loadHashtag(id) {
    try {
        // Hashtags are now included in the post data from getBaiVietById
        // This function is called after loadBaiVietDetail, so we can access the post data
        const hashtagsSection = document.getElementById('hashtagsSection');
        const hashtagsList = document.getElementById('hashtagsList');

        // Get hashtags from the current post data (set in loadBaiVietDetail)
        const hashtagsString = window.currentPostData?.hashtags;

        if (!hashtagsString || hashtagsString.trim() === '') {
            hashtagsSection.style.display = 'none';
            return;
        }

        // Split the hashtags string into individual hashtags
        const hashtags = hashtagsString.split(' ').filter(tag => tag.trim() !== '');

        if (hashtags.length === 0) {
            hashtagsSection.style.display = 'none';
            return;
        }

        hashtagsSection.style.display = 'block';
        hashtagsList.innerHTML = hashtags.map(tag =>
            `<a href="/?hashtag=${encodeURIComponent(tag.substring(1))}" class="hashtag-item">${tag}</a>`
        ).join('');
    } catch (error) {
        console.error('Error loading hashtags:', error);
    }
}

// Load reactions
async function loadReactions(id) {
    try {
        const token = localStorage.getItem('token');
        
        // Load my reaction if logged in
        if (token) {
            try {
                const myReactionResponse = await fetch(`/api/reaction/${id}/my`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (myReactionResponse.ok) {
                    const myReaction = await myReactionResponse.json();
                    myCurrentReaction = myReaction.hasReaction ? myReaction.emoji_type : null;
                }
            } catch (err) {
                console.error('Error loading my reaction:', err);
            }
        }
        
        // Load all reactions
        const response = await fetch(`/api/reaction/${id}`);
        if (!response.ok) return;
        
        const data = await response.json();
        reactionStats = data.stats || {};
        
        // Render reaction buttons
        const reactionButtons = document.getElementById('reactionButtons');
        reactionButtons.innerHTML = '';
        
        Object.entries(EMOJI_REACTIONS).forEach(([type, emoji]) => {
            const btn = document.createElement('button');
            btn.className = `reaction-btn ${myCurrentReaction === type ? 'active' : ''}`;
            btn.innerHTML = `<span>${emoji}</span> <span>${EMOJI_LABELS[type]}</span>`;
            btn.title = EMOJI_LABELS[type];
            btn.onclick = () => toggleReaction(type);
            reactionButtons.appendChild(btn);
        });
        
        // Render reaction counts
        const reactionCounts = document.getElementById('reactionCounts');
        const countsHtml = Object.entries(reactionStats)
            .filter(([type, count]) => count > 0)
            .map(([type, count]) => `
                <div class="reaction-count-item">
                    <span>${EMOJI_REACTIONS[type]}</span>
                    <span>${count}</span>
                </div>
            `).join('');
        
        reactionCounts.innerHTML = countsHtml || '<div style="color: var(--text-muted); font-size: 0.875rem;">Chưa có reaction nào</div>';
        
        // Update like button in post actions
        updateLikeButton();
    } catch (error) {
        console.error('Error loading reactions:', error);
    }
}

// Toggle reaction (Facebook style - click to add/change, click same to remove)
async function toggleReaction(emojiType) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để reaction!');
        window.location.href = '/dang-nhap';
        return;
    }
    
    // Close reaction picker
    const picker = document.getElementById('reactionPicker');
    if (picker) {
        picker.style.display = 'none';
    }
    
    try {
        const response = await fetch('/api/reaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id_bai_viet: currentPostId,
                emoji_type: emojiType
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Reload reactions
            await loadReactions(currentPostId);
            showSuccessMessage(result.message || 'Đã cập nhật reaction!');
        } else {
            showErrorMessage(result.message || 'Lỗi cập nhật reaction!');
        }
    } catch (error) {
        console.error('Error toggling reaction:', error);
        showErrorMessage('Lỗi kết nối: ' + error.message);
    }
}

// Export for global use
window.toggleReaction = toggleReaction;

// Update like button in post actions
function updateLikeButton() {
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn && myCurrentReaction) {
        const emoji = EMOJI_REACTIONS[myCurrentReaction];
        const label = EMOJI_LABELS[myCurrentReaction];
        likeBtn.innerHTML = `<span>${emoji}</span> <span>${label}</span>`;
        likeBtn.classList.add('active');
    } else if (likeBtn) {
        likeBtn.innerHTML = `<span>👍</span> <span>Thích</span>`;
        likeBtn.classList.remove('active');
    }
}

// Show reaction picker (Facebook style)
function showReactionPicker() {
    const picker = document.getElementById('reactionPicker');
    const likeBtn = document.getElementById('likeBtn');
    
    if (!picker) return;
    
    if (picker.style.display === 'none' || !picker.style.display) {
        picker.style.display = 'flex';
        
        // Close picker when clicking outside
        setTimeout(() => {
            const closePicker = (e) => {
                if (!picker.contains(e.target) && likeBtn && !likeBtn.contains(e.target)) {
                    picker.style.display = 'none';
                    document.removeEventListener('click', closePicker);
                }
            };
            document.addEventListener('click', closePicker);
        }, 100);
    } else {
        picker.style.display = 'none';
    }
}

// Export for global use
window.showReactionPicker = showReactionPicker;

// Load comments
async function loadBinhLuan(id) {
    try {
        const response = await fetch(`/api/binh-luan/${id}`);
        if (!response.ok) return;
        
        const binhLuan = await response.json();
        const commentsList = document.getElementById('commentsList');
        
        commentsList.innerHTML = '';
        
        if (!binhLuan || binhLuan.length === 0) {
            commentsList.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: var(--spacing-lg);">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</div>';
            return;
        }
        
        // Render comments (flat structure with parent-child relationship)
        binhLuan.forEach(bl => {
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item';
            
            const authorInitial = bl.ho_ten ? bl.ho_ten.charAt(0).toUpperCase() : (bl.ten_dang_nhap ? bl.ten_dang_nhap.charAt(0).toUpperCase() : '?');
            const formatDate = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                const now = new Date();
                const diffMs = now - date;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                if (diffMins < 1) return 'Vừa xong';
                if (diffMins < 60) return `${diffMins} phút trước`;
                if (diffHours < 24) return `${diffHours} giờ trước`;
                if (diffDays < 7) return `${diffDays} ngày trước`;
                return date.toLocaleDateString('vi-VN');
            };
            
            commentItem.innerHTML = `
                ${bl.anh_dai_dien ? `
                    <img src="${bl.anh_dai_dien}" alt="${bl.ho_ten || bl.ten_dang_nhap}" class="comment-avatar">
                ` : `
                    <div class="comment-avatar">${authorInitial}</div>
                `}
                <div class="comment-content">
                    <div class="comment-author">${bl.ho_ten || bl.ten_dang_nhap || 'Người dùng'}</div>
                    <div class="comment-text">${bl.noi_dung || ''}</div>
                    <div class="comment-time">${formatDate(bl.ngay_binh_luan)}</div>
                </div>
            `;
            
            commentsList.appendChild(commentItem);
        });
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

// Add comment
document.getElementById('commentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để bình luận!');
        window.location.href = '/dang-nhap';
        return;
    }
    
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        showErrorMessage('Vui lòng nhập nội dung bình luận!');
        return;
    }
    
    const submitBtn = document.getElementById('commentSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi...';
    
    try {
        const response = await fetch('/api/binh-luan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id_bai_viet: currentPostId,
                noi_dung: commentText
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            commentInput.value = '';
            await loadBinhLuan(currentPostId);
            showSuccessMessage('Đã thêm bình luận!');
        } else {
            showErrorMessage(result.message || 'Lỗi thêm bình luận!');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        showErrorMessage('Lỗi kết nối: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gửi';
    }
});

// Load share count
async function loadChiaSe(id) {
    try {
        const response = await fetch(`/api/chia-se/${id}`);
        if (!response.ok) return;
        
        const count = await response.json();
        const shareCount = document.getElementById('shareCount');
        if (shareCount) {
            shareCount.textContent = `Số lượt chia sẻ: ${count.count || 0}`;
        }
    } catch (error) {
        console.error('Error loading share count:', error);
    }
}

// Report functions
function showReportForm() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để báo cáo!');
        window.location.href = '/dang-nhap';
        return;
    }
    
    const reportSection = document.getElementById('reportSection');
    const shareSection = document.getElementById('shareSection');
    
    if (shareSection) {
        shareSection.style.display = 'none';
    }
    
    if (!reportSection) return;
    
    if (reportSection.style.display === 'none' || !reportSection.style.display) {
        reportSection.style.display = 'block';
        reportSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        reportSection.style.display = 'none';
    }
}

// Export for global use
window.showReportForm = showReportForm;

function closeReportForm() {
    document.getElementById('reportSection').style.display = 'none';
    document.getElementById('reportForm').reset();
    document.getElementById('reportCharCount').textContent = '0';
}

// Report form submission
document.getElementById('reportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để báo cáo!');
        window.location.href = '/dang-nhap';
        return;
    }
    
    const loaiBaoCao = document.getElementById('loaiBaoCao').value;
    const lyDo = document.getElementById('lyDoBaoCao').value.trim();
    
    if (!loaiBaoCao || !lyDo) {
        showErrorMessage('Vui lòng điền đầy đủ thông tin!');
        return;
    }
    
    const submitBtn = document.getElementById('reportSubmitBtn');
    const submitText = document.getElementById('reportSubmitText');
    submitBtn.disabled = true;
    submitText.textContent = 'Đang gửi...';
    
    try {
        const response = await fetch('/api/bao-cao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id_bai_viet: currentPostId,
                ly_do: lyDo,
                loai_bao_cao: loaiBaoCao
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccessMessage(result.message || 'Cảm ơn bạn đã báo cáo!');
            closeReportForm();
        } else {
            showErrorMessage(result.message || 'Lỗi gửi báo cáo!');
            submitBtn.disabled = false;
            submitText.textContent = 'Gửi Báo Cáo';
        }
    } catch (error) {
        console.error('Error reporting:', error);
        showErrorMessage('Lỗi kết nối: ' + error.message);
        submitBtn.disabled = false;
        submitText.textContent = 'Gửi Báo Cáo';
    }
});

// Character count for report
document.getElementById('lyDoBaoCao').addEventListener('input', function(e) {
    const count = e.target.value.length;
    document.getElementById('reportCharCount').textContent = count;
});

// Share functions
function shareToFacebook() {
    const url = window.location.href;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareToInstagram() {
    alert('Để chia sẻ lên Instagram, vui lòng sao chép link và dán vào ứng dụng Instagram của bạn.');
    copyPostLink();
}

function copyPostLink() {
    const url = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showSuccessMessage('Đã sao chép link bài viết!');
        }).catch(() => {
            // Fallback for older browsers
            fallbackCopyText(url);
        });
    } else {
        fallbackCopyText(url);
    }
}

function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showSuccessMessage('Đã sao chép link bài viết!');
    } catch (err) {
        showErrorMessage('Không thể sao chép link');
    }
    document.body.removeChild(textarea);
}

// Export for global use
window.shareToFacebook = shareToFacebook;
window.shareToInstagram = shareToInstagram;
window.copyPostLink = copyPostLink;

// Share to own account (create a new post with link)
document.getElementById('shareForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để chia sẻ!');
        window.location.href = '/dang-nhap';
        return;
    }
    
    const shareTextarea = document.getElementById('shareTextarea');
    const shareText = shareTextarea.value.trim();
    const postUrl = window.location.href;
    
    const submitBtn = document.getElementById('shareSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang chia sẻ...';
    
    try {
        const response = await fetch('/api/chia-se', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id_bai_viet: currentPostId,
                noi_dung: shareText ? `${shareText}\n\n📎 ${postUrl}` : `📎 ${postUrl}`
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            shareTextarea.value = '';
            await loadChiaSe(currentPostId);
            showSuccessMessage('Đã chia sẻ bài viết!');
        } else {
            showErrorMessage(result.message || 'Lỗi chia sẻ bài viết!');
        }
    } catch (error) {
        console.error('Error sharing:', error);
        showErrorMessage('Lỗi kết nối: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Chia Sẻ';
    }
});

// Update share button to show share options
document.getElementById('shareBtn').addEventListener('click', function(e) {
    e.preventDefault();
    showShareOptions();
});

function showShareOptions() {
    const shareSection = document.getElementById('shareSection');
    if (shareSection.style.display === 'none' || !shareSection.style.display) {
        shareSection.style.display = 'block';
        shareSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        shareSection.style.display = 'none';
    }
}

// Scroll to comments
function scrollToComments() {
    const commentsSection = document.getElementById('commentsSection');
    const commentInput = document.getElementById('commentInput');
    if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
        if (commentInput) {
            commentInput.focus();
        }
    }
}

// Export for global use
window.scrollToComments = scrollToComments;

// Handle comment input auto-resize
document.getElementById('commentInput').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Message functions already defined above

// Initialize
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    currentPostId = urlParams.get('id');
    
    if (!currentPostId) {
        document.querySelector('.post-detail-container').innerHTML = `
            <div style="text-align: center; padding: var(--spacing-2xl);">
                <h2>⚠️ Không tìm thấy bài viết</h2>
                <p>Vui lòng chọn bài viết từ trang chủ</p>
                <a href="/" class="btn btn-primary mt-3">Về trang chủ</a>
            </div>
        `;
        return;
    }
    
    await loadBaiVietDetail(currentPostId);
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);
