document.getElementById('dang-nhap-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang đăng nhập...';
    
    const data = {
        ten_dang_nhap: document.getElementById('ten_dang_nhap').value.trim(),
        mat_khau: document.getElementById('mat_khau').value
    };
    
    // Validation
    if (!data.ten_dang_nhap || !data.mat_khau) {
        showError('Vui lòng điền đầy đủ thông tin!');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    try {
        const response = await fetch('/api/dang-nhap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log('Login response:', result);

        if (response.ok && result.token) {
            console.log('Login successful, vai_tro:', result.vai_tro);
            // Lưu thông tin vào localStorage
            localStorage.setItem('token', result.token);
            localStorage.setItem('id_nguoi_dung', result.id_nguoi_dung);
            localStorage.setItem('ten_dang_nhap', result.ten_dang_nhap || '');
            localStorage.setItem('ho_ten', result.ho_ten || '');
            localStorage.setItem('email', result.email || '');
            localStorage.setItem('vai_tro', result.vai_tro || 'user');
            
            showSuccess('Đăng nhập thành công!');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showError(result.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        showError('Lỗi kết nối: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

function showError(message) {
    const errorDiv = document.getElementById('error-message') || document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.className = 'message error';
    errorDiv.textContent = message;
    const form = document.querySelector('form');
    if (!document.getElementById('error-message')) {
        form.parentNode.insertBefore(errorDiv, form);
    } else {
        errorDiv.textContent = message;
    }
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message') || document.createElement('div');
    successDiv.id = 'success-message';
    successDiv.className = 'message success';
    successDiv.textContent = message;
    const form = document.querySelector('form');
    if (!document.getElementById('success-message')) {
        form.parentNode.insertBefore(successDiv, form);
    } else {
        successDiv.textContent = message;
    }
}
