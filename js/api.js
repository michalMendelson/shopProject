
// קבועים לכתובות API
const BIN_ID = '689c5bde43b1c97be91d4b5b';
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const API_BASE_URL = 'https://dummyjson.com';
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const API_KEY = '$2a$10$laHYgxEfvvYKcPoe41VEb.GMNiHUXtJbbM7.YFWXiiDhZ5eTJ92ry';  
// === פונקציות עבור dummyjson API ===

// קבלת כל הקטגוריות
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/category-list`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}

// קבלת מוצרים (עם אפשרות להגביל מספר)
async function fetchProducts(limit = 30, skip = 0) {
    try {
        const response = await fetch(`${API_BASE_URL}/products?limit=${limit}&skip=${skip}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// קבלת מוצרים לפי קטגוריה
async function fetchProductsByCategory(category, limit = 30) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/category/${category}?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch products by category');
        return await response.json();
    } catch (error) {
        console.error('Error fetching products by category:', error);
        throw error;
    }
}

// חיפוש מוצרים
async function fetchSearchProducts(query, limit = 30) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to search products');
        return await response.json();
    } catch (error) {
        console.error('Error searching products:', error);
        throw error;
    }
}

// קבלת מוצר בודד לפי ID
async function fetchProductById(id) {
    try {    
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) {
            throw new Error(`שגיאה בטעינת מוצר - סטטוס: ${response.status}`);
        }
        const product = await response.json();
        return product;
    } catch (error) {
        throw error;
    }
}


// === פונקציות התחברות עם dummyjson ===

async function authenticateUser(username, password) {
    try {
        console.log('Authenticating with:', { username, password });  // הוספת לוג

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}


// רישום משתמש חדש 
async function registerUser(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// === פונקציות עזר ===

// תרגום קטגוריות לעברית
function translateCategory(category) {
    const translations = {
        'smartphones': 'סמארטפונים',
        'laptops': 'מחשבים ניידים',
        'fragrances': 'בשמים',
        'skincare': 'קוסמטיקה',
        'groceries': 'מצרכים',
        'home-decoration': 'עיצוב הבית',
        'furniture': 'רהיטים',
        'tops': 'חולצות',
        'womens-dresses': 'שמלות נשים',
        'womens-shoes': 'נעלי נשים',
        'mens-shirts': 'חולצות גברים',
        'mens-shoes': 'נעלי גברים',
        'mens-watches': 'שעוני גברים',
        'womens-watches': 'שעוני נשים',
        'womens-bags': 'תיקי נשים',
        'womens-jewellery': 'תכשיטי נשים',
        'sunglasses': 'משקפי שמש',
        'automotive': 'רכב',
        'motorcycle': 'אופנועים',
        'lighting': 'תאורה'
    };
    
    return translations[category] || category;
}

// הצגת טעינה
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="loading">טוען...</div>';
    }
}

// הצגת שגיאה
function handleApiError(error, containerId) {
    console.error('API Error:', error);
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="no-products">שגיאה: ${error.message}</div>`;
    }
}


async function saveToJsonBin(binId, data) {
    try {
        const response = await fetch(`${JSONBIN_API_URL}/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save to JsonBin');
        }
        
        return await response.json();
    } catch (error) {
        console.error('JsonBin save error:', error);
        throw error;
    }
}

async function loadFromJsonBin() {
    try {
        const response = await fetch(BIN_URL, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load from JsonBin');
        }
        
        const result = await response.json();
        return result.record.users; // כי שינית את ה־BIN למבנה עם users
    } catch (error) {
        console.error('JsonBin load error:', error);
        throw error;
    }
}

/*async function saveCurrentUser(userData) {
    try {
        await saveToJsonBin(BIN_ID, { currentUser: userData });
    } catch (error) {
        console.error('Error saving user to JsonBin:', error);
    }
}

async function getCurrentUser() {
    try {
        const data = await loadFromJsonBin(BIN_ID);
        return data.currentUser || null;
    } catch (error) {
        console.error('Error loading user from JsonBin:', error);
        return null;
    }
}

async function clearCurrentUser() {
    try {
        await saveToJsonBin(BIN_ID, { currentUser: null });
    } catch (error) {
        console.error('Error clearing user from JsonBin:', error);
    }
}
window.getCurrentUser = getCurrentUser;
window.saveCurrentUser = saveCurrentUser;
window.clearCurrentUser = clearCurrentUser;
*/