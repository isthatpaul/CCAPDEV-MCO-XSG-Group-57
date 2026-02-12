// Navigation Handler - Check login status and update nav accordingly
document.addEventListener("DOMContentLoaded", () => {
    updateNavigation();
});

function isLoggedIn() {
    return localStorage.getItem("currentUserId") !== null;
}

function getCurrentUserId() {
    return parseInt(localStorage.getItem("currentUserId"));
}

function updateNavigation() {
    const logoutBtn = document.getElementById("logoutBtn");
    const navMenu = document.querySelector(".nav-menu");
    
    if (!logoutBtn) return; // Exit if no logout button found
    
    if (isLoggedIn()) {
        // User is logged in
        logoutBtn.textContent = "Logout";
        logoutBtn.href = "#";
        logoutBtn.onclick = handleLogout;
        
        // Show Profile link, hide Login and Sign Up links
        const profileLink = navMenu.querySelector('a[href="profile.html"]');
        const loginLink = navMenu.querySelector('a[href="login.html"]');
        const signupLink = navMenu.querySelector('a[href="register.html"]');
        
        if (profileLink) profileLink.parentElement.style.display = "inline-block";
        if (loginLink) loginLink.parentElement.style.display = "none";
        if (signupLink) signupLink.parentElement.style.display = "none";
        
    } else {
        // User is not logged in
        logoutBtn.textContent = "Login";
        logoutBtn.href = "login.html";
        logoutBtn.onclick = null;
        
        // Hide Profile link, show Login and Sign Up links
        const profileLink = navMenu.querySelector('a[href="profile.html"]');
        const loginLink = navMenu.querySelector('a[href="login.html"]');
        const signupLink = navMenu.querySelector('a[href="register.html"]');
        
        if (profileLink) profileLink.parentElement.style.display = "none";
        if (loginLink) loginLink.parentElement.style.display = "inline-block";
        if (signupLink) signupLink.parentElement.style.display = "inline-block";
    }
}

function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUserName");
    window.location.href = "index.html";
}

// Also update Profile link to show "My Profile" when logged in
function updateProfileLink() {
    const navMenu = document.querySelector(".nav-menu");
    if (!navMenu) return;
    
    const profileLink = navMenu.querySelector('a[href="profile.html"]');
    if (profileLink) {
        if (isLoggedIn()) {
            profileLink.textContent = "My Profile";
        } else {
            profileLink.textContent = "Profile";
        }
    }
}

document.addEventListener("DOMContentLoaded", updateProfileLink);
