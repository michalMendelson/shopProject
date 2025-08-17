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
    const users = await getUsersFromBin();

    // אם ה-BIN שלך שומר במבנה { users: [...] }
    const userList = Array.isArray(users) ? users : users.users || [];

    const user = userList.find(u => u.username === username && u.password === password);

    if (!user) {
        throw new Error("שם משתמש או סיסמה לא נכונים");
    }

    // להחזיר את המשתמש בלי השדה password
    const { password: _, ...userSafe } = user;
    return userSafe;
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



function fillDemoCredentials() {
    const usernameField = document.getElementById("username");
    const passwordField = document.getElementById("password");

    if (usernameField && passwordField) {
        usernameField.value = "kminchelle";
        passwordField.value = "0lelplR";
        showLoginMessage("פרטים נמלאו, לחץ התחבר", "info");
    }
}
