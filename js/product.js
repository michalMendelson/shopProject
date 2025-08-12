// דף פרטי מוצר - product.js

// משתנים גלובליים
let currentProduct = null;

// אתחול הדף
document.addEventListener('DOMContentLoaded', () => {
    initializeProductPage();
});

async function initializeProductPage() {
    try {
        updateUserStatus(); // מתוך auth.js
        await loadProduct();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing product page:', error);
    }
}

// === טעינת פרטי המוצר ===
async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    
    const productDetails = document.getElementById("product-details");
    const productTitle = document.getElementById("product-title");
    const productDescription = document.getElementById("product-description");
    const productPrice = document.getElementById("product-price");
    const productExtra = document.getElementById("product-extra");
    const mainImage = document.getElementById("main-image");
    const thumbnailImages = document.getElementById("thumbnail-images");

    if (!productId) {
        if (productDetails) {
            productDetails.innerHTML = "<p class='no-products'>מוצר לא נמצא</p>";
        }
        return;
    }

    // הצגת טעינה
    if (productDetails) {
        productDetails.innerHTML = '<div class="loading">טוען פרטי מוצר...</div>';
    }

    try {
        const product = await fetchProductById(productId);
        currentProduct = product;

        // עדכון כותרת הדף
        document.title = `${product.title} - החנות שלי`;

        // עדכון תמונה ראשית
        if (mainImage) {
            mainImage.src = product.thumbnail;
            mainImage.alt = product.title;
            mainImage.onerror = function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
            };
        }

        // עדכון גלריית תמונות
        if (thumbnailImages && product.images) {
            thumbnailImages.innerHTML = '';
            product.images.forEach((imageUrl, index) => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = `${product.title} - תמונה ${index + 1}`;
                img.onclick = () => changeMainImage(imageUrl);
                img.onerror = function() {
                    this.style.display = 'none';
                };
                thumbnailImages.appendChild(img);
            });
        }

        // עדכון פרטי המוצר
        if (productTitle) {
            productTitle.textContent = product.title;
        }

        if (productDescription) {
            productDescription.textContent = product.description;
        }

        if (productPrice) {
            productPrice.textContent = product.price;
        }

        // מידע נוסף
        if (productExtra) {
            let extraInfo = [];
            
            if (product.category) {
                extraInfo.push(`קטגוריה: ${translateCategory(product.category)}`);
            }
            
            if (product.brand) {
                extraInfo.push(`מותג: ${product.brand}`);
            }
            
            if (product.rating) {
                extraInfo.push(`דירוג: ${product.rating} ⭐`);
            }
            
            if (product.stock) {
                extraInfo.push(`במלאי: ${product.stock} יחידות`);
            }
            
            if (product.dimensions) {
                const dim = product.dimensions;
                extraInfo.push(`מידות: ${dim.width}×${dim.height}×${dim.depth} ס"מ`);
            }
            
            if (product.weight) {
                extraInfo.push(`משקל: ${product.weight} ק"ג`);
            }

            productExtra.innerHTML = extraInfo.map(info => `<p>${info}</p>`).join('');
        }

        // טעינת ביקורות
        loadReviews(product);

        // הסרת הטעינה מהדף
        if (productDetails && productDetails.classList) {
            productDetails.classList.remove('loading');
        }

    } catch (error) {
        console.error("Error loading product:", error);
        if (productDetails) {
            productDetails.innerHTML = `<p class="no-products">שגיאה בטעינת המוצר: ${error.message}</p>`;
        }
    }
}

// === החלפת תמונה ראשית ===
function changeMainImage(imageUrl) {
    const mainImage = document.getElementById("main-image");
    if (mainImage) {
        mainImage.src = imageUrl;
        
        // עדכון תמונה פעילה
        const thumbnails = document.querySelectorAll('#thumbnail-images img');
        thumbnails.forEach(img => {
            img.classList.remove('active');
            if (img.src === imageUrl) {
                img.classList.add('active');
            }
        });
    }
}

// === טעינת ביקורות ===
function loadReviews(product) {
    const reviewsContainer = document.getElementById("reviews-container");
    if (!reviewsContainer) return;

    reviewsContainer.innerHTML = "";

    if (!product.reviews || product.reviews.length === 0) {
        reviewsContainer.innerHTML = "<p class='no-products'>אין ביקורות למוצר זה.</p>";
        return;
    }

    product.reviews.forEach(review => {
        const reviewDiv = document.createElement("div");
        reviewDiv.className = "review-item";
        reviewDiv.innerHTML = `
            <div class="review-header">
                <strong>${escapeHtml(review.reviewerName || review.user || 'אנונימי')}</strong>
                <span class="review-rating">${'⭐'.repeat(Math.floor(review.rating || 5))}</span>
            </div>
            <p>${escapeHtml(review.comment)}</p>
            ${review.date ? `<p style="color: #999; font-size: 0.8rem;">${new Date(review.date).toLocaleDateString('he-IL')}</p>` : ''}
        `;
        reviewsContainer.appendChild(reviewDiv);
    });
}

// === הוספה לסל קניות ===
function addProductToCart() {
    if (!currentProduct) {
        alert('שגיאה: פרטי המוצר לא נטענו');
        return;
    }

    // שימוש בפונקציה הגלובלית מ-cart.js
    addToCart(
        currentProduct.id, 
        currentProduct.title, 
        currentProduct.price, 
        currentProduct.thumbnail
    );
}

// === הוספת Event Listeners ===
function setupEventListeners() {
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", addProductToCart);
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

// === חיפוש מהדף ===
function performSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim()) {
        const query = searchInput.value.trim();
        window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
}

// === פונקציות עזר ===
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// מעבר לעמוד מוצר (לשימוש בדפים אחרים)
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}