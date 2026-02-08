const editBtn = document.getElementById("edit-button");
const editCard = document.getElementById("edit-card");

editCard.style.display = "none";

editBtn.addEventListener("click", function() {
        if(editCard.style.display == "none") {
            editCard.style.display = "block";
            editBtn.textContent = "Cancel";
        } else {
            editCard.style.display = "none";
            editBtn.textContent = "Edit";
        }
    });
