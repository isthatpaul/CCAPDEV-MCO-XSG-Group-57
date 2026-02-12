// Navigation Handler - Check login status and update nav accordingly
document.addEventListener("DOMContentLoaded", () => {
    updateNavigation();
    updateCurrentPageIndicator();
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
    
    const profileLink = navMenu.querySelector('a[href="profile.html"]');
    const signupLink = navMenu.querySelector('a[href="register.html"]');
    
    if (isLoggedIn()) {
        // User is logged in - show Profile, hide Sign Up, show Logout
        logoutBtn.textContent = "Logout";
        logoutBtn.href = "#";
        logoutBtn.onclick = handleLogout;
        
        if (profileLink) profileLink.parentElement.style.display = "inline-block";
        if (signupLink) signupLink.parentElement.style.display = "none";
        
    } else {
        // User is not logged in - hide Profile, show Sign Up, show Login
        logoutBtn.textContent = "Login";
        logoutBtn.href = "login.html";
        logoutBtn.onclick = null;
        
        if (profileLink) profileLink.parentElement.style.display = "none";
        if (signupLink) signupLink.parentElement.style.display = "inline-block";
    }
}

function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUserName");
    window.location.href = "index.html";
}

// Update aria-current="page" based on current page
function updateCurrentPageIndicator() {
    const navMenu = document.querySelector(".nav-menu");
    if (!navMenu) return;
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Remove aria-current from all nav links
    navMenu.querySelectorAll('a').forEach(link => {
        link.removeAttribute('aria-current');
    });
    
    // Add aria-current to the appropriate link
    const currentLink = navMenu.querySelector(`a[href="${currentPage}"]`);
    if (currentLink) {
        currentLink.setAttribute('aria-current', 'page');
    }
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
