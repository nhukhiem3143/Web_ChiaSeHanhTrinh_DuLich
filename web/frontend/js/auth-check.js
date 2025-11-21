// Check authentication status and update navigation
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const userMenu = document.getElementById('userMenu');
    
    if (token && userMenu) {
        const hoTen = localStorage.getItem('ho_ten') || localStorage.getItem('ten_dang_nhap') || 'Người dùng';
        const vaiTro = localStorage.getItem('vai_tro') || 'user';
        const profileLink = vaiTro === 'admin' ? '/admin' : '/ca-nhan';
        const profileText = vaiTro === 'admin' ? 'Trang Quản Trị' : 'Trang Cá Nhân';
        userMenu.innerHTML = `
            <span style="color: var(--text-primary);">Xin chào, ${hoTen}</span>
            <a href="${profileLink}" class="btn btn-secondary">${profileText}</a>
            <button onclick="logout()" class="btn btn-outline">Đăng Xuất</button>
        `;
    }
});

function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.clear();
        window.location.href = '/';
    }
}

