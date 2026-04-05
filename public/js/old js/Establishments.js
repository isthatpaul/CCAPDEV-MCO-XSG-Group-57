// Check if current user is admin and can edit this establishment
function checkAdminAccess() {
    const currentUserId = localStorage.getItem("currentUserId");
    
    if (!currentUserId) {
        return false; // No user logged in
    }

    // Check if user is an admin
    const admin = admins.find(a => a.id === parseInt(currentUserId));
    
    if (!admin) {
        return false; // User is not an admin
    }

    // Optional: Check if admin manages this specific establishment
    // You'll need to pass the establishment ID to this page
    const urlParams = new URLSearchParams(window.location.search);
    const establishmentId = parseInt(urlParams.get('id'));
    
    if (establishmentId && !admin.establishmentsManaged.includes(establishmentId)) {
        return false; // Admin doesn't manage this establishment
    }

    return true;
}

// Declare variables only once at the top
const editButton = document.getElementById("edit-button");
const editCard = document.getElementById("edit-card");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editForm = document.getElementById("editEstablishmentForm");

// Display fields
const estLocation = document.getElementById("estLocation");
const estContact = document.getElementById("estContact");
const estHours = document.getElementById("estHours");
const estLink = document.getElementById("estLink");
const estDescription = document.getElementById("estDescription");

// Input fields
const editLocation = document.getElementById("editLocation");
const editContact = document.getElementById("editContact");
const editHours = document.getElementById("editHours");
const editLink = document.getElementById("editLink");
const editDescription = document.getElementById("editDescription");

// Show/hide edit button based on admin status
document.addEventListener("DOMContentLoaded", () => {
    if (editButton && !checkAdminAccess()) {
        editButton.style.display = "none";
    }
});

// Show edit card
if (editButton) {
    editButton.addEventListener("click", () => {
        editCard.style.display = "block";

        // Pre-fill inputs with current values (remove the "strong" labels)
        editLocation.value = estLocation.textContent.replace("Location:", "").trim();
        editContact.value = estContact.textContent.replace("Contact:", "").trim();
        editHours.value = estHours.textContent.replace("Hours:", "").trim();
        editLink.value = estLink.querySelector("a") ? estLink.querySelector("a").href : "";
        editDescription.value = estDescription.textContent.trim();
    });
}

// Cancel edit
if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
        editCard.style.display = "none";
    });
}

// Save changes
if (editForm) {
    editForm.addEventListener("submit", (e) => {
        e.preventDefault();

        estLocation.innerHTML = `<strong>Location:</strong> ${editLocation.value}`;
        estContact.innerHTML = `<strong>Contact:</strong> ${editContact.value}`;
        estHours.innerHTML = `<strong>Hours:</strong> ${editHours.value}`;
        estLink.innerHTML = `<strong>Links:</strong> <a href="${editLink.value}">Facebook</a>`;
        estDescription.textContent = editDescription.value;

        editCard.style.display = "none";
        
        alert("Establishment details updated successfully!");
    });
}