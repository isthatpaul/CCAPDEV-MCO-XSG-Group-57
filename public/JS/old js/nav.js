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

function isCurrentUserAdmin() {
    return localStorage.getItem("isAdmin") === "true";
}

// Get the establishment detail page URL for an admin user
function getAdminEstablishmentUrl() {
    if (typeof admins === "undefined") {
        return null;
    }

    const userId = getCurrentUserId();
    const admin = admins.find(a => a.id === userId);

    if (!admin || !admin.establishmentsManaged || admin.establishmentsManaged.length === 0) {
        return null;
    }

    // Redirect to the first establishment they manage
    const estId = admin.establishmentsManaged[0];
    return "establishment-detail" + estId + ".html";
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

            // Update profile link based on whether user is admin or regular user
            if (profileLink) {
                if (isCurrentUserAdmin()) {
                    // Admin: link to their managed establishment page
                    const estUrl = getAdminEstablishmentUrl();
                    if (estUrl) {
                        profileLink.href = estUrl;
                    }
                } else {
                    // Regular user: link to their profile page
                    profileLink.href = "profile.html?id=" + userId;
                }
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
    localStorage.removeItem("isAdmin");
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
            const href = link.getAttribute('href');
            if (href) {
                const linkPage = href.split('?')[0];
                if (linkPage === currentPage) {
                    link.setAttribute('aria-current', 'page');
                }
            }
        });
    });
}

// Update Profile link text when logged in
function updateProfileLink() {
    const menus = document.querySelectorAll(".nav-menu, .sidebar-menu");

    menus.forEach(menu => {
        let profileLink = menu.querySelector('a[href^="profile.html"]');
        if (!profileLink) {
            profileLink = menu.querySelector('a[href^="establishment-detail"]');
        }

        if (profileLink) {
            if (isLoggedIn()) {
                const icon = profileLink.querySelector(".menu-icon");

                let linkText = " My Profile";
                if (isCurrentUserAdmin()) {
                    linkText = " My Establishment";
                }

                if (icon) {
                    profileLink.textContent = "";
                    profileLink.appendChild(icon);
                    profileLink.append(linkText);
                } else {
                    profileLink.textContent = linkText.trim();
                }
            }
        }
    });
}