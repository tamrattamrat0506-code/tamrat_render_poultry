// poultryitems/static/poultryitems/js/chicken_sellers.js

document.addEventListener('DOMContentLoaded', function() {
    // Get all seller list items
    const sellerItems = document.querySelectorAll('.seller-item');
    const searchInput = document.getElementById('searchInput');
    const locationFilter = document.getElementById('locationFilter');
    const sellerList = document.getElementById('sellerList');
    
    // Check if no results message exists, if not create it
    let noResults = document.querySelector('.no-results');
    if (!noResults && sellerList) {
        noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = '<i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px;"></i><h3>No sellers found</h3><p>Try adjusting your search criteria</p>';
        sellerList.parentNode.insertBefore(noResults, sellerList.nextSibling);
    }
    
    // Add click event to each seller item
    if (sellerItems.length > 0) {
        sellerItems.forEach(item => {
            const sellerName = item.querySelector('.chicken-seller-name');
            const dropdown = item.querySelector('.dropdown');
            
            if (sellerName && dropdown) {
                sellerName.addEventListener('click', function() {
                    // Check if this dropdown is already active
                    const isActive = this.parentElement.parentElement.classList.contains('active');
                    
                    // Close all dropdowns first
                    sellerItems.forEach(otherItem => {
                        otherItem.classList.remove('active');
                        const otherDropdown = otherItem.querySelector('.dropdown');
                        if (otherDropdown) otherDropdown.classList.remove('active');
                    });
                    
                    // If it wasn't active, open it
                    if (!isActive) {
                        item.classList.add('active');
                        dropdown.classList.add('active');
                        
                        // Scroll into view if on mobile
                        if (window.innerWidth < 768) {
                            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }
                });
            }
        });
    }
    
    // Search and filter functionality if elements exist
    if (searchInput && locationFilter) {
        searchInput.addEventListener('input', filterSellers);
        locationFilter.addEventListener('change', filterSellers);
    }
    
    function filterSellers() {
        const searchTerm = searchInput.value.toLowerCase();
        const locationValue = locationFilter.value;
        let visibleCount = 0;
        
        sellerItems.forEach(item => {
            const sellerText = item.textContent.toLowerCase();
            const itemLocation = item.getAttribute('data-location');
            const matchesSearch = sellerText.includes(searchTerm);
            const matchesLocation = !locationValue || itemLocation === locationValue;
            
            if (matchesSearch && matchesLocation) {
                item.style.display = 'block';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Show/hide no results message
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }
    
    // Add animation on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.05
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Apply animation to all seller items
    sellerItems.forEach(item => {
        item.style.opacity = 0;
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease, display 0.3s ease';
        observer.observe(item);
    });
    
    // Add hover effects to social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        // Add data-platform attribute for tooltip
        if (link.classList.contains('facebook')) link.setAttribute('data-platform', 'Facebook');
        if (link.classList.contains('telegram')) link.setAttribute('data-platform', 'Telegram');
        if (link.classList.contains('email')) link.setAttribute('data-platform', 'Email');
        if (link.classList.contains('whatsapp')) link.setAttribute('data-platform', 'WhatsApp');
        if (link.classList.contains('instagram')) link.setAttribute('data-platform', 'Instagram');
        if (link.classList.contains('youtube')) link.setAttribute('data-platform', 'YouTube');
        
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.1)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.seller-item')) {
            sellerItems.forEach(item => {
                item.classList.remove('active');
                const dropdown = item.querySelector('.dropdown');
                if (dropdown) dropdown.classList.remove('active');
            });
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            sellerItems.forEach(item => {
                item.classList.remove('active');
                const dropdown = item.querySelector('.dropdown');
                if (dropdown) dropdown.classList.remove('active');
            });
        }
    });
});
// Add this to your existing chicken_sellers.js

document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Delete functionality
    const deleteButtons = document.querySelectorAll('.btn-delete');
    const deleteModal = document.getElementById('deleteModal');
    const sellerNameSpan = document.getElementById('sellerName');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const closeModalBtn = document.querySelector('.close');
    
    let currentSellerId = null;
    
    // Set up delete button click handlers
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentSellerId = this.getAttribute('data-seller-id');
            const sellerName = this.getAttribute('data-seller-name');
            
            sellerNameSpan.textContent = sellerName;
            deleteModal.style.display = 'block';
        });
    });
    
    // Confirm delete
    confirmDeleteBtn.addEventListener('click', function() {
        if (currentSellerId) {
            // Send AJAX request to delete the seller
            const csrfToken = getCookie('csrftoken');
            
            fetch(`/delete-seller-ajax/${currentSellerId}/`, {
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
                    const sellerItem = document.querySelector(`.seller-item[data-seller-id="${currentSellerId}"]`);
                    if (sellerItem) {
                        sellerItem.remove();
                    }
                    
                    // Show success message (you might want to implement a toast notification)
                    alert('Seller deleted successfully!');
                } else {
                    alert('Error deleting seller: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting seller');
            })
            .finally(() => {
                deleteModal.style.display = 'none';
                currentSellerId = null;
            });
        }
    });
    
    // Close modal
    function closeModal() {
        deleteModal.style.display = 'none';
        currentSellerId = null;
    }
    
    cancelDeleteBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === deleteModal) {
            closeModal();
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
    
    // ... rest of your existing code ...
});