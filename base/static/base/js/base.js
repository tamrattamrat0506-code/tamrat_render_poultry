document.addEventListener('DOMContentLoaded', function() {
    initClock();
    initCurrentYear();
    initUnreadCount();
    initFormSubmissions();
    initButtonEffects();
    initLanguagePopup();
    initMobileNavigation();
    initSearch();
    initCategoryNavDropdowns(); // Added this line
});

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

function initCurrentYear() {
    const currentYear = document.getElementById('current-year');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
}

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

function initMobileNavigation() {
    const navToggle = document.getElementById('navToggle');
    const categoryNav = document.getElementById('categoryNav');
    let navOverlay = document.querySelector('.nav-overlay');
    
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
    
    // Add close button functionality
    const navCloseBtn = document.getElementById('navCloseBtn');
    if (navCloseBtn) {
        navCloseBtn.addEventListener('click', function() {
            categoryNav.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
            
            // Also reset the nav toggle icon if it exists
            if (navToggle) {
                navToggle.setAttribute('aria-expanded', 'false');
                const icon = navToggle.querySelector('.nav-toggle-icon');
                if (icon) icon.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    navOverlay.addEventListener('click', function() {
        categoryNav.classList.remove('active');
        this.classList.remove('active');
        document.body.classList.remove('no-scroll');
        if (navToggle) {
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.querySelector('.nav-toggle-icon').innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && categoryNav.classList.contains('active')) {
            categoryNav.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
            if (navToggle) {
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.querySelector('.nav-toggle-icon').innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    });
    
    // Only close navigation for non-dropdown links
    const categoryLinks = document.querySelectorAll('.category-nav-link:not(.dropdown-toggle)');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function() {
            categoryNav.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
            if (navToggle) {
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.querySelector('.nav-toggle-icon').innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
}

function initCategoryNavDropdowns() {
    // Toggle dropdowns
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const parentItem = this.closest('.category-nav-item');
            const dropdown = this.nextElementSibling;
            
            // Close other dropdowns
            document.querySelectorAll('.category-nav-dropdown.active').forEach(openDropdown => {
                if (openDropdown !== dropdown) {
                    openDropdown.classList.remove('active');
                    openDropdown.closest('.category-nav-item').classList.remove('active');
                    openDropdown.previousElementSibling.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Toggle current dropdown
            parentItem.classList.toggle('active');
            dropdown.classList.toggle('active');
            
            // Update aria attributes
            const isExpanded = dropdown.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.category-nav-item.has-dropdown')) {
            document.querySelectorAll('.category-nav-dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
                dropdown.closest('.category-nav-item').classList.remove('active');
                dropdown.previousElementSibling.setAttribute('aria-expanded', 'false');
            });
        }
    });
    
    // Close dropdowns with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.category-nav-dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
                dropdown.closest('.category-nav-item').classList.remove('active');
                dropdown.previousElementSibling.setAttribute('aria-expanded', 'false');
            });
        }
    });
    
    // Close navigation when a non-dropdown link is clicked
    const navLinks = document.querySelectorAll('.category-nav-link:not(.dropdown-toggle)');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const categoryNav = document.getElementById('categoryNav');
            const navOverlay = document.querySelector('.nav-overlay');
            
            if (categoryNav && navOverlay) {
                categoryNav.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.classList.remove('no-scroll');
                
                // Also close any open dropdowns
                document.querySelectorAll('.category-nav-dropdown.active').forEach(dropdown => {
                    dropdown.classList.remove('active');
                    dropdown.closest('.category-nav-item').classList.remove('active');
                });
                
                // Reset nav toggle
                const navToggle = document.getElementById('navToggle');
                if (navToggle) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    const icon = navToggle.querySelector('.nav-toggle-icon');
                    if (icon) icon.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });
}

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
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
}

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

addPulseAnimation();

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
        
        document.addEventListener('click', function(e) {
            if (searchInput.classList.contains('active') && 
                !searchInput.contains(e.target) && 
                !searchToggle.contains(e.target)) {
                closeSearch();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchInput.classList.contains('active')) {
                closeSearch();
            }
        });
        
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
    console.log('Fetching suggestions for:', query);
}

function showSearchSuggestions(suggestions) {
    console.log('Showing suggestions:', suggestions);
}
