// Global variables
let hashtags = [];
let diaDiemList = [];
let phuongTienList = [];
let khachSanList = [];
let doAnList = [];

// Initialize - add first location
document.addEventListener('DOMContentLoaded', function() {
    addDiaDiem();
});

// Add location with map
function addDiaDiem() {
    const container = document.getElementById('dia-diem-container');
    const index = diaDiemList.length;
    const item = document.createElement('div');
    item.className = 'dia-diem-item';
    item.id = `dia-diem-${index}`;
    item.innerHTML = `
        <div class="dia-diem-item-header">
            <h3 class="dia-diem-item-title">Địa Điểm ${index + 1}</h3>
            <button type="button" class="remove-dia-diem-btn" onclick="removeDiaDiem(${index})">Xóa</button>
        </div>
        <div class="form-group">
            <label>Tên Địa Điểm *</label>
            <input type="text" class="ten_dia_diem" placeholder="Ví dụ: Hồ Xuân Hương" required>
        </div>
        <div class="form-group">
            <label>Loại Địa Điểm *</label>
            <select class="loai_dia_diem" required>
                <option value="">Chọn loại...</option>
                <option value="tham_quan">Tham Quan</option>
                <option value="an_uong">Ăn Uống</option>
                <option value="nghi_ngoi">Nghỉ Ngơi</option>
                <option value="hoat_dong">Hoạt Động</option>
            </select>
        </div>
        <div class="form-group">
            <label>Địa Chỉ *</label>
            <input type="text" class="dia_chi" placeholder="Nhập địa chỉ để hiển thị bản đồ" required onblur="updateMap(${index})">
        </div>
        <div class="map-preview" id="map-${index}">
            <p style="text-align: center; color: var(--text-muted); padding: var(--spacing-lg);">
                Nhập địa chỉ để hiển thị bản đồ
            </p>
        </div>
        <div class="form-group">
            <label>Giá Tiền (VNĐ)</label>
            <input type="number" class="gia_tien" step="1000" placeholder="Ví dụ: 100000">
        </div>
        <div class="form-group">
            <label>Ghi Chú</label>
            <textarea class="ghi_chu" placeholder="Thông tin bổ sung về địa điểm..." rows="3"></textarea>
        </div>
    `;
    container.appendChild(item);
    diaDiemList.push({ index });
}

function removeDiaDiem(index) {
    const item = document.getElementById(`dia-diem-${index}`);
    if (item) {
        item.remove();
        diaDiemList = diaDiemList.filter((_, i) => i !== index);
        // Re-index
        document.querySelectorAll('.dia-diem-item').forEach((item, i) => {
            item.querySelector('.dia-diem-item-title').textContent = `Địa Điểm ${i + 1}`;
        });
    }
}

function updateMap(index) {
    const item = document.getElementById(`dia-diem-${index}`);
    const address = item.querySelector('.dia_chi').value;
    const mapContainer = document.getElementById(`map-${index}`);
    
    if (address && typeof google !== 'undefined') {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, function(results, status) {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAT7ytkh_fmCi7gz6P9rsOWZ6UHDKQra1U&q=${encodeURIComponent(address)}&zoom=15`;
                mapContainer.innerHTML = `<iframe src="${mapUrl}" allowfullscreen></iframe>`;
            } else {
                mapContainer.innerHTML = `
                    <p style="text-align: center; color: var(--text-muted); padding: var(--spacing-lg);">
                        Không tìm thấy địa chỉ. Vui lòng thử lại.
                    </p>
                `;
            }
        });
    }
}

// Add transportation
function addPhuongTien() {
    const container = document.getElementById('phuong-tien-list');
    const item = document.createElement('div');
    item.className = 'travel-info-item';
    item.innerHTML = `
        <div class="travel-info-row">
            <div class="form-group">
                <label>Loại Phương Tiện *</label>
                <select class="loai-phuong-tien" required>
                    <option value="">Chọn...</option>
                    <option value="may-bay">Máy bay</option>
                    <option value="tau-hoa">Tàu hỏa</option>
                    <option value="xe-khach">Xe khách</option>
                    <option value="xe-may">Xe máy</option>
                    <option value="o-to">Ô tô</option>
                    <option value="khac">Khác</option>
                </select>
            </div>
            <div class="form-group">
                <label>Chi Phí (VNĐ)</label>
                <input type="number" class="chi-phi-pt" step="1000" placeholder="Ví dụ: 500000">
            </div>
        </div>
        <div class="form-group">
            <label>Mô Tả</label>
            <textarea class="mo-ta-pt" placeholder="Thông tin về hành trình, nhà xe, điểm khởi hành..." rows="2"></textarea>
        </div>
        <button type="button" class="remove-travel-info-btn" onclick="this.parentElement.remove()">Xóa</button>
    `;
    container.appendChild(item);
}

// Add hotel
function addKhachSan() {
    const container = document.getElementById('khach-san-list');
    const item = document.createElement('div');
    item.className = 'travel-info-item';
    item.innerHTML = `
        <div class="travel-info-row">
            <div class="form-group">
                <label>Tên Khách Sạn/Nơi Ở *</label>
                <input type="text" class="ten-khach-san" placeholder="Ví dụ: Khách sạn Đà Lạt" required>
            </div>
            <div class="form-group">
                <label>Địa Chỉ</label>
                <input type="text" class="dia-chi-ks" placeholder="Địa chỉ khách sạn">
            </div>
        </div>
        <div class="travel-info-row">
            <div class="form-group">
                <label>Giá Phòng/Đêm (VNĐ)</label>
                <input type="number" class="gia-phong" step="1000" placeholder="Ví dụ: 500000">
            </div>
            <div class="form-group">
                <label>Số Sao</label>
                <select class="so-sao">
                    <option value="">Chọn...</option>
                    <option value="1">⭐ 1 sao</option>
                    <option value="2">⭐⭐ 2 sao</option>
                    <option value="3">⭐⭐⭐ 3 sao</option>
                    <option value="4">⭐⭐⭐⭐ 4 sao</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 sao</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Đánh Giá</label>
            <textarea class="danh-gia-ks" placeholder="Nhận xét về khách sạn..." rows="2"></textarea>
        </div>
        <button type="button" class="remove-travel-info-btn" onclick="this.parentElement.remove()">Xóa</button>
    `;
    container.appendChild(item);
}

// Add restaurant
function addDoAn() {
    const container = document.getElementById('do-an-list');
    const item = document.createElement('div');
    item.className = 'travel-info-item';
    item.innerHTML = `
        <div class="travel-info-row">
            <div class="form-group">
                <label>Tên Quán Ăn *</label>
                <input type="text" class="ten-quan-an" placeholder="Ví dụ: Nhà hàng ABC" required>
            </div>
            <div class="form-group">
                <label>Địa Chỉ</label>
                <input type="text" class="dia-chi-qa" placeholder="Địa chỉ quán ăn">
            </div>
        </div>
        <div class="travel-info-row">
            <div class="form-group">
                <label>Món Ăn Nổi Bật</label>
                <input type="text" class="mon-an" placeholder="Ví dụ: Bánh mì, Phở...">
            </div>
            <div class="form-group">
                <label>Giá Trung Bình (VNĐ/người)</label>
                <input type="number" class="gia-tb" step="10000" placeholder="Ví dụ: 100000">
            </div>
        </div>
        <div class="form-group">
            <label>Đánh Giá</label>
            <textarea class="danh-gia-qa" placeholder="Nhận xét về quán ăn, món ăn..." rows="2"></textarea>
        </div>
        <button type="button" class="remove-travel-info-btn" onclick="this.parentElement.remove()">Xóa</button>
    `;
    container.appendChild(item);
}

// Form submission
document.getElementById('dang-bai-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập!');
        window.location.href = '/dang-nhap';
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    submitBtn.disabled = true;
    submitText.textContent = 'Đang đăng...';
    
    const formData = new FormData();
    
    // Basic info
    formData.append('tieu_de', document.getElementById('tieu_de').value.trim());
    formData.append('mo_ta_ngan', document.getElementById('mo_ta_ngan').value.trim());
    formData.append('noi_dung', document.getElementById('noi_dung').value.trim());
    
    // Image
    const imageFile = document.getElementById('anh_bia').files[0];
    if (imageFile) {
        formData.append('anh_bia', imageFile);
    }
    
    // Dates & cost
    formData.append('ngay_bat_dau', document.getElementById('ngay_bat_dau').value || null);
    formData.append('ngay_ket_thuc', document.getElementById('ngay_ket_thuc').value || null);
    formData.append('tong_chi_phi', document.getElementById('tong_chi_phi').value || null);
    
    // Categories
    const categories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
    formData.append('categories', JSON.stringify(categories));
    
    // Hashtags
    formData.append('hashtags', JSON.stringify(hashtags));
    
    // Locations
    const diaDiem = [];
    document.querySelectorAll('.dia-diem-item').forEach(item => {
        const dd = {
            ten_dia_diem: item.querySelector('.ten_dia_diem').value.trim(),
            loai_dia_diem: item.querySelector('.loai_dia_diem').value,
            dia_chi: item.querySelector('.dia_chi').value.trim(),
            gia_tien: item.querySelector('.gia_tien').value || null,
            ghi_chu: item.querySelector('.ghi_chu').value.trim() || null
        };
        if (dd.ten_dia_diem && dd.loai_dia_diem) {
            diaDiem.push(dd);
        }
    });
    if (diaDiem.length > 0) {
        formData.append('ten_dia_diem', diaDiem[0].ten_dia_diem);
        formData.append('loai_dia_diem', diaDiem[0].loai_dia_diem);
        formData.append('dia_chi', diaDiem[0].dia_chi);
        formData.append('gia_tien', diaDiem[0].gia_tien || null);
        formData.append('ghi_chu', diaDiem[0].ghi_chu || null);
        // Additional locations can be stored in database
        if (diaDiem.length > 1) {
            formData.append('dia_diem_them', JSON.stringify(diaDiem.slice(1)));
        }
    }
    
    // Transportation
    const phuongTien = [];
    document.querySelectorAll('#phuong-tien-list .travel-info-item').forEach(item => {
        phuongTien.push({
            loai: item.querySelector('.loai-phuong-tien').value,
            chi_phi: item.querySelector('.chi-phi-pt').value || null,
            mo_ta: item.querySelector('.mo-ta-pt').value.trim() || null
        });
    });
    if (phuongTien.length > 0) {
        formData.append('phuong_tien', JSON.stringify(phuongTien));
    }
    
    // Hotels
    const khachSan = [];
    document.querySelectorAll('#khach-san-list .travel-info-item').forEach(item => {
        khachSan.push({
            ten: item.querySelector('.ten-khach-san').value.trim(),
            dia_chi: item.querySelector('.dia-chi-ks').value.trim() || null,
            gia_phong: item.querySelector('.gia-phong').value || null,
            so_sao: item.querySelector('.so-sao').value || null,
            danh_gia: item.querySelector('.danh-gia-ks').value.trim() || null
        });
    });
    if (khachSan.length > 0) {
        formData.append('khach_san', JSON.stringify(khachSan));
    }
    
    // Restaurants
    const doAn = [];
    document.querySelectorAll('#do-an-list .travel-info-item').forEach(item => {
        doAn.push({
            ten: item.querySelector('.ten-quan-an').value.trim(),
            dia_chi: item.querySelector('.dia-chi-qa').value.trim() || null,
            mon_an: item.querySelector('.mon-an').value.trim() || null,
            gia_tb: item.querySelector('.gia-tb').value || null,
            danh_gia: item.querySelector('.danh-gia-qa').value.trim() || null
        });
    });
    if (doAn.length > 0) {
        formData.append('do_an', JSON.stringify(doAn));
    }
    
    try {
        const response = await fetch('/api/dang-bai', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(result.message || 'Đăng bài thành công!');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            showError(result.message || 'Đăng bài thất bại!');
            submitBtn.disabled = false;
            submitText.textContent = 'Đăng Bài';
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Lỗi kết nối: ' + error.message);
        submitBtn.disabled = false;
        submitText.textContent = 'Đăng Bài';
    }
});

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message error';
    errorDiv.textContent = message;
    document.querySelector('.create-post-form').insertBefore(errorDiv, document.querySelector('.form-section'));
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'message success';
    successDiv.textContent = message;
    document.querySelector('.create-post-form').insertBefore(successDiv, document.querySelector('.form-section'));
}
