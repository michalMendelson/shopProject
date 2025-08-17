// cart.js

// אובייקט ניהול סל הקניות עם LocalStorage
const cart = {
    items: JSON.parse(localStorage.getItem('cart')) || [],
  
    save() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    },
  
    addItem(product) {
      const existing = this.items.find(item => item.id === product.id);
      if (existing) {
        existing.quantity++;
      } else {
        this.items.push({
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          quantity: 1
        });
      }
      this.save();
    },
  
    updateQuantity(productId, quantity) {
      const item = this.items.find(i => i.id === productId);
      if (item && quantity > 0) {
        item.quantity = quantity;
        this.save();
      }
    },
  
    removeItem(productId) {
      this.items = this.items.filter(i => i.id !== productId);
      this.save();
    },
  
    clear() {
      this.items = [];
      this.save();
    },
  
    getTotalPrice() {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  };
  
  // הוספת מוצר לסל (לשימוש ב-product.js)
  function addToCart(id, title, price, thumbnail) {
    cart.addItem({ id, title, price, thumbnail });
    updateCartCount();
    alert(`המוצר "${title}" נוסף לסל!`);
  }
  
  // עדכון ספירת פריטים בסל (לסרגל העליון)
  function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalQuantity;
    }
  }
  
  // אתחול דף סל הקניות (רק אם אנחנו בעמוד cart.html)
  document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
  
    if (window.location.pathname.includes('cart.html')) {
      initializeCartPage();
    }
  });
  
  function initializeCartPage() {
    updateUserStatus(); // מתוך auth.js
    renderCartPage();
    setupCartEventListeners();
  }
  
  // רינדור דף סל הקניות
  function renderCartPage() {
    const cartTableBody = document.getElementById('cart-table-body');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
  
    if (!cartTableBody) return;
  
    if (cart.items.length === 0) {
      cartTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="no-products">
            הסל ריק<br>
            <a href="index.html" class="btn" style="margin-top: 10px;">המשך קנייה</a>
          </td>
        </tr>
      `;
  
      if (cartTotal) {
        cartTotal.textContent = '0₪';
      }
  
      if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'הסל ריק';
      }
  
      return;
    }
  
    // רינדור פריטי הסל
    cartTableBody.innerHTML = '';
    cart.items.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <img src="${item.thumbnail}" alt="${item.title}" class="cart-img"
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='">
        </td>
        <td>
          <strong>${escapeHtml(item.title)}</strong>
          <br>
          <a href="product.html?id=${item.id}" style="color: #0a9396; font-size: 0.9rem;">צפה במוצר</a>
        </td>
        <td><strong>${item.price}₪</strong></td>
        <td>
          <input type="number" value="${item.quantity}" min="1" max="99"
                 onchange="updateCartItemQuantity(${item.id}, this.value)"
                 style="width: 60px; padding: 5px; text-align: center;">
        </td>
        <td><strong>${(item.price * item.quantity).toFixed(2)}₪</strong></td>
        <td>
          <button class="remove-btn" onclick="removeCartItem(${item.id})"
                  title="הסר מהסל">
            🗑️ הסר
          </button>
        </td>
      `;
      cartTableBody.appendChild(row);
    });
  
    // עדכון סכום כולל
    if (cartTotal) {
      cartTotal.textContent = `${cart.getTotalPrice().toFixed(2)}₪`;
    }
  
    // הפעלת כפתור קנייה
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = 'מעבר לתשלום';
    }
  }
  
  // פונקציות לטבלת הסל
  function updateCartItemQuantity(productId, quantity) {
    const qty = parseInt(quantity);
    if (qty > 0) {
      cart.updateQuantity(productId, qty);
      renderCartPage();
      updateCartCount();
    }
  }
  
  function removeCartItem(productId) {
    if (confirm('האם אתה בטוח שברצונך להסיר את המוצר מהסל?')) {
      cart.removeItem(productId);
      renderCartPage();
      updateCartCount();
    }
  }
  
  // הוספת Event Listeners לדף הסל
  function setupCartEventListeners() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutForm = document.getElementById('checkout-form');
  
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', showCheckoutForm);
    }
  
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', processCheckout);
    }
  
    // חיפוש
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
  
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        performCartSearch();
      });
    }
  
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          performCartSearch();
        }
      });
    }
  }
  
  function showCheckoutForm() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert('יש להתחבר כדי לבצע הזמנה');
      window.location.href = 'login.html';
      return;
    }
  
    if (cart.items.length === 0) {
      alert('הסל ריק');
      return;
    }
  
    const checkoutFormSection = document.getElementById('checkout-form-section');
    if (checkoutFormSection) {
      checkoutFormSection.classList.remove('hidden');
      checkoutFormSection.style.display = 'block';
  
      // גלילה לטופס
      checkoutFormSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  async function processCheckout(e) {
    e.preventDefault();
  
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert('יש להתחבר כדי לבצע הזמנה');
      return;
    }
  
    const address = document.getElementById('address').value.trim();
    const creditCard = document.getElementById('credit-card').value.trim();
  
    if (!address || !creditCard) {
      showCheckoutMessage('יש למלא את כל השדות', 'error');
      return;
    }
  
    // ולידציה בסיסית לכרטיס אשראי
    if (creditCard.length < 13 || creditCard.length > 19) {
      showCheckoutMessage('מספר כרטיס אשראי לא תקין', 'error');
      return;
    }
  
    try {
      showCheckoutMessage('מעבד הזמנה...', 'info');
  
      // יצירת הזמנה
      const order = {
        id: Date.now(),
        userId: currentUser.id,
        items: [...cart.items],
        total: cart.getTotalPrice(),
        date: new Date().toISOString(),
        status: 'ordered',
        shippingAddress: address,
        paymentMethod: `כרטיס אשראי מסתיים ב-${creditCard.slice(-4)}`
      };
  
      // שמירת ההזמנה
      saveOrderToUser(currentUser.id, order);
  
      // סימולציה של זמן עיבוד
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      // ניקוי הסל
      cart.clear();
      updateCartCount();
      renderCartPage();
  
      showCheckoutMessage('ההזמנה בוצעה בהצלחה! תודה על הרכישה 🎉', 'success');
  
      // המתנה ומעבר לדף המשתמש
      setTimeout(() => {
        window.location.href = 'user.html';
      }, 3000);
  
    } catch (error) {
      console.error('Checkout error:', error);
      showCheckoutMessage('שגיאה בעיבוד ההזמנה. אנא נסה שוב', 'error');
    }
  }
  
  function showCheckoutMessage(message, type = 'info') {
    const messageElement = document.getElementById('checkout-message');
  
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.className = `message ${type}`;
      messageElement.style.display = 'block';
    }
  }
  
  function performCartSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim()) {
      const query = searchInput.value.trim();
      window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
  }
  
  // פונקציה לעזרה עם בטיחות הוספה של טקסט ל-HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  