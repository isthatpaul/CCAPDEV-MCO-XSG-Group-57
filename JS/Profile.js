// Get current logged-in user ID
function getLoggedInUserId() {
    return parseInt(localStorage.getItem("currentUserId")) || null;
}

// Get viewed user ID from URL parameter
function getViewedUserId() {
    const params = new URLSearchParams(window.location.search);
    const urlId = parseInt(params.get('id'));
    
    // If no ID in URL, default to logged-in user
    if (!urlId) {
        return getLoggedInUserId();
    }
    return urlId;
}

function getCurrentUser() {
    const userId = getViewedUserId();
    if (!userId) return null;
    return users.find(u => u.id === userId);
}

function getLoggedInUser() {
    const userId = getLoggedInUserId();
    if (!userId) return null;
    return users.find(u => u.id === userId);
}

// Check if viewing own profile
function isOwnProfile() {
    return getLoggedInUserId() === getViewedUserId();
}

// Check if user is logged in
function isLoggedIn() {
    return getLoggedInUserId() !== null;
}

function getEstablishmentName(establishmentId) {
    const est = establishments.find(e => e.id === establishmentId);
    return est ? est.name : "Unknown Establishment";
}

// Render star rating
function renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? "★" : "☆";
    }
    return stars;
}

// Initialize profile with permission-based UI
function initializeProfile() {
    const user = getCurrentUser();
    const loggedInUser = getLoggedInUser();
    const isOwn = isOwnProfile();
    
    if (!user) {
        document.body.innerHTML = "<p style='text-align:center; margin-top:50px;'>User not found. <a href='index.html'>Go back home</a></p>";
        return;
    }

    // Update page title
    document.title = `${user.name}'s Profile - TaftBites`;

    // Update profile header
    document.getElementById("bioInfo").textContent = user.bio;
    document.getElementById("email").textContent = "Email: " + user.email;
    document.getElementById("contactNo").textContent = "Contact No.: " + user.phone;
    document.getElementById("profileImg").src = user.image;
    document.getElementById("joinDateText").textContent = user.joinDate;

    // PERMISSION LOGIC: Show edit button and controls ONLY if viewing own profile
    const editBtn = document.getElementById("edit-button");
    const editCard = document.getElementById("edit-card");
    const logoutBtn = document.getElementById("logoutBtn");

    if (isOwn && isLoggedIn()) {
        // Own profile: show edit button and controls
        editBtn.style.display = "block";
        logoutBtn.style.display = "block";
        editBtn.addEventListener("click", toggleEditMode);
    } else {
        // Viewing someone else's profile: hide edit
        editBtn.style.display = "none";
        editCard.style.display = "none";
        logoutBtn.textContent = isLoggedIn() ? "Logout" : "Login";
    }

    // Render reviews
    const reviewsContainer = document.getElementById("user-reviews");
    reviewsContainer.innerHTML = "";

    if (user.reviews && user.reviews.length > 0) {
        user.reviews.forEach(review => {
            const estName = getEstablishmentName(review.establishmentId);
            const reviewCard = document.createElement("div");
            reviewCard.className = "review card";
            reviewCard.style.marginTop = "12px";
            reviewCard.innerHTML = `
                <h4>${review.title}</h4>
                <p><strong>At:</strong> ${estName}</p>
                <p><strong>Rating:</strong> ${renderStars(review.rating)}</p>
                <p>${review.comment}</p>
            `;
            reviewsContainer.appendChild(reviewCard);
        });
    } else {
        reviewsContainer.innerHTML = "<p style='color: #999;'>No reviews yet.</p>";
    }
}

function toggleEditMode() {
    const editCard = document.getElementById("edit-card");
    const editBtn = document.getElementById("edit-button");
    
    if(editCard.style.display === "none") {
        editCard.style.display = "block";
        editBtn.textContent = "Cancel";
    } else {
        editCard.style.display = "none";
        editBtn.textContent = "Edit";
    }
}

// Grab elements
const editBtn = document.getElementById("edit-button");
const editCard = document.getElementById("edit-card");
const editForm = document.getElementById("editProfileForm");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const bioInfo = document.getElementById("bioInfo");
const emailText = document.getElementById("email");
const phoneNo = document.getElementById("contactNo");
const photo = document.getElementById("profileImg");

// Edit form submission
editForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const updatedBio = document.getElementById("editBio").value;
    if (updatedBio) bioInfo.textContent = updatedBio;

    const updatedEmail = document.getElementById("editEmail").value;
    if (updatedEmail) emailText.textContent = "Email: " + updatedEmail;

    const updatedPhone = document.getElementById("editPhone").value;
    if (updatedPhone) phoneNo.textContent = "Contact No.: " + updatedPhone;

    editCard.style.display = "none";
    editBtn.textContent = "Edit";

    editForm.reset();
});

// Cancel edit button
cancelEditBtn.addEventListener("click", () => {
    editCard.style.display = "none";
    editBtn.textContent = "Edit";
    editForm.reset();
});

// Logout handler
document.getElementById("logoutBtn").addEventListener("click", (e) => {
    if (isLoggedIn()) {
        e.preventDefault();
        localStorage.removeItem("currentUserId");
        localStorage.removeItem("currentUserName");
        window.location.href = "index.html";
    }
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", initializeProfile);
