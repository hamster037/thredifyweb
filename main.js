document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SET ACTIVE NAVIGATION LINK ---
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a, .nav-mobile-overlay a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if ((currentPath.endsWith(linkPath) && linkPath !== 'index.html') || 
            (linkPath === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('index.html')))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- 2. HEADER SCROLL EFFECT ---
    const header = document.querySelector('header');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // --- 3. MOBILE MENU TOGGLE ---
    const navToggle = document.querySelector('.nav-toggle');
    const mobileOverlay = document.querySelector('.nav-mobile-overlay');
    
    if (navToggle && mobileOverlay) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            
            if (mobileOverlay.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        mobileOverlay.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- 4. NEWSLETTER SIGNUP VALIDATION ---
    const newsletterForms = document.querySelectorAll('.newsletter-form, .newsletter-section-form');
    newsletterForms.forEach(form => {
        const input = form.querySelector('input[type="email"]');
        const feedback = form.nextElementSibling || form.parentElement.querySelector('.newsletter-feedback');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailValue = input.value.trim();
            
            if (!emailValue || !validateEmail(emailValue)) {
                showFeedback(feedback, 'Please enter a valid email address.', 'error');
                return;
            }

            showFeedback(feedback, 'Subscribing...', 'info');
            setTimeout(() => {
                showFeedback(feedback, 'Thank you! You are now subscribed.', 'success');
                input.value = '';
            }, 1000);
        });
    });

    // --- 5. PRODUCTS FILTERING & SORTING (TOP BAR & CATEGORY BAR) ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productGridList = document.getElementById('productGridList');
    let productCards = document.querySelectorAll('.product-card');

    const selectCategory = document.getElementById('filter-category');
    const selectPrice = document.getElementById('filter-price');
    const selectSize = document.getElementById('filter-size');
    const selectColor = document.getElementById('filter-color');
    const selectSort = document.getElementById('sort-products');

    function applyAllFilters() {
        const catVal = selectCategory ? selectCategory.value : 'all';
        const priceVal = selectPrice ? selectPrice.value : 'all';
        const sizeVal = selectSize ? selectSize.value : 'all';
        const colorVal = selectColor ? selectColor.value : 'all';

        productCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const price = parseFloat(card.getAttribute('data-price') || '0');
            const sizes = (card.getAttribute('data-sizes') || '').split(',');
            const colors = (card.getAttribute('data-colors') || '').split(',');

            let matchesCat = catVal === 'all' || category === catVal;
            let matchesPrice = true;
            if (priceVal === 'under-150') matchesPrice = price < 150;
            else if (priceVal === '150-250') matchesPrice = price >= 150 && price <= 250;
            else if (priceVal === 'over-250') matchesPrice = price > 250;

            let matchesSize = sizeVal === 'all' || sizes.includes(sizeVal);
            let matchesColor = colorVal === 'all' || colors.includes(colorVal);

            // Also check if card is hidden by Load More paging rules
            const isPagedHidden = card.classList.contains('paged-hidden');

            if (matchesCat && matchesPrice && matchesSize && matchesColor) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    // Connect top bar filters
    if (selectCategory) selectCategory.addEventListener('change', applyAllFilters);
    if (selectPrice) selectPrice.addEventListener('change', applyAllFilters);
    if (selectSize) selectSize.addEventListener('change', applyAllFilters);
    if (selectColor) selectColor.addEventListener('change', applyAllFilters);

    // Connect category buttons if present
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');
                if (selectCategory) {
                    selectCategory.value = filterValue;
                }
                applyAllFilters();
            });
        });
    }

    // Connect sorting
    if (selectSort) {
        selectSort.addEventListener('change', () => {
            const sortVal = selectSort.value;
            const cardArray = Array.from(productCards);

            if (sortVal === 'price-low') {
                cardArray.sort((a, b) => parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price')));
            } else if (sortVal === 'price-high') {
                cardArray.sort((a, b) => parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price')));
            } else {
                // Default sorting - by name
                cardArray.sort((a, b) => {
                    const titleA = a.querySelector('.product-title').textContent.trim();
                    const titleB = b.querySelector('.product-title').textContent.trim();
                    return titleA.localeCompare(titleB);
                });
            }

            // Re-append in sorted order
            cardArray.forEach(card => productGridList.appendChild(card));
        });
    }

    // --- 6. FAQ ACCORDION ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const answer = item.querySelector('.faq-answer');
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(faqItem => {
                faqItem.classList.remove('active');
                faqItem.querySelector('.faq-answer').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // --- 7. CONTACT FORM VALIDATION ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const feedback = contactForm.querySelector('.form-feedback');
        
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject') ? document.getElementById('subject').value.trim() : '';
            const message = document.getElementById('message').value.trim();
            
            if (!name || !email || !subject || !message) {
                showFeedback(feedback, 'All fields are required.', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showFeedback(feedback, 'Please enter a valid email address.', 'error');
                return;
            }
            
            showFeedback(feedback, 'Sending message...', 'info');
            setTimeout(() => {
                showFeedback(feedback, 'Message sent successfully! We will get back to you soon.', 'success');
                contactForm.reset();
            }, 1200);
        });
    }

    // --- 8. HERO CAROUSEL INTERACTION ---
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const nextSlide = () => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        };
        setInterval(nextSlide, 5000);
    }

    // --- 9. SCROLL REVEAL OBSERVER ---
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const observerOptions = {
            root: null,
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('visible'));
    }

    // --- 10. QUICK ADD TO CART HANDLER ---
    const quickAddBtns = document.querySelectorAll('.add-to-cart-quick');
    quickAddBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.product-card');
            const title = card.querySelector('.product-title').textContent;
            showToast(`Added ${title} to cart`);
        });
    });

    // --- 11. PRODUCT DETAIL MODAL ---
    const modalOverlay = document.getElementById('productDetailModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    
    // Elements in Modal to update
    const modalImg = document.getElementById('modalProductImg');
    const modalTag = document.getElementById('modalProductTag');
    const modalTitle = document.getElementById('modalProductTitle');
    const modalPrice = document.getElementById('modalProductPrice');
    const modalDesc = document.getElementById('modalProductDesc');
    const modalSwatchesContainer = document.getElementById('modalSwatches');
    const modalSizesContainer = document.getElementById('modalSizes');
    const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');

    let selectedSize = '';
    let selectedColor = '';

    function openProductModal(card) {
        if (!modalOverlay) return;

        // Retrieve product values
        const title = card.querySelector('.product-title').textContent;
        const category = card.getAttribute('data-category');
        const price = card.querySelector('.product-price').textContent;
        const mainImgSrc = card.querySelector('.product-img-main').src;
        const description = card.getAttribute('data-description') || 'Meticulously tailored garment constructed using eco-certified materials. Features clean seams, modular draping layouts, and a comfortable, relaxed fit designed for long-lasting versatility.';
        const sizes = (card.getAttribute('data-sizes') || 's,m,l').split(',');
        const colors = (card.getAttribute('data-colors') || 'charcoal,cream').split(',');

        // Set info
        modalImg.src = mainImgSrc;
        modalImg.alt = title;
        modalTag.textContent = category;
        modalTitle.textContent = title;
        modalPrice.textContent = price;
        modalDesc.textContent = description;

        // Reset selections
        selectedSize = '';
        selectedColor = '';

        // Render color swatches
        modalSwatchesContainer.innerHTML = '';
        colors.forEach((color, idx) => {
            const btn = document.createElement('button');
            btn.className = `swatch-btn ${idx === 0 ? 'active' : ''}`;
            btn.setAttribute('aria-label', `Select color ${color}`);
            
            // Map color name to actual hex codes
            let hex = '#c66248';
            if (color === 'cream') hex = '#f7f5f0';
            else if (color === 'charcoal') hex = '#1e1e1e';
            else if (color === 'beige') hex = '#d2b48c';
            else if (color === 'sage') hex = '#8e9a86';
            else if (color === 'navy') hex = '#1b263b';
            
            btn.style.backgroundColor = hex;
            if (idx === 0) selectedColor = color;

            btn.addEventListener('click', () => {
                modalSwatchesContainer.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedColor = color;
            });
            modalSwatchesContainer.appendChild(btn);
        });

        // Render size selectors
        modalSizesContainer.innerHTML = '';
        sizes.forEach((size, idx) => {
            const btn = document.createElement('button');
            btn.className = `size-btn ${idx === 0 ? 'active' : ''}`;
            btn.textContent = size.toUpperCase();
            if (idx === 0) selectedSize = size;

            btn.addEventListener('click', () => {
                modalSizesContainer.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedSize = size;
            });
            modalSizesContainer.appendChild(btn);
        });

        // Configure Add to Cart inside modal
        modalAddToCartBtn.onclick = () => {
            showToast(`Added ${selectedSize.toUpperCase()} ${title} (${selectedColor}) to cart`);
            closeProductModal();
        };

        // Open modal overlay
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeProductModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Connect clicks on product card (excluding quick add button)
    productCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // If click is on Quick Add to Cart, skip opening modal
            if (e.target.classList.contains('add-to-cart-quick')) return;
            openProductModal(card);
        });

        // Add a Quick View button programmatically if on catalog page
        const imgWrapper = card.querySelector('.product-img-wrapper');
        if (imgWrapper && !imgWrapper.querySelector('.quick-view-btn') && currentPath.includes('products.html')) {
            const quickBtn = document.createElement('button');
            quickBtn.className = 'quick-view-btn';
            quickBtn.textContent = 'Quick View';
            quickBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openProductModal(card);
            });
            imgWrapper.appendChild(quickBtn);
        }
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProductModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeProductModal();
        });
    }

    // --- 12. LOAD MORE PRODUCTS PAGINATION ---
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const pagedHiddenCards = document.querySelectorAll('.product-card.paged-hidden');
    
    if (loadMoreBtn && pagedHiddenCards.length > 0) {
        loadMoreBtn.addEventListener('click', () => {
            loadMoreBtn.textContent = 'Loading...';
            loadMoreBtn.disabled = true;

            setTimeout(() => {
                pagedHiddenCards.forEach(card => {
                    card.classList.remove('paged-hidden');
                });
                applyAllFilters(); // Re-apply current active filters
                loadMoreBtn.parentElement.style.display = 'none'; // Hide button after loading all
                showToast('All items loaded successfully.');
            }, 1200);
        });
    }

    // Toast utility
    function showToast(message) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.position = 'fixed';
            container.style.bottom = '2rem';
            container.style.right = '2rem';
            container.style.zIndex = '9999';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '0.5rem';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.backgroundColor = '#121212';
        toast.style.color = '#ffffff';
        toast.style.padding = '1rem 1.5rem';
        toast.style.fontFamily = 'var(--font-heading)';
        toast.style.fontSize = '0.85rem';
        toast.style.fontWeight = '600';
        toast.style.textTransform = 'uppercase';
        toast.style.letterSpacing = '0.05em';
        toast.style.borderLeft = '3px solid var(--accent)';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        
        container.appendChild(toast);
        toast.offsetHeight; // trigger reflow
        
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // --- UTILITIES ---
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showFeedback(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = 'newsletter-feedback'; 
        if (element.classList.contains('form-feedback')) {
            element.className = 'form-feedback';
        }
        element.classList.add(type);
    }
});
