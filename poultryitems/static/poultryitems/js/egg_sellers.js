document.addEventListener('DOMContentLoaded', function() {
    const orderButtons = document.querySelectorAll('.order-btn');
    const orderModal = document.getElementById('orderModal');
    const orderForm = document.getElementById('orderForm');
    const closeModal = document.querySelector('.close-modal');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    
    // Delete modal elements
    const eggDeleteButtons = document.querySelectorAll('.btn-delete');
    const eggDeleteModal = document.getElementById('deleteEggModal');
    const eggSellerNameSpan = document.getElementById('eggSellerName');
    const confirmEggDeleteBtn = document.getElementById('confirmEggDelete');
    const cancelEggDeleteBtn = document.getElementById('cancelEggDelete');
    const closeEggModalBtn = eggDeleteModal.querySelector('.close');
    
    let currentEggSellerId = null;
    
    // Initialize quantity inputs
    quantityInputs.forEach(input => {
        input.addEventListener('input', function() {
            updateTotalPrice(this);
        });
        
        updateTotalPrice(input);
    });
    
    // Order button handlers
    orderButtons.forEach(button => {
        button.addEventListener('click', function() {
            openOrderModal(this);
        });
    });
    
    // Modal close handlers
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            closeOrderModal();
        });
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === orderModal) {
            closeOrderModal();
        }
        if (event.target === eggDeleteModal) {
            closeEggModal();
        }
    });
    
    // Form submission handlers
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
    
    // Delete button handlers
    eggDeleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentEggSellerId = this.getAttribute('data-seller-id');
            const sellerName = this.getAttribute('data-seller-name');
            
            eggSellerNameSpan.textContent = sellerName;
            eggDeleteModal.style.display = 'block';
        });
    });
    
    // Delete modal handlers
    confirmEggDeleteBtn.addEventListener('click', function() {
        if (currentEggSellerId) {
            deleteEggSeller(currentEggSellerId);
        }
    });
    
    cancelEggDeleteBtn.addEventListener('click', closeEggModal);
    closeEggModalBtn.addEventListener('click', closeEggModal);
    
    // Initialize seller cards
    initializeSellerCards();
    
    // Add search functionality
    addSearchFunctionality();
    
    // Functions
    function updateTotalPrice(inputElement) {
        const form = inputElement.closest('.order-form');
        if (!form) return;
        
        const priceElement = form.querySelector('.total-price');
        if (!priceElement) return;
        
        const pricePerDozen = parseFloat(priceElement.dataset.originalPrice);
        const quantity = parseInt(inputElement.value) || 0;
        const totalPrice = quantity * pricePerDozen;
        
        priceElement.textContent = totalPrice.toFixed(2);
    }
    
    function openOrderModal(button) {
        const form = button.closest('.order-form');
        const sellerId = form.dataset.sellerId;
        const quantityInput = form.querySelector('.quantity-input');
        const quantity = quantityInput.value;
        
        document.getElementById('modalSellerId').value = sellerId;
        document.getElementById('quantity').value = quantity;
        
        orderModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; 
    }
    
    function closeOrderModal() {
        orderModal.style.display = 'none';
        document.body.style.overflow = ''; 
    }
    
    function closeEggModal() {
        eggDeleteModal.style.display = 'none';
        currentEggSellerId = null;
    }
    
    function submitOrderForm(form) {
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        submitBtn.classList.add('loading');
        
        const formData = new FormData(form);
        const jsonData = Object.fromEntries(formData.entries());
        
        fetch(form.action, {
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
                showNotification(data.message, 'success');
                closeOrderModal();
                form.reset();
            } else {
                showNotification(data.message || 'Please check your input', 'error');
                
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
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.classList.remove('loading');
        });
    }
    
    function deleteEggSeller(sellerId) {
        const csrfToken = getCookie('csrftoken');
        
        fetch(`/egg-sellers/delete-ajax/${sellerId}/`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const sellerCard = document.querySelector(`.btn-delete[data-seller-id="${sellerId}"]`)?.closest('.egg-seller-card');
                if (sellerCard) {
                    sellerCard.remove();
                }
                
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
            closeEggModal();
        });
    }
    
    function showNotification(message, type) {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
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
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
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
        const existingErrors = form.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
        
        const existingErrorFields = form.querySelectorAll('.field-error');
        existingErrorFields.forEach(field => field.classList.remove('field-error'));
        
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
        const dateInputs = form.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            const today = new Date().toISOString().split('T')[0];
            input.min = today;
        });
        
        const clearBtn = document.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                form.reset();
                window.location.href = this.href;
            });
        }
    }
    
    function initializeFilterToggle() {
        const toggleBtn = document.querySelector('.filter-toggle-btn');
        const filterCollapsible = document.querySelector('.filter-collapsible');
        
        if (toggleBtn && filterCollapsible) {
            toggleBtn.addEventListener('click', function() {
                filterCollapsible.classList.toggle('expanded');
            });
        }
    }
    initializeFilterToggle();

    function initializeSellerCards() {
        const sellerCards = document.querySelectorAll('.egg-seller-card');
        
        sellerCards.forEach(card => {
            const detailsSection = card.querySelector('.dropdown');
            const header = card.querySelector('.egg-seller-header');
            
            if (header && detailsSection) {
                header.style.cursor = 'pointer';
                
                header.addEventListener('click', function() {
                    detailsSection.classList.toggle('expanded');
                    
                    if (detailsSection.classList.contains('expanded')) {
                        detailsSection.style.maxHeight = detailsSection.scrollHeight + 'px';
                    } else {
                        detailsSection.style.maxHeight = '0';
                    }
                });
                
                detailsSection.style.maxHeight = '0';
                detailsSection.style.overflow = 'hidden';
                detailsSection.style.transition = 'max-height 0.3s ease';
            }
        });
    }
    
    function addSearchFunctionality() {
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
        const sellers = document.querySelectorAll('.egg-seller-card');
        
        sellers.forEach(seller => {
            const sellerName = seller.querySelector('.egg-seller-name').textContent.toLowerCase();
            if (sellerName.includes(searchTerm)) {
                seller.style.display = '';
            } else {
                seller.style.display = 'none';
            }
        });
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
});