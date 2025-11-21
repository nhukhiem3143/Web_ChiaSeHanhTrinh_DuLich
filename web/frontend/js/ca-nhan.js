// Load profile
async function loadProfile() {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id_nguoi_dung');
    
    if (!token || !id) {
        showErrorMessage('Vui lòng đăng nhập!');
        setTimeout(() => {
            window.location.href = '/dang-nhap';
        }, 1500);
        return;
    }
    
    try {
        const response = await fetch(`/api/nguoi-dung/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = '/dang-nhap';
                return;
            }
            throw new Error('Không thể tải thông tin người dùng');
        }
        
        const user = await response.json();
        
        // Update profile header
        const profileName = document.getElementById('profileName');
        const profileUsername = document.getElementById('profileUsername');
        const profileBio = document.getElementById('profileBio');
        const profileAvatar = document.getElementById('profileAvatar');
        
        profileName.textContent = user.ho_ten || 'Người dùng';
        profileUsername.textContent = `@${user.ten_dang_nhap || 'username'}`;
        profileBio.textContent = user.tieu_su || 'Chưa có tiểu sử. Hãy cập nhật thông tin của bạn!';
        
        // Update avatar
        if (user.anh_dai_dien) {
            profileAvatar.innerHTML = `<img src="${user.anh_dai_dien}" alt="${user.ho_ten || user.ten_dang_nhap}" class="profile-avatar-img">`;
        } else {
            const initial = (user.ho_ten || user.ten_dang_nhap || '?').charAt(0).toUpperCase();
            profileAvatar.innerHTML = `<div class="avatar-placeholder">${initial}</div>`;
        }
        
        // Set bio value
        document.getElementById('tieu_su').value = user.tieu_su || '';
        document.getElementById('bioCharCount').textContent = (user.tieu_su || '').length;
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showErrorMessage('Lỗi tải thông tin: ' + error.message);
    }
}

// Update profile
document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id_nguoi_dung');
    
    if (!token || !id) {
        showErrorMessage('Vui lòng đăng nhập!');
        return;
    }
    
    const formData = new FormData();
    const tieuSu = document.getElementById('tieu_su').value.trim();
    const avatarFile = document.getElementById('anh_dai_dien').files[0];
    
    formData.append('tieu_su', tieuSu);
    if (avatarFile) {
        formData.append('anh_dai_dien', avatarFile);
    }
    
    const updateBtn = document.getElementById('updateBtn');
    const updateBtnText = document.getElementById('updateBtnText');
    updateBtn.disabled = true;
    updateBtnText.textContent = 'Đang cập nhật...';
    
    try {
        const response = await fetch(`/api/nguoi-dung/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccessMessage(result.message || 'Cập nhật thành công!');
            setTimeout(() => {
                loadProfile();
                loadBaiVietCaNhan();
                toggleEditForm();
            }, 1000);
        } else {
            showErrorMessage(result.message || 'Cập nhật thất bại!');
            updateBtn.disabled = false;
            updateBtnText.textContent = 'Cập Nhật';
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showErrorMessage('Lỗi kết nối: ' + error.message);
        updateBtn.disabled = false;
        updateBtnText.textContent = 'Cập Nhật';
    }
});

// Load my posts
async function loadBaiVietCaNhan() {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id_nguoi_dung');
    
    if (!token || !id) {
        return;
    }
    
    const loading = document.getElementById('loading-posts');
    const emptyPosts = document.getElementById('empty-posts');
    const postsGrid = document.getElementById('bai-viet-ca-nhan');
    const postsCount = document.getElementById('postsCount');
    
    loading.style.display = 'block';
    emptyPosts.style.display = 'none';
    postsGrid.innerHTML = '';
    
    try {
        const response = await fetch(`/api/bai-viet/nguoi-dung/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Không thể tải bài viết');
        }
        
        const baiViet = await response.json();
        loading.style.display = 'none';
        
        // Update stats
        const totalViews = baiViet.reduce((sum, bv) => sum + (bv.luot_xem || 0), 0);
        document.getElementById('statPosts').textContent = baiViet.length;
        document.getElementById('statViews').textContent = totalViews;
        postsCount.textContent = `${baiViet.length} bài viết`;
        
        if (!baiViet || baiViet.length === 0) {
            emptyPosts.style.display = 'block';
            return;
        }
        
        postsGrid.innerHTML = '';
        
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };
        
        baiViet.forEach(bv => {
            const card = document.createElement('article');
            card.className = 'profile-post-card fade-in';
            card.onclick = () => window.location.href = `/xem-bai?id=${bv.id_bai_viet}`;
            
            card.innerHTML = `
                ${bv.anh_bia ? `
                    <img src="${bv.anh_bia}" alt="${bv.tieu_de}" class="profile-post-image" onerror="this.style.display='none'">
                ` : `
                    <div class="profile-post-image" style="background: linear-gradient(135deg, #1877f2 0%, #42a5f5 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">🌴</div>
                `}
                <div class="profile-post-content">
                    <h3 class="profile-post-title">${bv.tieu_de || 'Không có tiêu đề'}</h3>
                    ${bv.mo_ta_ngan ? `<p style="color: var(--text-secondary); font-size: 0.875rem; margin: var(--spacing-sm) 0;">${bv.mo_ta_ngan}</p>` : ''}
                    <div class="profile-post-meta">
                        <span>📅 ${formatDate(bv.ngay_dang)}</span>
                        <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-sm);">
                            <span>👁️ ${bv.luot_xem || 0}</span>
                            <span>💬 ${bv.so_binh_luan || 0}</span>
                            <span>❤️ ${bv.so_reaction || 0}</span>
                            <span>📤 ${bv.so_chia_se || 0}</span>
                        </div>
                    </div>
                    <div class="profile-post-actions" style="margin-top: var(--spacing-md);">
                        <button class="btn btn-outline btn-sm" onclick="deletePost(${bv.id_bai_viet})" style="color: var(--danger-color); border-color: var(--danger-color);">
                            🗑️ Xóa
                        </button>
                    </div>
                </div>
            `;
            
            postsGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading posts:', error);
        loading.style.display = 'none';
        emptyPosts.style.display = 'block';
        emptyPosts.innerHTML = `
            <div class="empty-state-icon">⚠️</div>
            <h3>Lỗi tải bài viết</h3>
            <p>${error.message}</p>
            <button onclick="loadBaiVietCaNhan()" class="btn btn-primary mt-3">Thử lại</button>
        `;
    }
}

// Message functions
function showSuccessMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message success';
    msgDiv.textContent = message;
    document.querySelector('.profile-container').insertBefore(msgDiv, document.querySelector('.profile-header'));
    setTimeout(() => msgDiv.remove(), 3000);
}

function showErrorMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message error';
    msgDiv.textContent = message;
    document.querySelector('.profile-container').insertBefore(msgDiv, document.querySelector('.profile-header'));
    setTimeout(() => msgDiv.remove(), 5000);
}

// Delete post
async function deletePost(postId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.')) {
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        showErrorMessage('Vui lòng đăng nhập!');
        return;
    }

    try {
        const response = await fetch(`/api/bai-viet/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (response.ok) {
            showSuccessMessage(result.message || 'Xóa bài viết thành công!');
            // Reload posts
            loadBaiVietCaNhan();
        } else {
            showErrorMessage(result.message || 'Xóa bài viết thất bại!');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        showErrorMessage('Lỗi kết nối: ' + error.message);
    }
}

// Load user's reports
async function loadBaoCaoCaNhan() {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id_nguoi_dung');

    if (!token || !id) {
        return;
    }

    const loading = document.getElementById('loading-reports');
    const emptyReports = document.getElementById('empty-reports');
    const reportsList = document.getElementById('bao-cao-ca-nhan');
    const reportsCount = document.getElementById('reportsCount');

    loading.style.display = 'block';
    emptyReports.style.display = 'none';
    reportsList.innerHTML = '';

    try {
        const response = await fetch(`/api/bao-cao/nguoi-dung/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Không thể tải báo cáo');
        }

        const baoCao = await response.json();
        loading.style.display = 'none';

        reportsCount.textContent = `${baoCao.length} báo cáo`;

        if (!baoCao || baoCao.length === 0) {
            emptyReports.style.display = 'block';
            return;
        }

        reportsList.innerHTML = '';

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const getStatusColor = (status) => {
            switch (status) {
                case 'cho_xu_ly': return '#ffa726';
                case 'dang_xu_ly': return '#42a5f5';
                case 'da_xu_ly': return '#66bb6a';
                case 'tu_choi': return '#ef5350';
                default: return '#999';
            }
        };

        const getStatusText = (status) => {
            switch (status) {
                case 'cho_xu_ly': return 'Chờ xử lý';
                case 'dang_xu_ly': return 'Đang xử lý';
                case 'da_xu_ly': return 'Đã xử lý';
                case 'tu_choi': return 'Từ chối';
                default: return status;
            }
        };

        baoCao.forEach(bc => {
            const reportItem = document.createElement('div');
            reportItem.className = 'report-item fade-in';

            reportItem.innerHTML = `
                <div class="report-header">
                    <h4 class="report-post-title">${bc.tieu_de || 'Bài viết đã bị xóa'}</h4>
                    <span class="report-status" style="background-color: ${getStatusColor(bc.trang_thai)}">
                        ${getStatusText(bc.trang_thai)}
                    </span>
                </div>
                <div class="report-details">
                    <div class="report-meta">
                        <span>📅 ${formatDate(bc.ngay_bao_cao)}</span>
                        <span>🏷️ ${bc.loai_bao_cao === 'spam' ? 'Spam' :
                                   bc.loai_bao_cao === 'noi_dung_khong_phu_hop' ? 'Nội dung không phù hợp' :
                                   bc.loai_bao_cao === 'quang_cao' ? 'Quảng cáo' :
                                   bc.loai_bao_cao === 'vi_pham_ban_quyen' ? 'Vi phạm bản quyền' :
                                   'Khác'}</span>
                    </div>
                    <div class="report-reason">
                        <strong>Lý do:</strong> ${bc.ly_do || 'Không có lý do'}
                    </div>
                    ${bc.ghi_chu_admin ? `
                        <div class="report-admin-note">
                            <strong>Ghi chú từ admin:</strong> ${bc.ghi_chu_admin}
                        </div>
                    ` : ''}
                </div>
            `;

            reportsList.appendChild(reportItem);
        });

    } catch (error) {
        console.error('Error loading reports:', error);
        loading.style.display = 'none';
        emptyReports.style.display = 'block';
        emptyReports.innerHTML = `
            <div class="empty-state-icon">⚠️</div>
            <h3>Lỗi tải báo cáo</h3>
            <p>${error.message}</p>
            <button onclick="loadBaoCaoCaNhan()" class="btn btn-primary mt-3">Thử lại</button>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    loadBaiVietCaNhan();
    loadBaoCaoCaNhan();
});
