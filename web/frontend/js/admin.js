// Admin Panel JavaScript
let currentReportId = null;

// Load reports
async function loadReports() {
    const loading = document.getElementById('loading-reports');
    const reportsList = document.getElementById('reports-list');
    const reportsCount = document.getElementById('reports-count');

    loading.style.display = 'block';
    reportsList.innerHTML = '';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/bao-cao', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Không thể tải báo cáo');
        }

        const reports = await response.json();

        // Update count
        reportsCount.textContent = `${reports.length} báo cáo`;

        if (reports.length === 0) {
            reportsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✅</div>
                    <h3>Không có báo cáo nào</h3>
                    <p>Tất cả báo cáo đã được xử lý.</p>
                </div>
            `;
            return;
        }

        // Render reports
        reports.forEach(report => {
            const reportItem = createReportItem(report);
            reportsList.appendChild(reportItem);
        });

    } catch (error) {
        console.error('Error loading reports:', error);
        reportsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>Lỗi tải dữ liệu</h3>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// Create report item element
function createReportItem(report) {
    const item = document.createElement('div');
    item.className = 'report-admin-item';

    const statusClasses = {
        'cho_xu_ly': 'pending',
        'dang_xu_ly': 'processing',
        'da_xu_ly': 'resolved',
        'tu_choi': 'rejected'
    };

    const statusLabels = {
        'cho_xu_ly': 'Chờ xử lý',
        'dang_xu_ly': 'Đang xử lý',
        'da_xu_ly': 'Đã xử lý',
        'tu_choi': 'Từ chối'
    };

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

    item.innerHTML = `
        <div class="report-header">
            <div>
                <div class="report-title">${report.tieu_de || 'Bài viết đã bị xóa'}</div>
                <div class="report-meta">
                    <span>👤 ${report.ten_nguoi_bao_cao}</span>
                    <span>📅 ${formatDate(report.ngay_bao_cao)}</span>
                    <span class="report-status ${statusClasses[report.trang_thai] || 'pending'}">
                        ${statusLabels[report.trang_thai] || 'Chờ xử lý'}
                    </span>
                </div>
            </div>
        </div>
        <div class="report-content">
            <div class="report-reason">
                <strong>Lý do báo cáo:</strong> ${report.ly_do}
            </div>
            ${report.loai_bao_cao ? `<div><strong>Loại:</strong> ${getReportTypeLabel(report.loai_bao_cao)}</div>` : ''}
        </div>
        <div class="report-actions">
            <button class="btn-admin btn-admin-view" onclick="viewReport(${report.id_bao_cao})">Xem Chi Tiết</button>
            ${report.trang_thai === 'cho_xu_ly' ? `
                <button class="btn-admin btn-admin-process" onclick="processReport(${report.id_bao_cao})">Đang Xử Lý</button>
                <button class="btn-admin btn-admin-resolve" onclick="resolveReport(${report.id_bao_cao})">Đã Xử Lý</button>
                <button class="btn-admin btn-admin-reject" onclick="rejectReport(${report.id_bao_cao})">Từ Chối</button>
            ` : ''}
        </div>
    `;

    return item;
}

// Get report type label
function getReportTypeLabel(type) {
    const labels = {
        'spam': 'Spam',
        'noi_dung_khong_phu_hop': 'Nội dung không phù hợp',
        'quang_cao': 'Quảng cáo',
        'vi_pham_ban_quyen': 'Vi phạm bản quyền',
        'khac': 'Khác'
    };
    return labels[type] || type;
}

// View report details
async function viewReport(id) {
    currentReportId = id;
    const modal = document.getElementById('report-modal');
    const modalBody = document.getElementById('modal-body');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/bao-cao/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Không thể tải chi tiết báo cáo');
        }

        const report = await response.json();

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

        modalBody.innerHTML = `
            <div class="report-detail">
                <div class="detail-section">
                    <h4>📝 Thông Tin Bài Viết</h4>
                    <p><strong>Tiêu đề:</strong> ${report.tieu_de || 'Bài viết đã bị xóa'}</p>
                    <p><strong>ID:</strong> ${report.id_bai_viet}</p>
                    <div style="margin-top: var(--spacing-md);">
                        <button class="btn btn-primary" onclick="viewPost(${report.id_bai_viet})" style="margin-right: var(--spacing-sm);">👁️ Xem Bài Viết</button>
                        <button class="btn btn-warning" onclick="hidePost(${report.id_bai_viet})" style="margin-right: var(--spacing-sm);">🙈 Ẩn Bài Viết</button>
                        <button class="btn btn-success" onclick="unhidePost(${report.id_bai_viet})" style="margin-right: var(--spacing-sm);">👁️ Hiện Bài Viết</button>
                        <button class="btn btn-danger" onclick="deletePostAdmin(${report.id_bai_viet})">🗑️ Xóa Bài Viết</button>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>🚨 Thông Tin Báo Cáo</h4>
                    <div class="detail-meta">
                        <div class="detail-meta-item">
                            <div class="detail-meta-label">Người báo cáo</div>
                            <div class="detail-meta-value">${report.ten_nguoi_bao_cao}</div>
                        </div>
                        <div class="detail-meta-item">
                            <div class="detail-meta-label">Email</div>
                            <div class="detail-meta-value">${report.email_nguoi_bao_cao}</div>
                        </div>
                        <div class="detail-meta-item">
                            <div class="detail-meta-label">Ngày báo cáo</div>
                            <div class="detail-meta-value">${formatDate(report.ngay_bao_cao)}</div>
                        </div>
                        <div class="detail-meta-item">
                            <div class="detail-meta-label">Loại báo cáo</div>
                            <div class="detail-meta-value">${getReportTypeLabel(report.loai_bao_cao)}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>📄 Lý Do Báo Cáo</h4>
                    <p>${report.ly_do}</p>
                </div>

                ${report.ghi_chu_admin ? `
                    <div class="detail-section">
                        <h4>📝 Ghi Chú Admin</h4>
                        <p>${report.ghi_chu_admin}</p>
                    </div>
                ` : ''}
            </div>
        `;

        modal.style.display = 'block';

    } catch (error) {
        console.error('Error loading report details:', error);
        alert('Lỗi tải chi tiết báo cáo: ' + error.message);
    }
}

// Process report
async function processReport(id) {
    if (!confirm('Bạn có chắc muốn đánh dấu báo cáo này là "Đang xử lý"?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/bao-cao/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                trang_thai: 'dang_xu_ly'
            })
        });

        if (response.ok) {
            alert('Đã cập nhật trạng thái báo cáo!');
            loadReports();
            closeModal();
        } else {
            const error = await response.json();
            alert('Lỗi: ' + (error.message || 'Không thể cập nhật báo cáo'));
        }
    } catch (error) {
        console.error('Error processing report:', error);
        alert('Lỗi cập nhật báo cáo: ' + error.message);
    }
}

// Resolve report
async function resolveReport(id) {
    const note = prompt('Nhập ghi chú xử lý (tùy chọn):');
    if (note === null) return; // User cancelled

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/bao-cao/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                trang_thai: 'da_xu_ly',
                ghi_chu_admin: note || null
            })
        });

        if (response.ok) {
            alert('Đã xử lý báo cáo thành công!');
            loadReports();
            closeModal();
        } else {
            const error = await response.json();
            alert('Lỗi: ' + (error.message || 'Không thể xử lý báo cáo'));
        }
    } catch (error) {
        console.error('Error resolving report:', error);
        alert('Lỗi xử lý báo cáo: ' + error.message);
    }
}

// Reject report
async function rejectReport(id) {
    const note = prompt('Lý do từ chối (bắt buộc):');
    if (!note || note.trim() === '') {
        alert('Vui lòng nhập lý do từ chối!');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/bao-cao/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                trang_thai: 'tu_choi',
                ghi_chu_admin: note.trim()
            })
        });

        if (response.ok) {
            alert('Đã từ chối báo cáo!');
            loadReports();
            closeModal();
        } else {
            const error = await response.json();
            alert('Lỗi: ' + (error.message || 'Không thể từ chối báo cáo'));
        }
    } catch (error) {
        console.error('Error rejecting report:', error);
        alert('Lỗi từ chối báo cáo: ' + error.message);
    }
}

// Close modal
function closeModal() {
    document.getElementById('report-modal').style.display = 'none';
    currentReportId = null;
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));

    // Remove active class from nav items
    const navItems = document.querySelectorAll('.admin-nav a');
    navItems.forEach(item => item.classList.remove('active'));

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Add active class to clicked nav item
    const targetNav = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (targetNav) {
        targetNav.classList.add('active');
    }

    // Load data for the section
    if (sectionName === 'reports') {
        loadReports();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadReports();
});

// View post in new window
function viewPost(id) {
    window.open(`/xem-bai?id=${id}`, '_blank');
}

// Hide post (Admin only)
async function hidePost(id) {
    if (!confirm('Bạn có chắc muốn ẩn bài viết này? Bài viết sẽ không hiển thị công khai.')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/bai-viet/${id}/hide`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Đã ẩn bài viết thành công!');
            // Reload modal content if it's open
            if (currentReportId) {
                viewReport(currentReportId);
            }
        } else {
            const error = await response.json();
            alert('Lỗi: ' + (error.message || 'Không thể ẩn bài viết'));
        }
    } catch (error) {
        console.error('Error hiding post:', error);
        alert('Lỗi ẩn bài viết: ' + error.message);
    }
}

// Unhide post (Admin only)
async function unhidePost(id) {
    if (!confirm('Bạn có chắc muốn hiện lại bài viết này? Bài viết sẽ hiển thị công khai.')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/bai-viet/${id}/unhide`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Đã hiện lại bài viết thành công!');
            // Reload modal content if it's open
            if (currentReportId) {
                viewReport(currentReportId);
            }
        } else {
            const error = await response.json();
            alert('Lỗi: ' + (error.message || 'Không thể hiện lại bài viết'));
        }
    } catch (error) {
        console.error('Error unhiding post:', error);
        alert('Lỗi hiện lại bài viết: ' + error.message);
    }
}

// Delete post (Admin only)
async function deletePostAdmin(id) {
    if (!confirm('Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/bai-viet/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Đã xóa bài viết thành công!');
            closeModal();
            loadReports(); // Reload reports list
        } else {
            const error = await response.json();
            alert('Lỗi: ' + (error.message || 'Không thể xóa bài viết'));
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Lỗi xóa bài viết: ' + error.message);
    }
}

// Load users (Admin only) - Only show regular users, not admins
async function loadUsers() {
    const loading = document.getElementById('loading-users');
    const usersList = document.getElementById('users-list');
    const usersCount = document.getElementById('users-count');

    loading.style.display = 'block';
    usersList.innerHTML = '';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/nguoi-dung', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Không thể tải danh sách người dùng');
        }

        const allUsers = await response.json();

        // Filter out admin users, only show regular users
        const users = allUsers.filter(user => !user.la_admin);

        // Update count
        usersCount.textContent = `${users.length} người dùng`;

        if (users.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h3>Không có người dùng nào</h3>
                    <p>Không tìm thấy dữ liệu người dùng.</p>
                </div>
            `;
            return;
        }

        // Render users
        users.forEach(user => {
            const userItem = createUserItem(user);
            usersList.appendChild(userItem);
        });

    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>Lỗi tải dữ liệu</h3>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// Create user item element
function createUserItem(user) {
    const item = document.createElement('div');
    item.className = 'user-admin-item';

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

    item.innerHTML = `
        <div class="user-header">
            <div class="user-avatar">
                ${user.anh_dai_dien ? `<img src="${user.anh_dai_dien}" alt="${user.ten_dang_nhap}">` : '👤'}
            </div>
            <div>
                <div class="user-name">${user.ho_ten || user.ten_dang_nhap}</div>
                <div class="user-meta">
                    <span>@${user.ten_dang_nhap}</span>
                    <span>📧 ${user.email}</span>
                    <span>📅 ${formatDate(user.ngay_tao)}</span>
                    <span class="user-role ${user.la_admin ? 'admin' : 'user'}">
                        ${user.la_admin ? 'Admin' : 'User'}
                    </span>
                </div>
            </div>
        </div>
        <div class="user-stats">
            <div class="stat-item">
                <span class="stat-label">Bài viết:</span>
                <span class="stat-value">${user.so_bai_viet || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Bình luận:</span>
                <span class="stat-value">${user.so_binh_luan || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Báo cáo:</span>
                <span class="stat-value">${user.so_bao_cao || 0}</span>
            </div>
        </div>
        <div class="user-status">
            <span class="status-badge ${user.trang_thai ? 'active' : 'banned'}">
                ${user.trang_thai ? 'Hoạt động' : 'Đã cấm'}
            </span>
        </div>
        <div class="user-actions">
            ${user.trang_thai ? `<button class="btn-admin btn-admin-ban" onclick="banUser(${user.id_nguoi_dung})">Cấm Tài Khoản</button>` : `<button class="btn-admin btn-admin-unban" onclick="unbanUser(${user.id_nguoi_dung})">Bỏ Cấm</button>`}
        </div>
    `;

    return item;
}

// Load posts (Admin only)
async function loadPosts() {
    const loading = document.getElementById('loading-posts');
    const postsList = document.getElementById('posts-list');
    const postsCount = document.getElementById('posts-count');

    loading.style.display = 'block';
    postsList.innerHTML = '';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/bai-viet', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Không thể tải danh sách bài viết');
        }

        const posts = await response.json();

        // Update count
        postsCount.textContent = `${posts.length} bài viết`;

        if (posts.length === 0) {
            postsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3>Không có bài viết nào</h3>
                    <p>Không tìm thấy dữ liệu bài viết.</p>
                </div>
            `;
            return;
        }

        // Render posts
        posts.forEach(post => {
            const postItem = createPostItem(post);
            postsList.appendChild(postItem);
        });

    } catch (error) {
        console.error('Error loading posts:', error);
        postsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>Lỗi tải dữ liệu</h3>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// Create post item element
function createPostItem(post) {
    const item = document.createElement('div');
    item.className = 'post-admin-item';

    const statusClasses = {
        'cong_khai': 'public',
        'an': 'hidden',
        'da_xoa': 'deleted'
    };

    const statusLabels = {
        'cong_khai': 'Công khai',
        'an': 'Ẩn',
        'da_xoa': 'Đã xóa'
    };

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

    item.innerHTML = `
        <div class="post-header">
            <div>
                <div class="post-title">${post.tieu_de}</div>
                <div class="post-meta">
                    <span>👤 ${post.ten_dang_nhap}</span>
                    <span>📅 ${formatDate(post.ngay_dang)}</span>
                    <span class="post-status ${statusClasses[post.trang_thai] || 'public'}">
                        ${statusLabels[post.trang_thai] || 'Công khai'}
                    </span>
                </div>
            </div>
        </div>
        <div class="post-content">
            <div class="post-excerpt">${post.mo_ta_ngan || post.noi_dung.substring(0, 200) + '...'}</div>
        </div>
        <div class="post-stats">
            <div class="stat-item">
                <span class="stat-label">👁️ Xem:</span>
                <span class="stat-value">${post.luot_xem || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">💬 Bình luận:</span>
                <span class="stat-value">${post.so_binh_luan || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">👍 Reaction:</span>
                <span class="stat-value">${post.so_reaction || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">🔄 Chia sẻ:</span>
                <span class="stat-value">${post.so_chia_se || 0}</span>
            </div>
        </div>
        <div class="post-actions">
            <button class="btn-admin btn-admin-view" onclick="viewPost(${post.id_bai_viet})">👁️ Xem</button>
            ${post.trang_thai === 'cong_khai' ? `
                <button class="btn-admin btn-admin-hide" onclick="hidePost(${post.id_bai_viet})">🙈 Ẩn</button>
            ` : post.trang_thai === 'an' ? `
                <button class="btn-admin btn-admin-unhide" onclick="unhidePost(${post.id_bai_viet})">👁️ Hiện</button>
            ` : ''}
            <button class="btn-admin btn-admin-delete" onclick="deletePostAdmin(${post.id_bai_viet})">🗑️ Xóa</button>
        </div>
    `;

    return item;
}

// Load stats (Admin only)
async function loadStats() {
    const loading = document.getElementById('loading-stats');
    const statsContent = document.getElementById('stats-content');

    loading.style.display = 'block';
    statsContent.innerHTML = '';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/thong-ke', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Không thể tải thống kê');
        }

        const stats = await response.json();

        statsContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <div class="stat-number">${stats.tong_nguoi_dung || 0}</div>
                        <div class="stat-label">Tổng người dùng</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📝</div>
                    <div class="stat-info">
                        <div class="stat-number">${stats.tong_bai_viet || 0}</div>
                        <div class="stat-label">Tổng bài viết</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🚨</div>
                    <div class="stat-info">
                        <div class="stat-number">${stats.tong_bao_cao || 0}</div>
                        <div class="stat-label">Tổng báo cáo</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💬</div>
                    <div class="stat-info">
                        <div class="stat-number">${stats.tong_binh_luan || 0}</div>
                        <div class="stat-label">Tổng bình luận</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">👍</div>
                    <div class="stat-info">
                        <div class="stat-number">${stats.tong_reaction || 0}</div>
                        <div class="stat-label">Tổng reaction</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔄</div>
                    <div class="stat-info">
                        <div class="stat-number">${stats.tong_chia_se || 0}</div>
                        <div class="stat-label">Tổng chia sẻ</div>
                    </div>
                </div>
            </div>
        `;

        // Load chart data
        await loadChartData();

    } catch (error) {
        console.error('Error loading stats:', error);
        statsContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>Lỗi tải thống kê</h3>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// Load chart data
async function loadChartData() {
    try {
        const token = localStorage.getItem('token');

        // Load reports chart data
        const reportsResponse = await fetch('/api/admin/bao-cao/thong-ke', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (reportsResponse.ok) {
            const reportsData = await reportsResponse.json();
            createReportsChart(reportsData);
        }

        // Load users chart data
        const usersResponse = await fetch('/api/admin/nguoi-dung/thong-ke', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            createUsersChart(usersData);
        }

    } catch (error) {
        console.error('Error loading chart data:', error);
    }
}

// Create reports status chart
function createReportsChart(data) {
    const ctx = document.getElementById('reportsChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Chờ xử lý', 'Đang xử lý', 'Đã xử lý', 'Từ chối'],
            datasets: [{
                data: [
                    data.cho_xu_ly || 0,
                    data.dang_xu_ly || 0,
                    data.da_xu_ly || 0,
                    data.tu_choi || 0
                ],
                backgroundColor: [
                    '#ffc107', // pending
                    '#17a2b8', // processing
                    '#28a745', // resolved
                    '#dc3545'  // rejected
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create users activity chart
function createUsersChart(data) {
    const ctx = document.getElementById('usersChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Người dùng hoạt động', 'Người dùng bị cấm'],
            datasets: [{
                label: 'Số lượng',
                data: [
                    data.active || 0,
                    data.banned || 0
                ],
                backgroundColor: [
                    '#28a745',
                    '#dc3545'
                ],
                borderWidth: 1,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Số lượng: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
}

// Ban user
async function banUser(id) {
    const reason = prompt('Lý do cấm tài khoản (bắt buộc):');
    if (!reason || reason.trim() === '') {
        alert('Vui lòng nhập lý do cấm tài khoản!');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/nguoi-dung/${id}/ban`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ly_do: reason.trim() })
        });

        if (response.ok) {
            alert('Đã cấm tài khoản thành công!');
            loadUsers();
        } else {
            const error = await response.json();
            alert('Lỗi: ' + (error.message || 'Không thể cấm tài khoản'));
        }
    } catch (error) {
        console.error('Error banning user:', error);
        alert('Lỗi cấm tài khoản: ' + error.message);
    }
}

// Unban user
async function unbanUser(id) {
    if (!confirm('Bạn có chắc muốn bỏ cấm tài khoản này?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/nguoi-dung/${id}/unban`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Đã bỏ cấm tài khoản thành công!');
            loadUsers();
        } else {
            const error = await response.json();
            alert('Lỗi: ' + (error.message || 'Không thể bỏ cấm tài khoản'));
        }
    } catch (error) {
        console.error('Error unbanning user:', error);
        alert('Lỗi bỏ cấm tài khoản: ' + error.message);
    }
}

// Update showSection to load data for new sections
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));

    // Remove active class from nav items
    const navItems = document.querySelectorAll('.admin-nav a');
    navItems.forEach(item => item.classList.remove('active'));

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Add active class to clicked nav item
    const targetNav = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (targetNav) {
        targetNav.classList.add('active');
    }

    // Load data for the section
    if (sectionName === 'reports') {
        loadReports();
    } else if (sectionName === 'users') {
        loadUsers();
    } else if (sectionName === 'posts') {
        loadPosts();
    } else if (sectionName === 'stats') {
        loadStats();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('report-modal');
    if (event.target === modal) {
        closeModal();
    }
};
