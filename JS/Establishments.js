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


// Show edit card
editButton.addEventListener("click", () => {
    editCard.style.display = "block";

    // Pre-fill inputs with current values
    editLocation.value = estLocation.textContent;
    editContact.value = estContact.textContent;
    editHours.value = estHours.textContent;
    editLink.value = estLink.textContent;
    editDescription.value = estDescription.textContent;
});

// Cancel edit
cancelEditBtn.addEventListener("click", () => {
    editCard.style.display = "none";
});

// Save changes
editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    estLocation.textContent = editLocation.value;
    estContact.textContent = editContact.value;
    estHours.textContent = editHours.value;
    estLink.textContent = editLink.value;
    estDescription.textContent = editDescription.value;

    editCard.style.display = "none";
});
