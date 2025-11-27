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
    // Tạo dialog nếu chưa có
    let dialog = document.getElementById('logoutDialog');
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.id = 'logoutDialog';
        dialog.style.position = 'fixed';
        dialog.style.top = '0';
        dialog.style.left = '0';
        dialog.style.width = '100%';
        dialog.style.height = '100%';
        dialog.style.background = 'rgba(0,0,0,0.45)';
        dialog.style.display = 'flex';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';
        dialog.style.zIndex = '9999';

        dialog.innerHTML = `
            <div style="background:#fff;padding:22px 28px;border-radius:10px;
                        width:360px;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,0.2)">
                <h2 style="margin-bottom:10px">Đăng xuất?</h2>
                <p>Bạn có chắc chắn muốn đăng xuất tài khoản?</p>
                <div style="margin-top:18px;display:flex;justify-content:space-between">
                    <button id="cancelLogout" style="padding:10px 18px;border-radius:6px;background:#ddd;border:none;cursor:pointer">
                        Hủy
                    </button>
                    <button id="confirmLogout" style="padding:10px 18px;border-radius:6px;background:#e53e3e;color:#fff;border:none;cursor:pointer">
                        Đăng Xuất
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // xử lý nút
        document.getElementById('cancelLogout').onclick = () => dialog.remove();
        document.getElementById('confirmLogout').onclick = () => {
            localStorage.clear();
            window.location.href = '/';
        };
    }
}
