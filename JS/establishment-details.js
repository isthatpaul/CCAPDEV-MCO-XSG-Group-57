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

function getEstablishmentId() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) return parseInt(id);

    const dataId = document.body.getAttribute('data-establishment-id');
    if (dataId) return parseInt(dataId);

    const filename = window.location.pathname.split('/').pop();
    const match = filename.match(/establishment-detail(\d+)/);
    if (match) return parseInt(match[1]);

    console.warn('Could not determine establishment ID');
    return null;
}

// Rendering reviews
function renderReviews() {
    const establishmentId = getEstablishmentId();
    if (!establishmentId) {
        console.error('Establishment ID not found');
        return;
    }

    // Get all reviews for this establishment
    const reviewsForEstablishment = [];
    users.forEach(user => {
        user.reviews.forEach(review => {
            if (review.establishmentId === establishmentId) {
                reviewsForEstablishment.push({
                    ...review,
                    userName: user.name,
                    userEmail: user.email,
                    userId: user.id
                });
            }
        });
    });

    // Sort by most recent
    reviewsForEstablishment.reverse();

    const reviewList = document.querySelector('.review-list');
    if (!reviewList) {
        console.error('Review list container not found');
        return;
    }

    // Update review count
    const reviewCountSpan = reviewList.querySelector('.review-list-header span');
    if (reviewCountSpan) {
        reviewCountSpan.textContent = `${reviewsForEstablishment.length} review${reviewsForEstablishment.length !== 1 ? 's' : ''}`;
    }

    const header = reviewList.querySelector('.review-list-header');
    reviewList.innerHTML = '';
    if (header) {
        reviewList.appendChild(header);
    }

    // Render each review
    reviewsForEstablishment.forEach(review => {
        const reviewElement = createReviewElement(review);
        reviewList.appendChild(reviewElement);
    });
}

// Create a review element
function createReviewElement(review) {
    const div = document.createElement('div');
    div.className = 'review-list-item';

    // Get initials for avatar
    const initials = review.userName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();

    // Create star rating display
    const fullStars = '★'.repeat(review.rating);
    const emptyStars = '☆'.repeat(5 - review.rating);
    const starDisplay = fullStars + emptyStars;

    div.innerHTML = `
        <div class="review-list-item-header">
            <div class="review-list-avatar">${initials}</div>
            <div>
                <h4><a href="profile.html?id=${review.userId}"><strong>${review.userName}</strong></a></h4>
                <span>Just now</span>
            </div>
        </div>
        <div class="review-list-stars">${starDisplay}</div>
        <h4>${review.title}</h4>
        <p>${review.comment}</p>
        <div class="review-actions">
            <button type="button" class="btn-vote">▲ Upvote</button>
            <button type="button" class="btn-vote">▼ Downvote</button>
        </div>
    `;

    return div;
}

document.addEventListener('DOMContentLoaded', renderReviews);