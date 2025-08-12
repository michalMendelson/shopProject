document.addEventListener("DOMContentLoaded", () => {
    initializeLoginPage();
});

async function initializeLoginPage() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        window.location.href = "index.html";
        return;
    }
    setupLoginForm();
    setupDemoCredentials();
}

function setupLoginForm() {
    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            showLoginMessage("יש למלא את כל השדות", "error");
            return;
        }

        try {
            showLoginMessage("מתחבר...", "info");

            const userData = await authenticateUser(username, password);

            saveCurrentUser(userData);

            showLoginMessage("התחברת בהצלחה!", "success");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);

        } catch (error) {
            console.error("Login error:", error);
            showLoginMessage(error.message || "שם משתמש או סיסמה לא נכונים", "error");
        }
    });
}

async function authenticateUser(username, password) {
    try {
        const users = await loadFromJsonBin();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            console.log("Login successful", user);
            // לשמור ב־localStorage או sessionStorage
        } else {
            console.log("Invalid credentials");
        }
    } catch (err) {
        console.error("Login error:", err);
    }
}


function showLoginMessage(message, type = "info") {
    const messageElement = document.getElementById("login-message");

    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = "block";
    } else {
        console.log(message);
    }
}

function saveCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

async function getUsersFromBin() {
    try {
        const response = await fetch(BIN_URL, {
            headers: { 'X-Master-Key': API_KEY }
        });
        if (!response.ok) throw new Error("שגיאה בטעינת משתמשים");
        const data = await response.json();
        if (data.record && Array.isArray(data.record)) {
            return data.record;
        } else {
            throw new Error("פורמט נתונים לא צפוי מהשרת");
        }
    } catch (err) {
        console.error(err);
        throw new Error("שגיאה בטעינת משתמשים");
    }
}


function getCurrentUser() {
    try {
        const userJson = localStorage.getItem("currentUser");
        if (!userJson) return null;
        return JSON.parse(userJson);
    } catch {
        return null;
    }
}

function setupDemoCredentials() {
    const demoSection = document.createElement("div");
    demoSection.style.cssText = "text-align: center; margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 8px; border: 1px solid #ddd;";
    demoSection.innerHTML = `
        <h4 style="margin-bottom: 10px; color: #333;">משתמש לדוגמה:</h4>
        <p style="margin: 5px 0; font-size: 0.9rem;">שם משתמש: <strong>kminchelle</strong></p>
        <p style="margin: 5px 0; font-size: 0.9rem;">סיסמה: <strong>0lelplR</strong></p>
        <button onclick="fillDemoCredentials()" style="margin-top: 10px; padding: 5px 15px; background: #0a9396; color: white; border: none; border-radius: 5px; cursor: pointer;">מלא אוטומטית</button>
    `;

    const authSection = document.querySelector(".auth-section");
    if (authSection) {
        authSection.appendChild(demoSection);
    }
}

function fillDemoCredentials() {
    const usernameField = document.getElementById("username");
    const passwordField = document.getElementById("password");

    if (usernameField && passwordField) {
        usernameField.value = "kminchelle";
        passwordField.value = "0lelplR";
        showLoginMessage("פרטים נמלאו, לחץ התחבר", "info");
    }
}
