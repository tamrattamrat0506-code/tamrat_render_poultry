// clothing_detail.js
document.addEventListener('DOMContentLoaded', function() {
    initInteractionButtons();
    initImageGallery();
});

function initInteractionButtons() {
    const likeButtons = document.querySelectorAll('.like-button');
    likeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const clothingId = this.dataset.itemId;
            likeClothing(clothingId, this);
        });
    });

    const shareButtons = document.querySelectorAll('.share-button');
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const clothingId = this.dataset.itemId;
            shareClothing(clothingId, this);
        });
    });
}

// Image gallery functionality
function initImageGallery() {
    const mainImage = document.getElementById('mainClothingImage');
    const thumbnails = document.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            mainImage.src = thumbnail.src;
        });
    });
}

async function likeClothing(clothingId, button) {
    try {
        const response = await fetch(`/clothings/like/${clothingId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin'
        });

        const data = await response.json();
        if (data.status === 'success') {
            button.querySelector('.interaction-count').textContent = data.like_count;
        }
    } catch (err) {
        console.error(err);
    }
}

async function shareClothing(clothingId, button) {
    try {
        const response = await fetch(`/clothings/share/${clothingId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin'
        });

        const data = await response.json();
        if (data.status === 'success') {
            button.querySelector('.interaction-count').textContent = data.share_count;
        }
    } catch (err) {
        console.error(err);
    }
}

function getCookie(name) {
    const cookies = document.cookie.split(';').map(c => c.trim());
    for (let cookie of cookies) {
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.split('=')[1]);
        }
    }
    return null;
}
