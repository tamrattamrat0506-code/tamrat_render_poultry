document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initClock();
    initCurrentYear();
    initUnreadCount();
    initFormSubmissions();
    initButtonEffects();
    initLanguagePopup();
    initMobileNavigation();
});
// Clock functionality
function initClock() {
    function updateClock() {
        const clockElements = document.querySelectorAll('.live-clock');
        if (clockElements.length > 0) {
            const now = new Date();
            const options = { 
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };
            
            const formattedDateTime = now.toLocaleString('en-US', options)
                .replace(/(\d+)\/(\d+)\/(\d+),?/, '$3-$1-$2');
            
            clockElements.forEach(el => {
                el.textContent = formattedDateTime;
            });
        }
    }

    updateClock();
    setInterval(updateClock, 60000);
}

// Current year in footer
function initCurrentYear() {
    const currentYear = document.getElementById('current-year');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
}

// Unread message count
function initUnreadCount() {
    function fetchUnreadCount() {
        if (!window.UNREAD_COUNT_API_URL) return;

        fetch(window.UNREAD_COUNT_API_URL, {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                const unreadBadge = document.getElementById('navbarUnread');
                if (unreadBadge) {
                    if (data.total_unread > 0) {
                        unreadBadge.textContent = data.total_unread > 9 ? '9+' : data.total_unread;
                        unreadBadge.style.display = 'flex';
                        unreadBadge.classList.add('pulse');
                    } else {
                        unreadBadge.style.display = 'none';
                        unreadBadge.classList.remove('pulse');
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching unread count:', error);
            });
    }

    fetchUnreadCount();
    setInterval(fetchUnreadCount, 30000);
}

// Form submission handling
function initFormSubmissions() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('loading');
                
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = `
                    <span class="spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                    </span>
                    <span class="text">...</span>
                `;
                if (form.dataset.ajax === "true") {
                    e.preventDefault();
                    handleAjaxForm(form, submitBtn, originalText);
                }
            }
        });
    });
}

function handleAjaxForm(form, submitBtn, originalText) {
    const formData = new FormData(form);
    
    fetch(form.action, {
        method: form.method,
        body: formData,
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        if (data.redirect) {
            window.location.href = data.redirect;
        } else if (data.success) {
            showToast('Success!', data.message || 'Operation completed successfully', 'success');
            form.reset();
        }
    })
    .catch(error => {
        showToast('Error', error.message || 'Something went wrong', 'error');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = originalText;
    });
}

// Button effects
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(1px) scale(0.98)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'translateY(0) scale(1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Language popup
function initLanguagePopup() {
    const overlay = document.getElementById("language-overlay");

    if (!localStorage.getItem("languageSelected")) {
        setTimeout(() => {
            overlay.classList.add("active");
        }, 1000);
    }
}

function submitLanguage(selectElement) {
    localStorage.setItem("languageSelected", "true");
    document.getElementById("language-overlay").classList.remove("active");
    selectElement.form.submit();
}

function skipPopup() {
    localStorage.setItem("languageSelected", "true");
    document.getElementById("language-overlay").classList.remove("active");
}

// Mobile navigation
function initMobileNavigation() {
    const navToggle = document.getElementById('navToggle');
    const categoryNav = document.getElementById('categoryNav');
    let navOverlay = document.querySelector('.nav-overlay');
    
    // Create overlay if it doesn't exist
    if (!navOverlay) {
        navOverlay = document.createElement('div');
        navOverlay.className = 'nav-overlay';
        document.body.appendChild(navOverlay);
    }
    
    function toggleCategoryNav() {
        categoryNav.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        
        const isExpanded = categoryNav.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isExpanded);
        
        // Animate toggle icon
        if (isExpanded) {
            navToggle.querySelector('.nav-toggle-icon').innerHTML = '<i class="fas fa-times"></i>';
        } else {
            navToggle.querySelector('.nav-toggle-icon').innerHTML = '<i class="fas fa-bars"></i>';
        }
    }
    
    if (navToggle) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleCategoryNav();
        });
    }
    
    navOverlay.addEventListener('click', function() {
        categoryNav.classList.remove('active');
        this.classList.remove('active');
        document.body.classList.remove('no-scroll');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.querySelector('.nav-toggle-icon').innerHTML = '<i class="fas fa-bars"></i>';
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && categoryNav.classList.contains('active')) {
            categoryNav.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.querySelector('.nav-toggle-icon').innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    const categoryLinks = document.querySelectorAll('.category-nav-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function() {
            categoryNav.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.querySelector('.nav-toggle-icon').innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

// Toast notifications
function showToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <strong>${title}</strong>
            <button class="toast-close">&times;</button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
}

// Add pulse animation for notifications
function addPulseAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        .pulse {
            animation: pulse 1s infinite;
        }
    `;
    document.head.appendChild(style);
}

// Initialize pulse animation
addPulseAnimation();



// Search functionality
function initSearch() {
    const searchToggle = document.getElementById('searchToggle');
    const searchInput = document.querySelector('.search-input');
    const searchForm = document.querySelector('.search-bar form');
    const searchField = document.getElementById('search-input');
    
    if (searchToggle && searchInput) {
        searchToggle.addEventListener('click', function() {
            searchInput.classList.toggle('active');
            document.body.classList.toggle('search-active');
            
            const isExpanded = searchInput.classList.contains('active');
            searchToggle.setAttribute('aria-expanded', isExpanded);
            
            if (isExpanded) {
                searchField.focus();
            }
        });
        
        // Close search when clicking outside
        document.addEventListener('click', function(e) {
            if (searchInput.classList.contains('active') && 
                !searchInput.contains(e.target) && 
                !searchToggle.contains(e.target)) {
                closeSearch();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchInput.classList.contains('active')) {
                closeSearch();
            }
        });
        
        // Prevent form submission from closing search on mobile
        searchForm.addEventListener('submit', function(e) {
            if (window.innerWidth > 768) {
                closeSearch();
            }
        });
    }
    
    function closeSearch() {
        searchInput.classList.remove('active');
        document.body.classList.remove('search-active');
        searchToggle.setAttribute('aria-expanded', 'false');
    }
    
    // Auto-complete functionality (optional)
    if (searchField) {
        let timeout;
        searchField.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                const query = searchField.value.trim();
                if (query.length > 2) {
                    fetchSearchSuggestions(query);
                }
            }, 300);
        });
    }
}

function fetchSearchSuggestions(query) {
  

function showSearchSuggestions(suggestions) {
}
document.addEventListener('DOMContentLoaded', function() {
    
    initSearch(); 
});