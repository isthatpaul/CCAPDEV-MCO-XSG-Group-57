// Grab elements
const editBtn = document.getElementById("edit-button");
const editCard = document.getElementById("edit-card");
const editForm = document.getElementById("editProfileForm");

const bioInfo = document.getElementById("bioInfo");
const emailText = document.getElementById("email");
const phoneNo = document.getElementById("contactNo");
const photo = document.getElementById("profileImg"); // make sure ID matches your HTML

editCard.style.display = "none";

// Edit button logic
editBtn.addEventListener("click", () => {
    if(editCard.style.display == "none") {
        editCard.style.display = "block";
        editBtn.textContent = "Cancel";
    } else {
        editCard.style.display = "none";
        editBtn.textContent = "Edit";
    }
});

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
