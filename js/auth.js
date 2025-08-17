// auth.js

let currentUser = getCurrentUserLocal(); // טען משתמש שנשמר בזיכרון המקומי



// טען *מערך* משתמשים ישיר מה-BIN
async function getUsersFromBin() {
    try {
      const res = await fetch(`${BIN_URL}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      if (!res.ok) return [];
      const data = await res.json();
      // אנו עובדים עם מערך ישיר שנמצא ב-data.record
      return Array.isArray(data.record) ? data.record : [];
    } catch (e) {
      console.error('getUsersFromBin error:', e);
      return [];
    }
  }
  
  // שמור את כל המערך בחזרה (PUT על כל הרשומה)
  async function saveUsersToBin(users) {
    const res = await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(users) // שימי לב: לא עטוף ב-users
    });
    if (!res.ok) throw new Error('שגיאה בשמירת המשתמשים');
  }
  


  


// --- פונקציות ניהול סשן משתמש ב-localStorage ---

function saveCurrentUserLocal(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    currentUser = user;
}

function getCurrentUserLocal() {
    const data = localStorage.getItem('currentUser');
    if (!data) return null;
    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

function clearCurrentUserLocal() {
    localStorage.removeItem('currentUser');
    currentUser = null;
}

// --- התחברות ---

async function authenticateUser(username, password) {
    // נביא את כל המשתמשים ישירות מה-BIN
    const users = await getUsersFromBin(); 

    // נמצא משתמש עם שם וסיסמה תואמים
    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        throw new Error("שם משתמש או סיסמה לא נכונים");
    }

    // להחזיר בלי הסיסמה
    const { password: _, ...userSafe } = user;
    return userSafe;
}


// --- הרשמה ---

async function registerUser(userData) {
    const users = await getUsersFromBin();

    // בדיקה אם שם המשתמש תפוס
    if (users.some(u => u.username === userData.username)) {
        throw new Error('שם המשתמש כבר קיים');
    }

    // הוספת משתמש חדש
    users.push(userData);

    // שמירת הרשימה המעודכנת
    await saveUsersToBin(users);

    return userData;
}

// --- שמירת משתמש נוכחי ---

function saveCurrentUser(user) {
    saveCurrentUserLocal(user);
}

// --- ניקוי משתמש נוכחי ---

function clearCurrentUser() {
    clearCurrentUserLocal();
}

// --- עדכון תצוגת משתמש מחובר ---

function updateUserStatus() {
    const loginLink = document.getElementById('login-link');
    const userInfo = document.getElementById('user-info');
    const userStatus = document.getElementById('user-status');

    if (loginLink && userInfo) {
        if (currentUser) {
            loginLink.style.display = 'none';
            userInfo.style.display = 'inline';
            userInfo.innerHTML = `
                <span>שלום, ${currentUser.firstName || currentUser.username}</span>
                <a href="user.html" style="color: white; margin: 0 10px;">פרופיל</a>
                <button onclick="logout()" style="background: none; border: 1px solid white; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer;">התנתק</button>
            `;
        } else {
            loginLink.style.display = 'inline';
            userInfo.style.display = 'none';
        }
    }

    if (userStatus) {
        if (currentUser) {
            userStatus.innerHTML = `
                <span>שלום, ${currentUser.firstName || currentUser.username}</span>
                <button onclick="logout()">התנתק</button>
            `;
        } else {
            userStatus.innerHTML = `<a href="login.html">התחבר</a>`;
        }
    }
}

// --- התנתקות ---

function logout() {
    if (confirm("האם אתה בטוח שברצונך להתנתק?")) {
        clearCurrentUser();
        currentUser = null;
        updateUserStatus();

        // ניקוי סל קניות אופציונלי:
        // localStorage.removeItem('cart');

        alert("התנתקת מהמערכת");
        window.location.href = "index.html";
    }
}

// --- בדיקת הרשאות גישה לדפים ---

function requireAuth() {
    if (!currentUser) {
        alert("יש להתחבר כדי לגשת לדף זה");
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// --- פונקציות עזר להצגת הודעות ---

function showMessage(message, type = 'info', element = null) {
    if (element) {
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
    } else {
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
        }, 5000);
    }
}

// --- אירוע טעינת הדף ---

document.addEventListener('DOMContentLoaded', () => {
    updateUserStatus();
});

