document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // Hero Slider Functionality
    // =============================================
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');
    let currentSlide = 0;
    const slideCount = slides.length;
    let slideInterval;

    // Initialize slider
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            const content = slide.querySelector('.slide-content');
            if (content) {
                content.style.animation = 'none';
            }
        });
        
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        setTimeout(() => {
            const content = slides[index].querySelector('.slide-content');
            if (content) {
                content.style.animation = 'fadeInUp 1s ease';
            }
        }, 10);
        
        dots[index].classList.add('active');
        currentSlide = index;
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideCount;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        showSlide(currentSlide);
    }
    
    function startSlider() {
        slideInterval = setInterval(nextSlide, 4500);
    }
    
    function pauseSlider() {
        clearInterval(slideInterval);
    }
    
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', pauseSlider);
        sliderContainer.addEventListener('mouseleave', startSlider);
        sliderContainer.addEventListener('focusin', pauseSlider);
        sliderContainer.addEventListener('focusout', startSlider);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            pauseSlider();
            nextSlide();
            startSlider();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            pauseSlider();
            prevSlide();
            startSlider();
        });
    }
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            pauseSlider();
            showSlide(index);
            startSlider();
        });
    });
    
    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            pauseSlider();
        }, {passive: true});
        
        sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startSlider();
        }, {passive: true});
    }
    
    function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            nextSlide();
        } else if (touchEndX > touchStartX + threshold) {
            prevSlide();
        }
    }

    // =============================================
    // Featured Products Functionality
    // =============================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const productsContainer = document.querySelector('.products-container');

    function renderProducts(category = 'all') {
        if (!productsContainer || !window.productsData) {
            console.error('Products container or data not found');
            return;
        }
        
        productsContainer.innerHTML = '';
        
        let filteredProducts = [];
        
        if (category === 'all') {
            // Combine all products from all categories
            for (const cat in productsData) {
                if (productsData[cat] && productsData[cat].length > 0) {
                    filteredProducts = filteredProducts.concat(productsData[cat]);
                }
            }
        } else if (productsData[category]) {
            filteredProducts = productsData[category];
        }
        
        if (filteredProducts.length === 0) {
            productsContainer.innerHTML = `
                <div class="no-products-message">
                    <i class="fas fa-box-open"></i>
                    <p>{% trans "No products found in this category" %}</p>
                </div>
            `;
            return;
        }
        
        filteredProducts.forEach(product => {
            const productCard = document.createElement('a');
            productCard.className = 'product-card';
            productCard.href = product.url;
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                    <div class="product-overlay"></div>
                </div>
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <p class="price">${product.price}</p>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });
    }

    // Initialize tab functionality
    if (tabButtons && tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                renderProducts(this.dataset.category);
            });
        });
    }

    // =============================================
    // General Button Handlers
    // =============================================
    document.querySelectorAll('a.btn-primary').forEach(btn => {
        if (btn.getAttribute('href') === '#') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Button clicked:', btn.textContent.trim());
            });
        }
    });

    // =============================================
    // Initialize Everything
    // =============================================
    showSlide(0);
    startSlider();
    renderProducts();

    // Responsive adjustments
    function handleResize() {
        // Adjust slider height if needed
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            heroSlider.style.height = `${window.innerWidth > 768 ? '70vh' : '50vh'}`;
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize();
});






