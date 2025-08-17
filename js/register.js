// register.js


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
                id: Date.now(),               // מזהה ייחודי אוטומטי
                username: username,           // מהשדה בטופס
                email: email,                 // מהשדה בטופס
                password: password,           // מהשדה בטופס
                address: "",                  // אפשר להוסיף שדה address בטופס אם רוצים
                cart: [],                     // ריק כברירת מחדל
                orders: []                    // ריק כברירת מחדל
            };
            

            await registerUser(userData);

          // await saveJsonToBin(userData);

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
