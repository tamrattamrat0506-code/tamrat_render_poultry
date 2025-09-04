document.addEventListener('DOMContentLoaded', function() {
    // Initialize lightbox if available
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
            'resizeDuration': 200,
            'wrapAround': true,
            'albumLabel': 'Image %1 of %2',
            'fadeDuration': 300,
            'imageFadeDuration': 300
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize interaction buttons
    const initInteractionButtons = () => {
        // Like button handler
        document.querySelectorAll('[data-action="like"]').forEach(button => {
            button.addEventListener('click', handleLike);
        });

        // Share button handler
        document.querySelectorAll('[data-action="share"]').forEach(button => {
            button.addEventListener('click', handleShare);
        });

        // Add to cart handler
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', handleAddToCart);
        }
    };

    // Handle like action
    const handleLike = async (event) => {
        const button = event.currentTarget;
        const itemId = button.dataset.itemId;
        const icon = button.querySelector('i');
        const countElement = button.querySelector('.interaction-count');

        // Visual feedback
        button.classList.add('active');
        
        try {
            const response = await fetch(`/items/${itemId}/like/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                countElement.textContent = data.likes_count;
                showToast('Item liked successfully!');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setTimeout(() => {
                button.classList.remove('active');
            }, 500);
        }
    };

    // Handle share action
    const handleShare = async (event) => {
        const button = event.currentTarget;
        const itemId = button.dataset.itemId;
        const icon = button.querySelector('i');
        const countElement = button.querySelector('.interaction-count');
        const itemTitle = document.querySelector('.product-title').textContent;
        const itemUrl = window.location.href;

        // Visual feedback
        button.classList.add('active');

        try {
            if (navigator.share) {
                await navigator.share({
                    title: itemTitle,
                    text: 'Check out this item',
                    url: itemUrl
                });
                showToast('Item shared successfully!');
            } else {
                // Fallback for browsers without Web Share API
                await navigator.clipboard.writeText(itemUrl);
                showToast('Link copied to clipboard!');
            }

            // Record the share
            const response = await fetch(`/items/${itemId}/share/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                countElement.textContent = data.shares_count;
            }
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setTimeout(() => {
                button.classList.remove('active');
            }, 500);
        }
    };

    // Handle add to cart
    const handleAddToCart = async (event) => {
        const button = event.currentTarget;
        const url = button.dataset.addUrl;

        button.disabled = true;
        button.classList.add('active');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                const data = await response.json();
                const cartCountElement = document.getElementById('cart-count');
                
                if (cartCountElement) {
                    cartCountElement.textContent = data.cart_count;
                }
                
                showToast('Item added to cart!');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Failed to add item to cart', 'error');
        } finally {
            setTimeout(() => {
                button.disabled = false;
                button.classList.remove('active');
            }, 500);
        }
    };

    // Show toast notification for add to cart
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        toast.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    };

    // Get CSRF token
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    // Initialize all functionality
    initInteractionButtons();

    // Add toast styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .toast-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 4px;
            background-color: #333;
            color: white;
            transform: translateY(100%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            z-index: 1000;
        }
        
        .toast-notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .toast-notification.success {
            background: linear-gradient(to right, rgb(39, 64, 174) , rgb(39, 142, 174),rgb(39, 64, 174));
        }
        
        .toast-notification.error {
            background-color: #e74c3c;
        }
    `;
    document.head.appendChild(style);
});