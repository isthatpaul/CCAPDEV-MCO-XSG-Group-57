// Navigation Handler - Check login status and update nav accordingly
document.addEventListener("DOMContentLoaded", () => {
    updateNavigation();
    updateCurrentPageIndicator();
    updateProfileLink();
});

function isLoggedIn() {
    return localStorage.getItem("currentUserId") !== null;
}

function getCurrentUserId() {
    return parseInt(localStorage.getItem("currentUserId"));
}

function updateNavigation() {
    // Update both .nav-menu and .sidebar-menu
    const menus = document.querySelectorAll(".nav-menu, .sidebar-menu");

    menus.forEach(menu => {
        const logoutBtn = menu.querySelector("#logoutBtn") || menu.querySelector('a[href="login.html"]');
        const profileLink = menu.querySelector('a[href="profile.html"]') || menu.querySelector('a[href^="profile.html"]');
        const signupLink = menu.querySelector('a[href="register.html"]');

        if (isLoggedIn()) {
            const userId = getCurrentUserId();

            // Update profile link to include user ID
            if (profileLink) {
                profileLink.href = `profile.html?id=${userId}`;
                profileLink.parentElement.style.display = "inline-block";
            }

            // Hide Sign Up
            if (signupLink) {
                signupLink.parentElement.style.display = "none";
            }

            // Change Login to Logout
            if (logoutBtn) {
                const icon = logoutBtn.querySelector(".menu-icon");
                if (icon) {
                    logoutBtn.textContent = "";
                    logoutBtn.appendChild(icon);
                    logoutBtn.append(" Logout");
                } else {
                    logoutBtn.textContent = "Logout";
                }

                logoutBtn.href = "#";
                logoutBtn.onclick = handleLogout;
            }
        } else {
            // User is not logged in
            if (profileLink) {
                profileLink.href = "profile.html";
                profileLink.parentElement.style.display = "none";
            }

            if (signupLink) {
                signupLink.parentElement.style.display = "inline-block";
            }

            if (logoutBtn) {
                const icon = logoutBtn.querySelector(".menu-icon");
                if (icon) {
                    logoutBtn.textContent = "";
                    logoutBtn.appendChild(icon);
                    logoutBtn.append(" Login");
                } else {
                    logoutBtn.textContent = "Login";
                }
                logoutBtn.href = "login.html";
                logoutBtn.onclick = null;
            }
        }
    });
}

function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUserName");
    window.location.href = "index.html";
}

// Update aria-current="page" based on current page
function updateCurrentPageIndicator() {
    const menus = document.querySelectorAll(".nav-menu, .sidebar-menu");
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    menus.forEach(menu => {
        menu.querySelectorAll('a').forEach(link => {
            link.removeAttribute('aria-current');
        });

        menu.querySelectorAll('a').forEach(link => {
            const linkPage = link.getAttribute('href')?.split('?')[0];
            if (linkPage === currentPage) {
                link.setAttribute('aria-current', 'page');
            }
        });
    });
}

// Update Profile link text when logged in
function updateProfileLink() {
    const menus = document.querySelectorAll(".nav-menu, .sidebar-menu");

    menus.forEach(menu => {
        const profileLink = menu.querySelector('a[href^="profile.html"]');
        if (profileLink) {
            if (isLoggedIn()) {
                const icon = profileLink.querySelector(".menu-icon");
                if (icon) {
                    profileLink.textContent = "";
                    profileLink.appendChild(icon);
                    profileLink.append(" My Profile");
                } else {
                    profileLink.textContent = "My Profile";
                }
            }
        }
    });
}