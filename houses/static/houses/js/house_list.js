// project/houses/static/houses/js/house_list.js
document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const houseCards = document.querySelectorAll('.product-card');
            
            houseCards.forEach(card => {
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                const location = card.querySelector('.card-location').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || location.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Filter functionality
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', function(e) {
            const filterValue = e.target.value.toLowerCase();
            const houseCards = document.querySelectorAll('.product-card');
            
            if (!filterValue) {
                houseCards.forEach(card => card.style.display = 'block');
                return;
            }
            
            houseCards.forEach(card => {
                const category = card.dataset.category || '';
                
                if (category.includes(filterValue)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Add data-category attribute to cards based on their category
    const houseCards = document.querySelectorAll('.product-card');
    houseCards.forEach(card => {
        const categoryElement = card.querySelector('.card-category'); // You might need to add this element
        if (categoryElement) {
            card.dataset.category = categoryElement.textContent.trim().toLowerCase();
        }
    });

    // Smooth scroll for pagination links
    document.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('href');
            
            // Smooth scroll to top before page change
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Small delay before page change
            setTimeout(() => {
                window.location.href = targetPage;
            }, 500);
        });
    });

    // REMOVED THE OLD DELETE CONFIRMATION CODE
    // We're now handling delete with AJAX in the template
});

document.addEventListener('DOMContentLoaded', function() {
    // Like button functionality
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const houseId = this.getAttribute('data-item-id');
            likeHouse(houseId, this);
        });
    });

    // Share button functionality
    document.querySelectorAll('.share-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const houseId = this.getAttribute('data-item-id');
            shareHouse(houseId, this);
        });
    });
});

async function likeHouse(houseId, button) {
    try {
        const response = await fetch(`/en/houses/house/${houseId}/like/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === 'success') {
            const countElement = button.querySelector('.interaction-count');
            countElement.textContent = data.like_count;
            button.classList.add('liked');
            // Visual feedback
            button.innerHTML = `<i class="fas fa-thumbs-up"></i> ${data.like_count}`;
            button.style.backgroundColor = '#e3f2fd';
            setTimeout(() => {
                button.style.backgroundColor = '';
            }, 500);
        }
    } catch (error) {
        console.error('Like error:', error);
        alert('Failed to like. Please try again.');
    }
}

async function shareHouse(houseId, button) {
    try {
        // First try the Web Share API
        if (navigator.share) {
            await navigator.share({
                title: 'Check out this house!',
                text: 'I found this amazing house you might like',
                url: window.location.href,
            });
            
            // Only increment share count if sharing was successful
            await sendShareRequest(houseId, button);
        } else {
            // Fallback for browsers without Web Share API
            await sendShareRequest(houseId, button);
            copyToClipboard(window.location.href);
            alert('Link copied to clipboard!');
        }
    } catch (error) {
        console.error('Share error:', error);
        if (error.name !== 'AbortError') {
            alert('Failed to share. Please try again.');
        }
    }
}

async function sendShareRequest(houseId, button) {
    try {
        const response = await fetch(`/en/houses/house/${houseId}/share/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === 'success') {
            const countElement = button.querySelector('.interaction-count');
            countElement.textContent = data.share_count;
            // Visual feedback
            button.innerHTML = `<i class="fas fa-share-alt"></i> ${data.share_count}`;
            button.style.backgroundColor = '#e8f5e9';
            setTimeout(() => {
                button.style.backgroundColor = '';
            }, 500);
        }
    } catch (error) {
        console.error('Share count error:', error);
        throw error;
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}