const writeReviewButton = document.getElementById('writeReviewButton');
const editReviewButton = document.getElementById('editReviewButton');
const overlay = document.getElementById('reviewOverlayForm');
const cancelBtn = overlay.querySelector('.cancel');
const form = document.getElementById('reviewForm');

const formHeading = overlay.querySelector('h3');
const submitBtn = form.querySelector('button[type="submit"]'); 


writeReviewButton.addEventListener('click', () => {
    formHeading.textContent = 'Write Review';
    submitBtn.textContent = 'Post Review'; 
    overlay.style.display = 'flex';
});


editReviewButton.addEventListener('click', () => {
    formHeading.textContent = 'Edit Review';
    submitBtn.textContent = 'Save Changes'; 
    overlay.style.display = 'flex';
});

const closeOverlay = () => {
    overlay.style.display = 'none';
    form.reset();
    formHeading.textContent = 'Write Review';
    submitBtn.textContent = 'Post Review'; 
};

cancelBtn.addEventListener('click', closeOverlay);

form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Form submitted');
    closeOverlay();
});