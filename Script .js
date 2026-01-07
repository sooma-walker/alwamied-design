// ===== تهيئة التطبيق =====
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة جميع المكونات
    initNavigation();
    initForms();
    initUIComponents();
    checkLoginStatus();
    updateCurrentDate();
});

// ===== إدارة التنقل =====
function initNavigation() {
    // القائمة المتنقلة للأجهزة الصغيرة
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // إغلاق القائمة عند النقر على رابط
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// ===== إدارة النماذج =====
function initForms() {
    // نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // نموذج التسجيل
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // نموذج طلب التصميم
    const designOrderForm = document.getElementById('designOrderForm');
    if (designOrderForm) {
        designOrderForm.addEventListener('submit', handleDesignOrder);
    }
    
    // تبديل إظهار كلمة المرور
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // التحويل بين تسجيل الدخول والتسجيل
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.login-card').classList.add('hidden');
            document.querySelector('.register-card').classList.remove('hidden');
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', function() {
            document.querySelector('.register-card').classList.add('hidden');
            document.querySelector('.login-card').classList.remove('hidden');
        });
    }
    
    // اختيار نوع المستخدم
    const userTypeButtons = document.querySelectorAll('.user-type-btn');
    userTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            userTypeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // إدارة رفع الملفات
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', handleFileUpload);
    });
}

// ===== معالجة تسجيل الدخول =====
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.querySelector('.user-type-btn.active').dataset.type;
    
    // التحقق البسيط من البيانات
    if (!email || !password) {
        showToast('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    showLoading(true);
    
    // محاكاة طلب تسجيل الدخول
    setTimeout(() => {
        showLoading(false);
        
        // حفظ حالة تسجيل الدخول
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userType', userType);
        
        showToast('تم تسجيل الدخول بنجاح', 'success');
        
        // توجيه المستخدم بناءً على نوعه
        if (userType === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'order.html';
        }
    }, 1500);
}

// ===== معالجة التسجيل =====
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // التحقق من صحة البيانات
    if (!name || !email || !password || !confirmPassword) {
        showToast('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    if (password.length < 8) {
        showToast('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('كلمات المرور غير متطابقة', 'error');
        return;
    }
    
    showLoading(true);
    
    // محاكاة عملية التسجيل
    setTimeout(() => {
        showLoading(false);
        
        // حفظ بيانات المستخدم
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
            id: Date.now(),
            name,
            email,
            password, // في التطبيق الحقيقي يجب تشفير كلمة المرور
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        showToast('تم إنشاء الحساب بنجاح', 'success');
        
        // العودة إلى صفحة تسجيل الدخول
        document.querySelector('.register-card').classList.add('hidden');
        document.querySelector('.login-card').classList.remove('hidden');
        
        // تفريغ النموذج
        e.target.reset();
    }, 2000);
}

// ===== معالجة طلب التصميم =====
function handleDesignOrder(e) {
    e.preventDefault();
    
    const designType = document.getElementById('designType').value;
    const description = document.getElementById('designDescription').value;
    
    if (!designType || !description) {
        showToast('يرجى ملء الحقول المطلوبة', 'error');
        return;
    }
    
    showLoading(true);
    
    // محاكاة إرسال الطلب
    setTimeout(() => {
        showLoading(false);
        
        // حفظ الطلب
        const orders = JSON.parse(localStorage.getItem('designOrders') || '[]');
        const newOrder = {
            id: Date.now(),
            designType,
            description,
            purpose: document.getElementById('designPurpose').value,
            deadline: document.getElementById('designDeadline').value,
            budget: document.getElementById('budgetRange').value,
            status: 'pending',
            createdAt: new Date().toISOString(),
            userId: localStorage.getItem('userEmail')
        };
        
        orders.push(newOrder);
        localStorage.setItem('designOrders', JSON.stringify(orders));
        
        showToast('تم إرسال طلب التصميم بنجاح', 'success');
        
        // تفريغ النموذج
        e.target.reset();
        
        // إعادة تعيين قائمة الملفات
        const fileList = document.getElementById('fileList');
        if (fileList) fileList.innerHTML = '';
    }, 2000);
}

// ===== التحقق من حالة تسجيل الدخول =====
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loginRequired = document.getElementById('loginRequired');
    const designOrderForm = document.getElementById('designOrderForm');
    
    if (loginRequired && designOrderForm) {
        if (isLoggedIn) {
            loginRequired.classList.add('hidden');
            designOrderForm.classList.remove('hidden');
        } else {
            loginRequired.classList.remove('hidden');
            designOrderForm.classList.add('hidden');
        }
    }
}

// ===== معالجة رفع الملفات =====
function handleFileUpload(e) {
    const files = e.target.files;
    const fileListContainer = e.target.parentElement.querySelector('.file-list');
    
    if (!fileListContainer) return;
    
    fileListContainer.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileName = document.createElement('span');
        fileName.textContent = file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name;
        
        const fileSize = document.createElement('span');
        fileSize.textContent = formatFileSize(file.size);
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.className = 'remove-file';
        removeBtn.addEventListener('click', () => {
            // إزالة الملف من المصفوفة
            const dt = new DataTransfer();
            const input = e.target;
            
            for (let i = 0; i < input.files.length; i++) {
                const file = input.files[i];
                if (i !== index) dt.items.add(file);
            }
            
            input.files = dt.files;
            fileItem.remove();
        });
        
        fileItem.appendChild(fileName);
        fileItem.appendChild(fileSize);
        fileItem.appendChild(removeBtn);
        fileListContainer.appendChild(fileItem);
    });
}

// ===== مكونات واجهة المستخدم =====
function initUIComponents() {
    // تحديث التاريخ الحالي
    updateCurrentDate();
    
    // تهيئة التبويبات
    initTabs();
    
    // تهيئة المودالات
    initModals();
}

function updateCurrentDate() {
    const dateElements = document.querySelectorAll('#currentDate');
    
    if (dateElements.length > 0) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        dateElements.forEach(element => {
            element.textContent = now.toLocaleDateString('ar-SA', options);
        });
    }
}

function initTabs() {
    const tabButtons = document.querySelectorAll('[data-section]');
    const tabSections = document.querySelectorAll('.admin-section');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.dataset.section;
            
            // تحديث الأزرار النشطة
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.closest('li').classList.remove('active');
            });
            this.classList.add('active');
            this.closest('li').classList.add('active');
            
            // تحديث الأقسام المرئية
            tabSections.forEach(section => {
                section.classList.add('hidden');
            });
            
            const activeSection = document.getElementById(sectionId);
            if (activeSection) {
                activeSection.classList.remove('hidden');
                
                // تحديث عنوان القسم
                const sectionTitle = document.getElementById('sectionTitle');
                if (sectionTitle) {
                    sectionTitle.textContent = this.textContent.trim();
                }
            }
        });
    });
}

function initModals() {
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    const addWorkBtn = document.getElementById('addWorkBtn');
    const addWorkModal = document.getElementById('addWorkModal');
    
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.classList.add('hidden');
        });
    });
    
    if (addWorkBtn && addWorkModal) {
        addWorkBtn.addEventListener('click', () => {
            addWorkModal.classList.remove('hidden');
        });
    }
    
    // إغلاق المودال عند النقر خارج المحتوى
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });
}

// ===== دوال مساعدة =====
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showToast(message, type = 'success') {
    // إزالة أي toast سابق
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    // إنشاء toast جديد
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // إظهار toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // إخفاء toast بعد 3 ثوانٍ
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading(show) {
    let loading = document.querySelector('.loading');
    
    if (show) {
        if (!loading) {
            loading = document.createElement('div');
            loading.className = 'loading';
            loading.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(loading);
        }
        loading.style.display = 'flex';
    } else if (loading) {
        loading.style.display = 'none';
    }
}

// ===== إدارة بيانات التطبيق =====
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('designOrders') || '[]');
    const recentOrdersTable = document.getElementById('recentOrdersTable');
    const ordersTable = document.getElementById('ordersTable');
    
    if (recentOrdersTable) {
        recentOrdersTable.innerHTML = '';
        
        // عرض آخر 5 طلبات فقط
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
                        <button class="action-btn view" title="عرض"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit" title="تعديل"><i class="fas fa-edit"></i></button>
                    </div>
                </td>
            `;
            
            recentOrdersTable.appendChild(row);
        });
    }
    
    if (ordersTable) {
        ordersTable.innerHTML = '';
        
        orders.reverse().forEach(order => {
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
                        <button class="action-btn view" title="عرض"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit" title="تعديل"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" title="حذف"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            
            ordersTable.appendChild(row);
        });
        
        // تحديث أرقام الصفحات
        if (document.getElementById('rowsCount')) {
            document.getElementById('rowsCount').textContent = orders.length;
        }
        if (document.getElementById('totalRows')) {
            document.getElementById('totalRows').textContent = orders.length;
        }
    }
}

function loadPortfolio() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;
    
    const works = JSON.parse(localStorage.getItem('portfolioWorks') || '[]');
    
    if (works.length === 0) {
        // بيانات افتراضية
        const defaultWorks = [
            { id: 1, title: 'شعار مطعم', category: 'logo', description: 'تصميم شعار حديث لمطعم', featured: true },
            { id: 2, title: 'هوية بصرية', category: 'branding', description: 'هوية بصرية كاملة لشركة', featured: true },
            { id: 3, title: 'بروشور طبي', category: 'print', description: 'تصميم بروشور لعيادة طبية', featured: false },
            { id: 4, title: 'تصميم موقع', category: 'website', description: 'واجهة موقع إلكتروني', featured: true },
            { id: 5, title: 'وسائط اجتماعية', category: 'digital', description: 'تصاميم لوسائط التواصل', featured: false },
            { id: 6, title: 'بطاقات عمل', category: 'print', description: 'تصميم بطاقات عمل', featured: false }
        ];
        
        localStorage.setItem('portfolioWorks', JSON.stringify(defaultWorks));
        loadPortfolio();
        return;
    }
    
    portfolioGrid.innerHTML = '';
    
    works.forEach(work => {
        const workItem = document.createElement('div');
        workItem.className = 'portfolio-item';
        
        workItem.innerHTML = `
            <div class="portfolio-image">
                <div class="portfolio-overlay">
                    <button class="btn btn-primary edit-work" data-id="${work.id}">
                        <i class="fas fa-edit"></i> تعديل
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

// ===== تسجيل الخروج =====
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    window.location.href = 'index.html';
}

// إضافة حدث النقر على زر تسجيل الخروج
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});