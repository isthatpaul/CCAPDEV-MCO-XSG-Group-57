// Login Form Handler
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
});

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        showLoginError("Please fill in all fields");
        return;
    }

    // Check regular users first
    let user = users.find(u => u.email === email && u.password === password);
    let isAdmin = false;

    // If not found in users, check admins
    if (!user) {
        user = admins.find(a => a.email === email && a.password === password);
        isAdmin = true;
    }

    if (user) {
        // Successful login
        localStorage.setItem("currentUserId", user.id);
        localStorage.setItem("currentUserName", user.name);
        localStorage.setItem("isAdmin", isAdmin); // Store admin status
        
        showLoginSuccess("Welcome, " + user.name + "!");
        
        setTimeout(() => {
            if (isAdmin) {
                // Admin: redirect to their managed establishment page
                const estId = user.establishmentsManaged[0];
                window.location.href = "establishment-detail" + estId + ".html";
            } else {
                // Regular user: redirect to their profile page
                window.location.href = "profile.html?id=" + user.id;
            }
        }, 1500);
    } else {
        showLoginError("Invalid email or password");
        document.getElementById("loginPassword").value = "";
    }
}

function showLoginError(message) {
    // Remove existing error if any
    const existingError = document.querySelector(".login-error");
    if (existingError) {
        existingError.remove();
    }

    const loginForm = document.getElementById("loginForm");
    const errorDiv = document.createElement("div");
    errorDiv.className = "login-error";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background-color: #fee;
        color: #c33;
        padding: 12px;
        border-radius: 4px;
        margin-bottom: 12px;
        border: 1px solid #fcc;
        font-size: 14px;
    `;
    loginForm.insertBefore(errorDiv, loginForm.firstChild);
}

function showLoginSuccess(message) {
    // Remove existing messages
    const existing = document.querySelector(".login-error, .login-success");
    if (existing) {
        existing.remove();
    }

    const loginForm = document.getElementById("loginForm");
    const successDiv = document.createElement("div");
    successDiv.className = "login-success";
    successDiv.textContent = message;
    successDiv.style.cssText = `
        background-color: #efe;
        color: #3c3;
        padding: 12px;
        border-radius: 4px;
        margin-bottom: 12px;
        border: 1px solid #cfc;
        font-size: 14px;
    `;
    
    loginForm.insertBefore(successDiv, loginForm.firstChild);
}

// Demo login credentials helper - displays available test accounts
function showDemoAccounts() {
    const demoList = users.map(u => u.name + ": " + u.email + " / password: " + u.password).join("\n");
    console.log("Demo Accounts:\n" + demoList);
}