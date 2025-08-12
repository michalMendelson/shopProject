// register.js

const BIN_ID = "6899b8b0d0ea881f40568cf0";  // החליפי במזהה שלך
const API_KEY = "$2a$10$laHYgxEfvvYKcPoe41VEb.GMNiHUXtJbbM7.YFWXiiDhZ5eTJ92"; // החליפי במפתח שלך

document.addEventListener("DOMContentLoaded", () => {
    initializeRegisterPage();
});

async function initializeRegisterPage() {
    const currentUser = await getCurrentUser();
    if (currentUser) {
        // אם כבר מחובר, הפנה לדף הבית
        window.location.href = "index.html";
        return;
    }
    setupRegisterForm();
}

function setupRegisterForm() {
    const registerForm = document.getElementById("register-form");
    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPasswordField = document.getElementById("confirm-password");
        const confirmPassword = confirmPasswordField ? confirmPasswordField.value.trim() : password;

        // ולידציה
        if (!username || !email || !password) {
            showRegisterMessage("יש למלא את כל השדות", "error");
            return;
        }

        if (password !== confirmPassword) {
            showRegisterMessage("הסיסמאות אינן תואמות", "error");
            return;
        }

        if (password.length < 4) {
            showRegisterMessage("הסיסמה חייבת להכיל לפחות 4 תווים", "error");
            return;
        }

        // בדיקת תקינות אימייל בסיסית
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showRegisterMessage("יש להכניס כתובת אימייל תקינה", "error");
            return;
        }

        try {
            showRegisterMessage("נרשם...", "info");

            const userData = {
                id: Date.now(), // מזהה ייחודי פשוט
                username,
                email,
                password,
                firstName: username,
                lastName: "User",
                token: null
            };

            await saveUserToBin(userData);

            showRegisterMessage("ההרשמה בוצעה בהצלחה! מעביר להתחברות...", "success");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);

        } catch (error) {
            console.error("Registration error:", error);
            showRegisterMessage(error.message || "שגיאה בהרשמה", "error");
        }
    });

    // ולידציה בזמן אמת לאישור סיסמה
    const passwordField = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");

    if (passwordField && confirmPasswordInput) {
        function validatePasswordMatch() {
            if (confirmPasswordInput.value && passwordField.value !== confirmPasswordInput.value) {
                confirmPasswordInput.style.borderColor = "#ff4444";
                confirmPasswordInput.title = "הסיסמאות אינן תואמות";
            } else {
                confirmPasswordInput.style.borderColor = "#ccc";
                confirmPasswordInput.title = "";
            }
        }
        passwordField.addEventListener("input", validatePasswordMatch);
        confirmPasswordInput.addEventListener("input", validatePasswordMatch);
    }
}

function showRegisterMessage(message, type = "info") {
    const messageElement = document.getElementById("register-message");
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = "block";
    } else {
        const messageDiv = document.createElement("div");
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
            if (messageDiv.parentNode) messageDiv.remove();
        }, 5000);
    }
}

// קריאת משתמשים מה-BIN
async function getUsersFromBin() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { "X-Master-Key": API_KEY }
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.record || [];
    } catch {
        return [];
    }
}

// שמירת מערך משתמשים מעודכן ב-BIN
async function saveUsersToBin(users) {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": API_KEY
        },
        body: JSON.stringify(users)
    });
    if (!response.ok) throw new Error("שגיאה בשמירת המשתמשים");
}

// שמירת משתמש חדש - מוסיף למערך קיים
async function saveUserToBin(newUser) {
    const users = await getUsersFromBin();

    // בדיקה אם שם משתמש קיים
    if (users.some(u => u.username === newUser.username)) {
        throw new Error("שם המשתמש כבר קיים");
    }

    users.push(newUser);
    await saveUsersToBin(users);
}

// בדיקה אם יש משתמש מחובר ב־localStorage
async function getCurrentUser() {
    // אפשר להחליף לבדיקה מ־JSONBin אם רוצים
    try {
        const currentUserJson = localStorage.getItem("currentUser");
        if (!currentUserJson) return null;
        return JSON.parse(currentUserJson);
    } catch {
        return null;
    }
}

async function registerUser(newUser) {
    // 1. טען את כל המשתמשים מה-BIN
    const users = await loadFromJsonBin(BIN_ID);

    // 2. בדוק אם שם המשתמש כבר קיים
    if (users.some(u => u.username === newUser.username)) {
        throw new Error("שם המשתמש כבר קיים");
    }

    // 3. הוסף את המשתמש החדש למערך
    users.push(newUser);

    // 4. שמור את הרשימה המעודכנת ב-BIN
    await saveToJsonBin(BIN_ID, users);

    return newUser;
}
