// Global variables
let allPosts = [];
let currentCategory = 'all';
let currentSearch = '';

// Load posts
async function loadBaiViet(searchQuery = '', category = 'all') {
    const list = document.getElementById('bai-viet-list');
    const loading = document.getElementById('loading-posts');
    const emptyState = document.getElementById('empty-state');
    
    // Show loading
    list.innerHTML = '';
    emptyState.style.display = 'none';
    loading.style.display = 'grid';
    
    try {
        const url = '/api/bai-viet';
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Lỗi tải dữ liệu');
        }
        
        const baiViet = await response.json();
        
        // Store all posts
        allPosts = baiViet || [];
        
        // Filter posts
        let filteredPosts = allPosts;
        
        // Filter by category
        if (category !== 'all') {
            filteredPosts = filteredPosts.filter(post => {
                switch (category) {
                    case 'hoat_dong':
                        return post.has_hoat_dong === 1;
                    case 'nghi_ngoi':
                        return post.has_nghi_ngoi === 1;
                    case 'an_uong':
                        return post.has_an_uong === 1;
                    case 'tham_quan':
                        return post.has_tham_quan === 1;
                    default:
                        return true;
                }
            });
        }
        
        // Filter by search query
        if (searchQuery && searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filteredPosts = filteredPosts.filter(post => {
                const searchText = (post.tieu_de + ' ' + post.noi_dung + ' ' + post.mo_ta_ngan + ' ' + (post.hashtags || '')).toLowerCase();
                return searchText.includes(query) || query.startsWith('#') && (post.hashtags || '').toLowerCase().includes(query);
            });
        }
        
        loading.style.display = 'none';
        
        if (!filteredPosts || filteredPosts.length === 0) {
            emptyState.style.display = 'block';
            if (searchQuery || category !== 'all') {
                const categoryNames = {
                    'an-uong': 'Ẩm thực',
                    'khach-san': 'Khách sạn',
                    'phuong-tien': 'Phương tiện'
                };
                const displayText = searchQuery ? `"${searchQuery}"` : categoryNames[category] || category;
                emptyState.innerHTML = `
                    <div class="empty-state-icon">🔍</div>
                    <h3>Không tìm thấy kết quả</h3>
                    <p>Không có bài viết nào phù hợp với ${searchQuery ? 'từ khóa' : 'danh mục'} "${displayText}"</p>
                    <button onclick="resetFilters()" class="btn btn-primary mt-3">Xem tất cả</button>
                `;
            }
            return;
        }
        
        list.innerHTML = '';
        
        filteredPosts.forEach(bv => {
            const card = document.createElement('article');
            card.className = 'post-card fade-in';
            card.onclick = () => window.location.href = `/xem-bai?id=${bv.id_bai_viet}`;
            
            const formatDate = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };
            
            const authorInitial = bv.ho_ten ? bv.ho_ten.charAt(0).toUpperCase() : (bv.ten_dang_nhap ? bv.ten_dang_nhap.charAt(0).toUpperCase() : '?');
            
            card.innerHTML = `
                ${bv.anh_bia ? `
                    <img src="${bv.anh_bia}" alt="${bv.tieu_de}" class="post-image" onerror="this.style.display='none'">
                ` : `
                    <div class="post-image" style="background: linear-gradient(135deg, #1877f2 0%, #42a5f5 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">🌴</div>
                `}
                <div class="post-content">
                    <div class="post-header">
                        <span class="post-category">Du lịch</span>
                        <h2 class="post-title">${bv.tieu_de || 'Không có tiêu đề'}</h2>
                    </div>
                    ${bv.mo_ta_ngan ? `<p class="post-excerpt">${bv.mo_ta_ngan}</p>` : ''}
                    <div class="post-footer">
                        <div class="post-author">
                            ${bv.anh_dai_dien ? `
                                <img src="${bv.anh_dai_dien}" alt="${bv.ho_ten || bv.ten_dang_nhap}" class="author-avatar" style="object-fit: cover;">
                            ` : `
                                <div class="author-avatar">${authorInitial}</div>
                            `}
                            <span>${bv.ho_ten || bv.ten_dang_nhap || 'Người dùng'}</span>
                        </div>
                        <div class="post-meta">
                            <span>📅 ${formatDate(bv.ngay_dang)}</span>
                        </div>
                    </div>
                    <div class="post-stats">
                        <span>👁️ ${bv.luot_xem || 0}</span>
                        <span>💬 ${bv.so_binh_luan || 0}</span>
                        <span>❤️ ${bv.so_reaction || 0}</span>
                        <span>📤 ${bv.so_chia_se || 0}</span>
                    </div>
                    ${bv.hashtags ? `<div class="post-hashtags">${bv.hashtags}</div>` : ''}
                </div>
            `;
            
            list.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        loading.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
            <div class="empty-state-icon">⚠️</div>
            <h3>Lỗi tải dữ liệu</h3>
            <p>${error.message}</p>
            <button onclick="loadBaiViet()" class="btn btn-primary mt-3">Thử lại</button>
        `;
    }
}

function searchByKeyword() {
    const query = document.getElementById('search-input').value.trim();
    currentSearch = query;
    loadBaiViet(currentSearch, currentCategory);
}

function filterByCategory(category) {
    currentCategory = category;
    
    // Update active state
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    loadBaiViet(currentSearch, currentCategory);
}

function resetFilters() {
    document.getElementById('search-input').value = '';
    currentSearch = '';
    currentCategory = 'all';
    filterByCategory('all');
}

// Allow Enter key to search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchByKeyword();
            }
        });
    }

    // Check for hashtag parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const hashtagParam = urlParams.get('hashtag');
    if (hashtagParam) {
        currentSearch = '#' + hashtagParam;
        document.getElementById('search-input').value = currentSearch;
    }

    // Load posts on page load
    loadBaiViet(currentSearch, currentCategory);
});
