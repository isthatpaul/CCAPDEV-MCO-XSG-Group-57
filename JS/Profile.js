// Grab the needed elements
const editBtn = document.getElementById("edit-button");
const editCard = document.getElementById("edit-card");
const editForm = document.getElementById("editProfileForm");

// by default hides the edit screen
editCard.style.display = "none";

// PRofile display elements
const bioInfo = document.getElementById("bioInfo");
const emailText = document.getElementById("email");
const phoneNo = document.getElementById("contactNo");
const photo = document.getElementById("bprofileImg");

// toggle edit profile
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

     // Update bio
    const updatedBio = document.getElementById("editBio").value;
    if (updatedBio) 
        bioInfo.textContent = updatedBio;

    // Update email
    const updatedEmail = document.getElementById("editEmail").value;
    if (updatedEmail) 
        emailText.textContent = "Email: " + updatedEmail;

    // Update phone
    const updatedPhone = document.getElementById("editPhone").value;
    if (updatedPhone) 
        phoneNo.textContent = "Contact No.: " + updatedPhone;

    // Close edit card and reset button text
    editCard.style.display = "none";
    editBtn.textContent = "Edit";

    // Reset the form fields
    editForm.reset();
} )
