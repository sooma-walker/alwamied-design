// ===== تهيئة لوحة التحكم =====
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من صلاحيات المسؤول
    checkAdminAccess();
    
    // تحميل البيانات
    loadDashboardData();
    loadOrders();
    loadPortfolio();
    
    // تهيئة الأحداث
    initAdminEvents();
});

// ===== التحقق من صلاحيات المسؤول =====
function checkAdminAccess() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
}

// ===== تحميل بيانات لوحة التحكم =====
function loadDashboardData() {
    // تحميل الإحصائيات
    updateDashboardStats();
    
    // تحميل الطلبات الأخيرة
    updateRecentOrders();
}

function updateDashboardStats() {
    const orders = JSON.parse(localStorage.getItem('designOrders') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const works = JSON.parse(localStorage.getItem('portfolioWorks') || '[]');
    
    // تحديث أرقام الإحصائيات
    const newOrders = orders.filter(order => 
        new Date(order.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    
    // تحديث عناصر DOM
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = orders.filter(o => o.status === 'pending').length;
        statNumbers[1].textContent = completedOrders;
        statNumbers[2].textContent = users.length;
        
        // حساب الإيرادات (محاكاة)
        const revenue = completedOrders * 150; // متوسط سعر 150$ لكل مشروع
        statNumbers[3].textContent = `$${revenue.toLocaleString()}`;
    }
}

function updateRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('designOrders') || '[]');
    const recentOrdersTable = document.getElementById('recentOrdersTable');
    
    if (!recentOrdersTable) return;
    
    recentOrdersTable.innerHTML = '';
    
    // أخذ آخر 5 طلبات
    const recentOrders = orders.slice(-5).reverse();
    
    recentOrders.forEach(order => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>#${order.id.toString().substring(8)}</td>
            <td>${order.userId || 'مستخدم'}</td>
            <td>${getDesignTypeName(order.designType)}</td>
            <td>${formatDate(order.createdAt)}</td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewOrder(${order.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editOrder(${order.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        
        recentOrdersTable.appendChild(row);
    });
}

// ===== إدارة الطلبات =====
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('designOrders') || '[]');
    const ordersTable = document.getElementById('ordersTable');
    const orderFilter = document.getElementById('orderFilter');
    
    if (!ordersTable) return;
    
    let filteredOrders = orders;
    
    // تطبيق التصفية إذا كانت موجودة
    if (orderFilter && orderFilter.value !== 'all') {
        filteredOrders = orders.filter(order => order.status === orderFilter.value);
    }
    
    ordersTable.innerHTML = '';
    
    filteredOrders.reverse().forEach(order => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><input type="checkbox" class="order-checkbox" value="${order.id}"></td>
            <td>#${order.id.toString().substring(8)}</td>
            <td>${order.userId || 'مستخدم'}</td>
            <td>${getDesignTypeName(order.designType)}</td>
            <td>${order.description.substring(0, 50)}${order.description.length > 50 ? '...' : ''}</td>
            <td>${formatDate(order.createdAt)}</td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewOrder(${order.id})" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editOrder(${order.id})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteOrder(${order.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        ordersTable.appendChild(row);
    });
    
    // تحديث أرقام الصفحات
    updateTableInfo(filteredOrders.length);
    
    // إضافة حدث التصفية
    if (orderFilter) {
        orderFilter.addEventListener('change', loadOrders);
    }
}

// ===== إدارة معرض الأعمال =====
function loadPortfolio() {
    const works = JSON.parse(localStorage.getItem('portfolioWorks') || '[]');
    const portfolioGrid = document.getElementById('portfolioGrid');
    
    if (!portfolioGrid) return;
    
    portfolioGrid.innerHTML = '';
    
    works.forEach(work => {
        const workItem = document.createElement('div');
        workItem.className = 'portfolio-item';
        
        workItem.innerHTML = `
            <div class="portfolio-image">
                <img src="https://via.placeholder.com/400x300/2c3e50/ffffff?text=${encodeURIComponent(work.title)}" alt="${work.title}">
                <div class="portfolio-overlay">
                    <button class="btn btn-primary" onclick="editWork(${work.id})">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="btn btn-secondary" onclick="deleteWork(${work.id})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
            <div class="portfolio-content">
                <h3>${work.title}</h3>
                <p>${work.description}</p>
                <div class="work-meta">
                    <span class="work-category">${getCategoryName(work.category)}</span>
                    ${work.featured ? '<span class="featured-badge">مميز</span>' : ''}
                </div>
            </div>
        `;
        
        portfolioGrid.appendChild(workItem);
    });
}

// ===== أحداث لوحة التحكم =====
function initAdminEvents() {
    // تحديد/إلغاء تحديد الكل
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.order-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    // إضافة طلب جديد
    const addOrderBtn = document.getElementById('addOrderBtn');
    if (addOrderBtn) {
        addOrderBtn.addEventListener('click', showAddOrderModal);
    }
    
    // إضافة عمل جديد
    const addWorkForm = document.getElementById('addWorkForm');
    if (addWorkForm) {
        addWorkForm.addEventListener('submit', handleAddWork);
    }
    
    // إدارة رفع الصور للأعمال
    const workImagesInput = document.getElementById('workImages');
    if (workImagesInput) {
        workImagesInput.addEventListener('change', handleWorkImagesUpload);
    }
}

// ===== معالجة الأعمال =====
function handleAddWork(e) {
    e.preventDefault();
    
    const title = document.getElementById('workTitle').value;
    const category = document.getElementById('workCategory').value;
    const description = document.getElementById('workDescription').value;
    const featured = document.getElementById('workFeatured').checked;
    
    if (!title || !category) {
        showToast('يرجى ملء الحقول المطلوبة', 'error');
        return;
    }
    
    const works = JSON.parse(localStorage.getItem('portfolioWorks') || '[]');
    const newWork = {
        id: Date.now(),
        title,
        category,
        description,
        featured,
        createdAt: new Date().toISOString()
    };
    
    works.push(newWork);
    localStorage.setItem('portfolioWorks', JSON.stringify(works));
    
    showToast('تم إضافة العمل بنجاح', 'success');
    loadPortfolio();
    
    // إغلاق المودال
    document.getElementById('addWorkModal').classList.add('hidden');
    e.target.reset();
    
    // تفريغ قائمة الصور
    const imagesList = document.getElementById('workImagesList');
    if (imagesList) imagesList.innerHTML = '';
}

function handleWorkImagesUpload(e) {
    const files = e.target.files;
    const fileListContainer = document.getElementById('workImagesList');
    
    if (!fileListContainer) return;
    
    fileListContainer.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileName = document.createElement('span');
        fileName.textContent = file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name;
        
        const fileSize = document.createElement('span');
        fileSize.textContent = formatFileSize(file.size);
        
        const preview = document.createElement('img');
        preview.src = URL.createObjectURL(file);
        preview.style.width = '50px';
        preview.style.height = '50px';
        preview.style.objectFit = 'cover';
        preview.style.marginLeft = '10px';
        preview.style.borderRadius = '5px';
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.className = 'remove-file';
        removeBtn.addEventListener('click', () => {
            fileItem.remove();
        });
        
        fileItem.appendChild(preview);
        fileItem.appendChild(fileName);
        fileItem.appendChild(fileSize);
        fileItem.appendChild(removeBtn);
        fileListContainer.appendChild(fileItem);
    });
}

function editWork(id) {
    const works = JSON.parse(localStorage.getItem('portfolioWorks') || '[]');
    const work = works.find(w => w.id === id);
    
    if (!work) return;
    
    // ملء النموذج ببيانات العمل
    document.getElementById('workTitle').value = work.title;
    document.getElementById('workCategory').value = work.category;
    document.getElementById('workDescription').value = work.description;
    document.getElementById('workFeatured').checked = work.featured;
    
    // تغيير نص الزر
    const submitBtn = document.querySelector('#addWorkForm button[type="submit"]');
    submitBtn.textContent = 'تحديث العمل';
    submitBtn.dataset.editId = id;
    
    // إظهار المودال
    document.getElementById('addWorkModal').classList.remove('hidden');
    
    // تغيير سلوك النموذج
    const form = document.getElementById('addWorkForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const updatedWork = {
            ...work,
            title: document.getElementById('workTitle').value,
            category: document.getElementById('workCategory').value,
            description: document.getElementById('workDescription').value,
            featured: document.getElementById('workFeatured').checked
        };
        
        const updatedWorks = works.map(w => w.id === id ? updatedWork : w);
        localStorage.setItem('portfolioWorks', JSON.stringify(updatedWorks));
        
        showToast('تم تحديث العمل بنجاح', 'success');
        loadPortfolio();
        document.getElementById('addWorkModal').classList.add('hidden');
        form.reset();
        
        // إعادة تعيين النموذج
        submitBtn.textContent = 'إضافة العمل';
        delete submitBtn.dataset.editId;
        form.onsubmit = handleAddWork;
    };
}

function deleteWork(id) {
    if (!confirm('هل أنت متأكد من حذف هذا العمل؟')) return;
    
    const works = JSON.parse(localStorage.getItem('portfolioWorks') || '[]');
    const updatedWorks = works.filter(w => w.id !== id);
    
    localStorage.setItem('portfolioWorks', JSON.stringify(updatedWorks));
    showToast('تم حذف العمل بنجاح', 'success');
    loadPortfolio();
}

// ===== معالجة الطلبات =====
function viewOrder(id) {
    const orders = JSON.parse(localStorage.getItem('designOrders') || '[]');
    const order = orders.find(o => o.id === id);
    
    if (!order) return;
    
    // إنشاء محتوى المودال
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>تفاصيل الطلب #${id.toString().substring(8)}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="order-details">
                    <div class="detail-row">
                        <strong>نوع التصميم:</strong>
                        <span>${getDesignTypeName(order.designType)}</span>
                    </div>
                    <div class="detail-row">
                        <strong>الوصف:</strong>
                        <p>${order.description}</p>
                    </div>
                    <div class="detail-row">
                        <strong>الغرض:</strong>
                        <p>${order.purpose || 'غير محدد'}</p>
                    </div>
                    <div class="detail-row">
                        <strong>الموعد النهائي:</strong>
                        <span>${order.deadline || 'غير محدد'}</span>
                    </div>
                    <div class="detail-row">
                        <strong>الميزانية:</strong>
                        <span>${getBudgetText(order.budget)}</span>
                    </div>
                    <div class="detail-row">
                        <strong>الحالة:</strong>
                        <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
                    </div>
                    <div class="detail-row">
                        <strong>تاريخ الطلب:</strong>
                        <span>${formatDate(order.createdAt)}</span>
                    </div>
                    <div class="detail-row">
                        <strong>العميل:</strong>
                        <span>${order.userId || 'غير معروف'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalContent);
}

function editOrder(id) {
    const orders = JSON.parse(localStorage.getItem('designOrders') || '[]');
    const order = orders.find(o => o.id === id);
    
    if (!order) return;
    
    // إنشاء نموذج التعديل
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>تعديل الطلب #${id.toString().substring(8)}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editOrderForm">
                    <div class="form-group">
                        <label>نوع التصميم</label>
                        <select id="editDesignType" required>
                            <option value="logo" ${order.designType === 'logo' ? 'selected' : ''}>شعار</option>
                            <option value="business-card" ${order.designType === 'business-card' ? 'selected' : ''}>بطاقة عمل</option>
                            <option value="brochure" ${order.designType === 'brochure' ? 'selected' : ''}>بروشور</option>
                            <option value="social-media" ${order.designType === 'social-media' ? 'selected' : ''}>وسائط اجتماعية</option>
                            <option value="flyer" ${order.designType === 'flyer' ? 'selected' : ''}>نشرة إعلانية</option>
                            <option value="website" ${order.designType === 'website' ? 'selected' : ''}>موقع إلكتروني</option>
                            <option value="package" ${order.designType === 'package' ? 'selected' : ''}>هوية بصرية</option>
                            <option value="other" ${order.designType === 'other' ? 'selected' : ''}>تصميم آخر</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>الحالة</label>
                        <select id="editOrderStatus" required>
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                            <option value="in-progress" ${order.status === 'in-progress' ? 'selected' : ''}>قيد العمل</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغى</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>الوصف</label>
                        <textarea id="editDescription" rows="4" required>${order.description}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>ملاحظات المسؤول</label>
                        <textarea id="editAdminNotes" rows="3" placeholder="أضف ملاحظاتك هنا...">${order.adminNotes || ''}</textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
                        <button type="button" class="btn btn-secondary modal-close">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const modal = showModal(modalContent);
    
    // إضافة حدث للنموذج
    const form = modal.querySelector('#editOrderForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const updatedOrder = {
            ...order,
            designType: document.getElementById('editDesignType').value,
            status: document.getElementById('editOrderStatus').value,
            description: document.getElementById('editDescription').value,
            adminNotes: document.getElementById('editAdminNotes').value,
            updatedAt: new Date().toISOString()
        };
        
        const updatedOrders = orders.map(o => o.id === id ? updatedOrder : o);
        localStorage.setItem('designOrders', JSON.stringify(updatedOrders));
        
        showToast('تم تحديث الطلب بنجاح', 'success');
        loadOrders();
        updateRecentOrders();
        updateDashboardStats();
        
        modal.remove();
    });
}

function deleteOrder(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    
    const orders = JSON.parse(localStorage.getItem('designOrders') || '[]');
    const updatedOrders = orders.filter(o => o.id !== id);
    
    localStorage.setItem('designOrders', JSON.stringify(updatedOrders));
    showToast('تم حذف الطلب بنجاح', 'success');
    loadOrders();
    updateRecentOrders();
    updateDashboardStats();
}

function showAddOrderModal() {
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>إضافة طلب جديد</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addOrderManualForm">
                    <div class="form-group">
                        <label>البريد الإلكتروني للعميل</label>
                        <input type="email" id="clientEmail" required>
                    </div>
                    
                    <div class="form-group">
                        <label>نوع التصميم</label>
                        <select id="manualDesignType" required>
                            <option value="">اختر نوع التصميم</option>
                            <option value="logo">شعار</option>
                            <option value="business-card">بطاقة عمل</option>
                            <option value="brochure">بروشور</option>
                            <option value="social-media">وسائط اجتماعية</option>
                            <option value="flyer">نشرة إعلانية</option>
                            <option value="website">موقع إلكتروني</option>
                            <option value="package">هوية بصرية</option>
                            <option value="other">تصميم آخر</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>الوصف</label>
                        <textarea id="manualDescription" rows="4" required placeholder="أدخل وصف الطلب..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>الحالة</label>
                        <select id="manualOrderStatus" required>
                            <option value="pending">قيد الانتظار</option>
                            <option value="in-progress">قيد العمل</option>
                            <option value="completed">مكتمل</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">إضافة الطلب</button>
                        <button type="button" class="btn btn-secondary modal-close">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const modal = showModal(modalContent);
    
    const form = modal.querySelector('#addOrderManualForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const orders = JSON.parse(localStorage.getItem('designOrders') || '[]');
        const newOrder = {
            id: Date.now(),
            designType: document.getElementById('manualDesignType').value,
            description: document.getElementById('manualDescription').value,
            status: document.getElementById('manualOrderStatus').value,
            userId: document.getElementById('clientEmail').value,
            createdAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        localStorage.setItem('designOrders', JSON.stringify(orders));
        
        showToast('تم إضافة الطلب بنجاح', 'success');
        loadOrders();
        updateRecentOrders();
        updateDashboardStats();
        
        modal.remove();
    });
}

// ===== دوال مساعدة للوحة التحكم =====
function updateTableInfo(count) {
    const rowsCount = document.getElementById('rowsCount');
    const totalRows = document.getElementById('totalRows');
    
    if (rowsCount) rowsCount.textContent = count;
    if (totalRows) totalRows.textContent = count;
}

function getBudgetText(budget) {
    const budgets = {
        'low': 'منخفضة (أقل من 100$)',
        'medium': 'متوسطة (100$ - 500$)',
        'high': 'مرتفعة (أكثر من 500$)',
        'negotiable': 'قابلة للتفاوض'
    };
    
    return budgets[budget] || 'غير محدد';
}

function showModal(content) {
    // إزالة أي مودال سابق
    const existingModal = document.querySelector('.modal');
    if (existingModal) existingModal.remove();
    
    // إنشاء مودال جديد
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = content;
    
    document.body.appendChild(modal);
    
    // إضافة حدث لإغلاق المودال
    const closeButtons = modal.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => modal.remove());
    });
    
    // إغلاق عند النقر خارج المحتوى
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
        }
    });
    
    return modal;
}

// ===== استيراد الدوال المساعدة من script.js =====
// نعيد تعريف الدوال التي نحتاجها أو نستخدمها مباشرة من script.js
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showToast(message, type = 'success') {
    // استخدام نفس دالة script.js
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getDesignTypeName(type) {
    const types = {
        'logo': 'شعار',
        'business-card': 'بطاقة عمل',
        'brochure': 'بروشور',
        'social-media': 'وسائط اجتماعية',
        'flyer': 'نشرة إعلانية',
        'website': 'موقع إلكتروني',
        'package': 'هوية بصرية',
        'other': 'تصميم آخر'
    };
    
    return types[type] || type;
}

function getCategoryName(category) {
    const categories = {
        'logo': 'شعارات',
        'branding': 'هوية بصرية',
        'print': 'مواد مطبوعة',
        'digital': 'تصاميم رقمية',
        'website': 'مواقع إلكترونية'
    };
    
    return categories[category] || category;
}

function getStatusText(status) {
    const statuses = {
        'pending': 'قيد الانتظار',
        'in-progress': 'قيد العمل',
        'completed': 'مكتمل',
        'cancelled': 'ملغى'
    };
    
    return statuses[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}