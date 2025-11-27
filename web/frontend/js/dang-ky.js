document.getElementById('dang-ky-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';
    
    const data = {
        ten_dang_nhap: document.getElementById('ten_dang_nhap').value.trim(),
        mat_khau: document.getElementById('mat_khau').value,
        email: document.getElementById('email').value.trim(),
        ho_ten: document.getElementById('ho_ten').value.trim()
    };
    
    // Validation
    if (!data.ten_dang_nhap || !data.mat_khau || !data.email || !data.ho_ten) {
        showError('Vui lòng điền đầy đủ thông tin!');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    if (data.mat_khau.length < 6) {
        showError('Mật khẩu phải có ít nhất 6 ký tự!');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    try {
        const response = await fetch('/api/dang-ky', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(result.message || 'Đăng ký thành công!');
            setTimeout(() => {
                window.location.href = '/dang-nhap';
            }, 1500);
        } else {
            showError(result.message || 'Đăng ký thất bại!');
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
    if (!document.getElementById('error-message')) {
        document.querySelector('form').parentNode.insertBefore(errorDiv, document.querySelector('form'));
    } else {
        errorDiv.textContent = message;
    }
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        setTimeout(() => errorDiv.remove(), 400);
    }, 5000);

}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message') || document.createElement('div');
    successDiv.id = 'success-message';
    successDiv.className = 'message success';
    successDiv.textContent = message;
    if (!document.getElementById('success-message')) {
        document.querySelector('form').parentNode.insertBefore(successDiv, document.querySelector('form'));
    } else {
        successDiv.textContent = message;
    }
}
