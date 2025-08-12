// דף פרופיל משתמש - user.js

document.addEventListener('DOMContentLoaded', () => {
    initializeUserPage();
});

async function initializeUserPage() {
    // בדיקת אימות
    if (!requireAuth()) {
        return;
    }

    try {
        updateUserStatus(); // מתוך auth.js
        renderUserProfile();
        renderUserOrders();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing user page:', error);
    }
}

function renderUserProfile() {
    const currentUser = getCurrentUser();
    const profileContainer = document.getElementById('profile-info');
    
    if (!currentUser || !profileContainer) return;

    profileContainer.innerHTML = `
        <div class="user-profile">
            <h3>פרטים אישיים</h3>
            <p><strong>שם משתמש:</strong> ${escapeHtml(currentUser.username)}</p>
            <p><strong>שם פרטי:</strong> ${escapeHtml(currentUser.firstName || 'לא צוין')}</p>
            <p><strong>שם משפחה:</strong> ${escapeHtml(currentUser.lastName || 'לא צוין')}</p>
            <p><strong>אימייל:</strong> ${escapeHtml(currentUser.email || 'לא צוין')}</p>
            <p><strong>מזהה משתמש:</strong> ${currentUser.id}</p>
            <p><strong>תאריך הצטרפות:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
        </div>
    `;
}

function renderUserOrders() {
    const currentUser = getCurrentUser();
    const ordersTableBody = document.getElementById('orders-table-body');
    
    if (!currentUser || !ordersTableBody) return;

    // קבלת הזמנות מ-localStorage (אם קיימות)
    const orders = getUserOrders(currentUser.id);
    
    if (!orders || orders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-products">עדיין לא ביצעת הזמנות</td>
            </tr>
        `;
        return;
    }

    // מיון הזמנות לפי תאריך (החדשות ראשון)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    ordersTableBody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        const orderDate = new Date(order.date).toLocaleDateString('he-IL');
        const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const itemsText = `${itemsCount} פריטים`;
        
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${orderDate}</td>
            <td>
                <button onclick="showOrderDetails(${order.id})" class="btn" style="font-size: 0.8rem;">
                    ${itemsText}
                </button>
            </td>
            <td><strong>${order.total.toFixed(2)}₪</strong></td>
            <td>
                <span style="color: ${getStatusColor(order.status)}">
                    ${getStatusText(order.status)}
                </span>
            </td>
        `;
        
        ordersTableBody.appendChild(row);
    });
}

function getUserOrders(userId) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        return user ? user.orders || [] : [];
    } catch (error) {
        console.error('Error getting user orders:', error);
        return [];
    }
}

function showOrderDetails(orderId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const orders = getUserOrders(currentUser.id);
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('הזמנה לא נמצאה');
        return;
    }

    let itemsList = '';
    order.items.forEach(item => {
        itemsList += `• ${item.title} - כמות: ${item.quantity} - ${(item.price * item.quantity).toFixed(2)}₪\n`;
    });

    const orderDetails = `
הזמנה מספר: ${order.id}
תאריך: ${new Date(order.date).toLocaleString('he-IL')}
סטטוס: ${getStatusText(order.status)}

פרטי מוצרים:
${itemsList}
סה"כ: ${order.total.toFixed(2)}₪
    `;

    alert(orderDetails);
}

function getStatusText(status) {
    const statusTexts = {
        'ordered': 'הוזמן',
        'processing': 'בעיבוד',
        'shipped': 'נשלח',
        'delivered': 'הגיע',
        'cancelled': 'בוטל'
    };
    
    return statusTexts[status] || 'לא ידוע';
}

function getStatusColor(status) {
    const statusColors = {
        'ordered': '#ff9800',
        'processing': '#2196f3',
        'shipped': '#9c27b0',
        'delivered': '#4caf50',
        'cancelled': '#f44336'
    };
    
    return statusColors[status] || '#666';
}

function setupEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
                logout(); // מתוך auth.js
            }
        });
    }

    // חיפוש אם קיים
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            performSearch();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim()) {
        const query = searchInput.value.trim();
        window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}