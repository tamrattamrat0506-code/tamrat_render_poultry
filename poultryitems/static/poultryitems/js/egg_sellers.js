// poultryitems/static/poultryitems/js/egg_sellers.js

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const orderButtons = document.querySelectorAll('.order-btn');
    const orderModal = document.getElementById('orderModal');
    const orderForm = document.getElementById('orderForm');
    const closeModal = document.querySelector('.close-modal');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    
    // Update total price when quantity changes
    quantityInputs.forEach(input => {
        input.addEventListener('input', function() {
            updateTotalPrice(this);
        });
        
        // Initial calculation
        updateTotalPrice(input);
    });
    
    // Open order modal
    orderButtons.forEach(button => {
        button.addEventListener('click', function() {
            openOrderModal(this);
        });
    });
    
    // Close modal when clicking on X
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            closeOrderModal();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === orderModal) {
            closeOrderModal();
        }
    });
    
    // Handle order form submission
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitOrderForm(this);
        });
    }
    
    // Filter form enhancement
    const filterForm = document.querySelector('.filter-form');
    if (filterForm) {
        enhanceFilterForm(filterForm);
    }
    
    // Functions
    function updateTotalPrice(inputElement) {
        const form = inputElement.closest('.order-form');
        if (!form) return;
        
        const sellerId = form.dataset.sellerId;
        const priceElement = form.querySelector('.total-price');
        if (!priceElement) return;
        
        const pricePerDozen = parseFloat(priceElement.dataset.originalPrice || priceElement.textContent);
        // Store original price if not already stored
        if (!priceElement.dataset.originalPrice) {
            priceElement.dataset.originalPrice = pricePerDozen;
        }
        
        const quantity = parseInt(inputElement.value) || 0;
        const totalPrice = quantity * pricePerDozen;
        
        priceElement.textContent = totalPrice.toFixed(2);
    }
    
    function openOrderModal(button) {
        const form = button.closest('.order-form');
        const sellerId = form.dataset.sellerId;
        const quantityInput = form.querySelector('.quantity-input');
        const quantity = quantityInput.value;
        
        // Set values in modal
        document.getElementById('modalSellerId').value = sellerId;
        document.getElementById('quantity').value = quantity;
        
        // Show modal
        orderModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    function closeOrderModal() {
        orderModal.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable scrolling
    }
    
    function submitOrderForm(form) {
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        submitBtn.classList.add('loading');
        
        // Prepare form data
        const formData = new FormData(form);
        const jsonData = Object.fromEntries(formData.entries());
        
        // Add CSRF token
        jsonData.csrfmiddlewaretoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        
        // Send request
        fetch(form.action || window.location.href, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': jsonData.csrfmiddlewaretoken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Show success message
                showNotification(data.message, 'success');
                closeOrderModal();
                form.reset();
            } else {
                // Show error message
                showNotification(data.message || 'Please check your input', 'error');
                
                // Highlight errors if provided
                if (data.errors) {
                    highlightFormErrors(form, data.errors);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('An error occurred. Please try again.', 'error');
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.classList.remove('loading');
        });
    }
    
    function showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style notification
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '6px';
        notification.style.color = 'white';
        notification.style.fontWeight = '600';
        notification.style.zIndex = '2000';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        notification.style.animation = 'slideIn 0.3s ease-out';
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(to right, #28a745, #20c997)';
        } else {
            notification.style.background = 'linear-gradient(to right, #dc3545, #c82333)';
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Add keyframes for animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    function highlightFormErrors(form, errors) {
        // Clear previous errors
        const existingErrors = form.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
        
        const existingErrorFields = form.querySelectorAll('.field-error');
        existingErrorFields.forEach(field => field.classList.remove('field-error'));
        
        // Add new errors
        for (const [fieldName, errorMessage] of Object.entries(errors)) {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.add('field-error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = errorMessage;
                errorDiv.style.color = '#dc3545';
                errorDiv.style.fontSize = '0.9rem';
                errorDiv.style.marginTop = '5px';
                
                field.parentNode.appendChild(errorDiv);
            }
        }
    }
    
    function enhanceFilterForm(form) {
        // Add date picker for any date fields
        const dateInputs = form.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            input.min = today;
        });
        
        // Add clear functionality to filter form
        const clearBtn = document.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                form.reset();
                window.location.href = this.href;
            });
        }
    }
    
    // Initialize seller cards with expandable details
    initializeSellerCards();
    
    function initializeSellerCards() {
        const sellerCards = document.querySelectorAll('.egg-seller-list li');
        
        sellerCards.forEach(card => {
            const detailsSection = card.querySelector('.dropdown');
            const header = card.querySelector('.egg-seller-header');
            
            if (header && detailsSection) {
                header.style.cursor = 'pointer';
                
                header.addEventListener('click', function() {
                    detailsSection.classList.toggle('expanded');
                    
                    // Smooth animation
                    if (detailsSection.classList.contains('expanded')) {
                        detailsSection.style.maxHeight = detailsSection.scrollHeight + 'px';
                    } else {
                        detailsSection.style.maxHeight = '0';
                    }
                });
                
                // Initially collapse details
                detailsSection.style.maxHeight = '0';
                detailsSection.style.overflow = 'hidden';
                detailsSection.style.transition = 'max-height 0.3s ease';
            }
        });
    }
    
    // Add search functionality if needed
    addSearchFunctionality();
    
    function addSearchFunctionality() {
        // You can implement a search bar that filters sellers by name
        const searchContainer = document.createElement('div');
        searchContainer.style.marginBottom = '20px';
        searchContainer.innerHTML = `
            <input type="text" id="sellerSearch" placeholder="Search egg sellers..." 
                   style="width: 100%; padding: 12px; border: 1px solid #ced4da; border-radius: 6px;">
        `;
        
        const filterSection = document.querySelector('.filter-section');
        if (filterSection) {
            filterSection.parentNode.insertBefore(searchContainer, filterSection.nextSibling);
            
            const searchInput = document.getElementById('sellerSearch');
            searchInput.addEventListener('input', function() {
                filterSellersByName(this.value.toLowerCase());
            });
        }
    }
    
    function filterSellersByName(searchTerm) {
        const sellers = document.querySelectorAll('.egg-seller-list li');
        
        sellers.forEach(seller => {
            const sellerName = seller.querySelector('.egg-seller-name').textContent.toLowerCase();
            if (sellerName.includes(searchTerm)) {
                seller.style.display = '';
            } else {
                seller.style.display = 'none';
            }
        });
    }
});





// Add to your existing JavaScript or create a new file
document.addEventListener('DOMContentLoaded', function() {
    // Egg seller delete functionality
    const eggDeleteButtons = document.querySelectorAll('.egg-seller-card .btn-delete');
    const eggDeleteModal = document.getElementById('deleteEggModal');
    const eggSellerNameSpan = document.getElementById('eggSellerName');
    const confirmEggDeleteBtn = document.getElementById('confirmEggDelete');
    const cancelEggDeleteBtn = document.getElementById('cancelEggDelete');
    const closeEggModalBtn = eggDeleteModal.querySelector('.close');
    
    let currentEggSellerId = null;
    
    // Set up delete button click handlers
    eggDeleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentEggSellerId = this.getAttribute('data-seller-id');
            const sellerName = this.getAttribute('data-seller-name');
            
            eggSellerNameSpan.textContent = sellerName;
            eggDeleteModal.style.display = 'block';
        });
    });
    
    // Confirm delete
    confirmEggDeleteBtn.addEventListener('click', function() {
        if (currentEggSellerId) {
            const csrfToken = getCookie('csrftoken');
            
            fetch(`/egg-sellers/delete-ajax/${currentEggSellerId}/`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrfToken
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove the seller item from the list
                    const sellerCard = document.querySelector(`.egg-seller-card .btn-delete[data-seller-id="${currentEggSellerId}"]`)?.closest('.egg-seller-card');
                    if (sellerCard) {
                        sellerCard.remove();
                    }
                    
                    // Show success message
                    showNotification(data.message, 'success');
                } else {
                    showNotification('Error: ' + data.error, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error deleting egg seller', 'error');
            })
            .finally(() => {
                eggDeleteModal.style.display = 'none';
                currentEggSellerId = null;
            });
        }
    });
    
    // Close modal
    function closeEggModal() {
        eggDeleteModal.style.display = 'none';
        currentEggSellerId = null;
    }
    
    cancelEggDeleteBtn.addEventListener('click', closeEggModal);
    closeEggModalBtn.addEventListener('click', closeEggModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === eggDeleteModal) {
            closeEggModal();
        }
    });
    
    // Helper function to get CSRF token
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
    
    // Helper function to show notifications
    function showNotification(message, type) {
        // Implement your notification system here
        // This could be toast notifications, alert boxes, etc.
        alert(`${type.toUpperCase()}: ${message}`);
    }
});