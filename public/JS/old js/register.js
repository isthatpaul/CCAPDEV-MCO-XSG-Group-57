// Register/Signup Form Handler
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }
});

function handleRegister(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const confirmPassword = document.getElementById("regConfirmPassword").value.trim();

    // Validate inputs
    if (!fullName || !email || !password || !confirmPassword) {
        showRegisterError("Please fill in all fields");
        return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
        showRegisterError("Please enter a valid email address");
        return;
    }

    // Validate password length
    if (password.length < 4) {
        showRegisterError("Password must be at least 4 characters long");
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        showRegisterError("Passwords do not match");
        document.getElementById("regPassword").value = "";
        document.getElementById("regConfirmPassword").value = "";
        return;
    }

    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showRegisterError("Email already registered. Please login or use a different email");
        return;
    }

    // Create new user
    const newUser = {
        id: users.length + 1,
        name: fullName,
        email: email,
        password: password,
        joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        bio: "New member of TaftBites!",
        phone: "",
        image: "sample_profile.jpg",
        reviews: []
    };

    // Add user to array (in real app, would send to backend)
    users.push(newUser);

    // Save to localStorage for persistence in this session
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUserId", newUser.id);
    localStorage.setItem("currentUserName", newUser.name);

    // Show success message
    showRegisterSuccess(`Account created successfully! Welcome, ${fullName}!`);

    // Redirect to profile page after 2 seconds
    setTimeout(() => {
        window.location.href = `profile.html?id=${newUser.id}`;
    }, 2000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showRegisterError(message) {
    // Remove existing error if any
    const existingError = document.querySelector(".register-error");
    if (existingError) {
        existingError.remove();
    }

    const registerForm = document.getElementById("registerForm");
    const errorDiv = document.createElement("div");
    errorDiv.className = "register-error";
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
    
    registerForm.insertBefore(errorDiv, registerForm.firstChild);
}

function showRegisterSuccess(message) {
    // Remove existing messages
    const existing = document.querySelector(".register-error, .register-success");
    if (existing) {
        existing.remove();
    }

    const registerForm = document.getElementById("registerForm");
    const successDiv = document.createElement("div");
    successDiv.className = "register-success";
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
    
    registerForm.insertBefore(successDiv, registerForm.firstChild);
}
