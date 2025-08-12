// קובץ ראשי לדף הבית - main.js

// אתחול הדף
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

// === אתחול הדף ===
async function initializePage() {
    try {
        await loadCategories();
        await loadProducts();
        await loadPromoProducts();
        setupEventListeners();
        updateUserStatus(); // מתוך auth.js
        
        // בדיקת פרמטרים ב-URL
        checkUrlParameters();
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

// === טעינת קטגוריות ===
async function loadCategories() {
    const categoriesMenu = document.getElementById('categories-menu');
    if (!categoriesMenu) return;

    try {
        const categories = await fetchCategories();
        
        // שמירת הלינק "כל המוצרים" (אם קיים)
        const allProductsLink = categoriesMenu.querySelector('a[href="#"]');
        
        // איפוס התפריט
        categoriesMenu.innerHTML = '';
        
        // הוספת "כל המוצרים"
        const allProductsLi = document.createElement('li');
        allProductsLi.innerHTML = `<a href="#" onclick="loadProducts(); return false;">כל המוצרים</a>`;
        categoriesMenu.appendChild(allProductsLi);
        
        // הוספת קטגוריות (רק 8 ראשונות)
        categories.slice(0, 8).forEach(category => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="category-item" onclick="loadProductsByCategory('${category}')">${translateCategory(category)}</span>`;
            categoriesMenu.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// === טעינת מוצרים ראשיים ===
async function loadProducts() {
    const productsContainer = document.getElementById('products-container');
    const sectionTitle = document.getElementById('section-title');
    
    if (!productsContainer) return;

    showLoading('products-container');
    
    try {
        const data = await fetchProducts(12); // 12 מוצרים
        renderProducts(data.products, productsContainer);
        
        if (sectionTitle) {
            sectionTitle.textContent = 'מוצרים פופולריים';
        }
        
        // ניקוי קטגוריה פעילה
        clearActiveCategory();
    } catch (error) {
        handleApiError(error, 'products-container');
    }
}

// === טעינת מוצרים לפי קטגוריה ===
async function loadProductsByCategory(category) {
    const productsContainer = document.getElementById('products-container');
    const sectionTitle = document.getElementById('section-title');
    
    if (!productsContainer) return;

    showLoading('products-container');
    
    try {
        const data = await fetchProductsByCategory(category, 12);
        renderProducts(data.products, productsContainer);
        
        if (sectionTitle) {
            sectionTitle.textContent = `מוצרים בקטגוריה: ${translateCategory(category)}`;
        }
        
        // עדכון הקטגוריה הפעילה
        updateActiveCategory(category);
    } catch (error) {
        handleApiError(error, 'products-container');
    }
}

// === טעינת מוצרי מבצעים ===
async function loadPromoProducts() {
    const promoContainer = document.getElementById('promo-products');
    if (!promoContainer) return;

    try {
        // נטען 4 מוצרים ראשונים עם הנחה סימולטיבית
        const data = await fetchProducts(4);
        renderPromoProducts(data.products, promoContainer);
    } catch (error) {
        console.error('Error loading promo products:', error);
        if (promoContainer) {
            promoContainer.innerHTML = '<p class="no-products">שגיאה בטעינת מבצעים</p>';
        }
    }
}

// === חיפוש מוצרים ===
async function searchProducts() {
    const searchInput = document.getElementById('search-input');
    const productsContainer = document.getElementById('products-container');
    const sectionTitle = document.getElementById('section-title');
    
    if (!searchInput || !productsContainer) return;
    
    const query = searchInput.value.trim();
    if (!query) {
        showMessage('אנא הכנס מילה לחיפוש', 'error');
        return;
    }
    
    showLoading('products-container');
    
    try {
        const data = await fetchSearchProducts(query, 12);
        renderProducts(data.products, productsContainer);
        
        if (sectionTitle) {
            sectionTitle.textContent = `תוצאות חיפוש עבור: "${query}"`;
        }
        
        // ניקוי הקטגוריה הפעילה
        clearActiveCategory();
    } catch (error) {
        handleApiError(error, 'products-container');
    }
}

// === רנדור מוצרים ===
function renderProducts(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="no-products">לא נמצאו מוצרים</div>';
        return;
    }

    container.innerHTML = '';
    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// === רנדור מוצרי מבצעים ===
function renderPromoProducts(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="no-products">אין מבצעים כרגע</div>';
        return;
    }

    container.innerHTML = '';
    products.forEach(product => {
        const card = createProductCard(product, true);
        container.appendChild(card);
    });
}

// === יצירת כרטיס מוצר ===
function createProductCard(product, isPromo = false) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const discountPrice = isPromo ? (product.price * 0.8).toFixed(2) : null;
    const finalPrice = isPromo ? discountPrice : product.price;
    
    const priceHTML = isPromo 
        ? `<p class="price">
             <span style="text-decoration: line-through; color: #999;">${product.price}₪</span>
             <span style="color: #ff4444; font-weight: bold;">${discountPrice}₪</span>
           </p>`
        : `<p class="price">${product.price}₪</p>`;

    card.innerHTML = `
        <img src="${product.thumbnail}" 
             alt="${product.title}" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
        <h3>${escapeHtml(product.title)}</h3>
        ${priceHTML}
        <p style="color: #666; font-size: 0.9rem; margin: 0.5rem 0;">
            ${product.description ? escapeHtml(product.description.substring(0, 60)) + '...' : ''}
        </p>
        <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center;">
            <a href="product.html?id=${product.id}" class="btn">צפה במוצר</a>
            <button class="btn" onclick="addToCart(${product.id}, '${escapeHtml(product.title)}', ${finalPrice}, '${product.thumbnail}')" 
                    style="background: #ff6b6b;">הוסף לסל</button>
        </div>
        ${isPromo ? '<div style="position: absolute; top: 10px; right: 10px; background: #ff4444; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">מבצע!</div>' : ''}
    `;

    if (isPromo) {
        card.style.position = 'relative';
    }

    return card;
}

// === עדכון הקטגוריה הפעילה ===
function updateActiveCategory(category) {
    // הסרת פעיל מכל הקטגוריות
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // הוספת פעיל לקטגוריה הנוכחית
    document.querySelectorAll('.category-item').forEach(item => {
        if (item.textContent === translateCategory(category)) {
            item.classList.add('active');
        }
    });
}

// === ניקוי הקטגוריה הפעילה ===
function clearActiveCategory() {
    document.querySelectorAll('.category-item, nav a').forEach(item => {
        item.classList.remove('active');
    });
    
    // הוספת פעיל ל"כל המוצרים"
    const allProductsLink = document.querySelector('nav a[href="#"]');
    if (allProductsLink) {
        allProductsLink.classList.add('active');
    }
}

// === הוספת Event Listeners ===
function setupEventListeners() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn) {
        searchBtn.addEventListener('click', searchProducts);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
}

// === בדיקת פרמטרים ב-URL ===
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category) {
        loadProductsByCategory(category);
    } else if (search) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = search;
            searchProducts();
        }
    }
}

// === פונקציות עזר ===

// הצגת הודעה
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 50%;
        transform: translateX(50%);
        z-index: 1000;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// הימנעות מ-XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}