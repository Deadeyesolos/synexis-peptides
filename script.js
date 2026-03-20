// Initialize tracking DataLayer
window.dataLayer = window.dataLayer || [];

document.addEventListener('DOMContentLoaded', () => {

    // ── Mobile Menu ──────────────────────────────────────
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileBtn && mobileNav) {
        mobileBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            const isOpen = mobileNav.classList.contains('active');
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-times', isOpen);
        });

        // Close mobile nav when clicking a link
        mobileNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            });
        });
    }

    // ── Navbar Scroll ────────────────────────────────────
    const navbar = document.getElementById('mainNav') || document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    // ── Smooth Scroll ────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length < 2) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── FAQ Accordion ────────────────────────────────────
    document.querySelectorAll('.faq-item').forEach(item => {
        const btn = item.querySelector('.faq-question');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Close all open items
            document.querySelectorAll('.faq-item.active').forEach(open => {
                open.classList.remove('active');
            });
            // Toggle clicked
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ── Product Filters ──────────────────────────────────
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card-link');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            applyFilter(filter);
        });
    });

    function applyFilter(filter) {
        productCards.forEach(card => {
            const tags = (card.getAttribute('data-tags') || '').split(' ');
            if (filter === 'all' || tags.includes(filter)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // ── Robust Cart Logic ────────────────────────────────────
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    const closeCartBtn = document.getElementById('closeCart');
    const cartCountEls = document.querySelectorAll('.cart-count');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const shippingBar = document.getElementById('shippingBar');
    const shippingText = document.getElementById('shippingText');

    let cart = JSON.parse(localStorage.getItem('synexis_cart_data')) || [];
    if (!Array.isArray(cart)) cart = [];

    function saveCart() {
        localStorage.setItem('synexis_cart_data', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        if (!cartItemsContainer) return; // Cart UI not on page yet
        
        let totalCount = 0;
        let subtotal = 0;
        
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty.</div>';
        } else {
            cart.forEach((item, index) => {
                totalCount += item.qty;
                subtotal += (item.price * item.qty);
                
                // Format path cleanly depending on current location
                let imgPath = item.image;
                const inProductsFolder = window.location.pathname.includes('/products/') || window.location.href.includes('/products/');
                if(inProductsFolder && !imgPath.startsWith('../')) {
                    imgPath = '../' + imgPath;
                } else if (!inProductsFolder && imgPath.startsWith('../')) {
                    imgPath = imgPath.replace('../', '');
                }

                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${imgPath}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)} AUD</div>
                        <div class="cart-item-actions">
                            <div class="cart-qty-ctrl">
                                <button class="cart-qty-btn decrease" data-index="${index}">−</button>
                                <input type="number" class="cart-qty-input" value="${item.qty}" readonly>
                                <button class="cart-qty-btn increase" data-index="${index}">+</button>
                            </div>
                            <button class="cart-remove" data-index="${index}">Remove</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        cartCountEls.forEach(el => el.textContent = totalCount);
        if(cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)} AUD`;

        // Shipping Progress
        if(shippingBar && shippingText) {
            const threshold = 200;
            if (subtotal >= threshold) {
                shippingText.textContent = "You unlocked FREE EXPRESS SHIPPING";
                shippingBar.style.width = '100%';
                shippingBar.classList.add('success');
            } else {
                const remaining = threshold - subtotal;
                shippingText.textContent = `You're $${remaining.toFixed(2)} away from FREE EXPRESS SHIPPING`;
                shippingBar.style.width = `${(subtotal / threshold) * 100}%`;
                shippingBar.classList.remove('success');
            }
        }

        bindCartEvents();
    }

    function bindCartEvents() {
        document.querySelectorAll('.cart-qty-btn.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                cart[idx].qty++;
                saveCart();
            });
        });
        document.querySelectorAll('.cart-qty-btn.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                if (cart[idx].qty > 1) {
                    cart[idx].qty--;
                } else {
                    cart.splice(idx, 1);
                }
                saveCart();
            });
        });
        document.querySelectorAll('.cart-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                cart.splice(idx, 1);
                saveCart();
            });
        });
    }

    window.openCart = function() {
        if(cartOverlay && cartDrawer) {
            cartOverlay.classList.add('show');
            cartDrawer.classList.add('open');
            document.body.style.overflow = 'hidden';
            updateCartUI();
        } else {
            // Fallback if cart HTML is not injected on this page yet
            window.location.href = window.location.pathname.includes('/products/') ? '../index.html#cart' : 'index.html#cart';
        }
    };

    window.closeCart = function() {
        if(cartOverlay && cartDrawer) {
            cartOverlay.classList.remove('show');
            cartDrawer.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    if (closeCartBtn) closeCartBtn.addEventListener('click', window.closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', window.closeCart);
    
    document.querySelectorAll('.cart-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            window.openCart();
        });
    });

    // Global Add To Cart (for product pages to call)
    window.addToCartGlobal = function(name, priceStr, image, qty = 1) {
        let cleanPrice = priceStr.toString().replace(/[^0-9.]/g, '');
        let priceNum = parseFloat(cleanPrice) || 0;
        
        let imgPath = image || 'Photos/logo.png';
        
        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.qty += parseInt(qty);
        } else {
            cart.push({ name, price: priceNum, image: imgPath, qty: parseInt(qty) });
        }
        saveCart();
        window.openCart();
    };

    // Global Add Bundle To Cart
    window.addBundleToCart = function(items) {
        items.forEach(item => {
            let cleanPrice = item.price.toString().replace(/[^0-9.]/g, '');
            let priceNum = parseFloat(cleanPrice) || 0;
            let imgPath = item.image || 'Photos/logo.png';
            
            const existing = cart.find(i => i.name === item.name);
            if (existing) {
                existing.qty += parseInt(item.qty || 1);
            } else {
                cart.push({ name: item.name, price: priceNum, image: imgPath, qty: parseInt(item.qty || 1) });
            }
        });
        saveCart();
        window.openCart();
    };

    // Initialize UI on load
    updateCartUI();
    
    // Update initial count even if cart UI is missing
    if (!cartItemsContainer) {
        let total = 0;
        cart.forEach(i => total += i.qty);
        cartCountEls.forEach(el => el.textContent = total);
    }

    // ── Product Page Tabs ────────────────────────────────
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const tab = document.getElementById(btn.dataset.tab);
            if (tab) tab.classList.add('active');
        });
    });

    // ── Sticky Mobile ATC Bar ────────────────────────────
    const stickyBar = document.querySelector('.sticky-atc-bar');
    const detailActions = document.querySelector('.detail-actions');
    if (stickyBar && detailActions) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                stickyBar.classList.toggle('visible', !e.isIntersecting);
            });
        }, { threshold: 0 });
        obs.observe(detailActions);

        const stickyBtn = stickyBar.querySelector('.sticky-atc-btn');
        if (stickyBtn) {
            stickyBtn.addEventListener('click', () => {
                cartCount++;
                localStorage.setItem('synexis_cart', cartCount);
                if (cartCountEl) cartCountEl.textContent = cartCount;
                showToast('Added to cart!');
                
                window.dataLayer.push({
                    event: 'add_to_cart',
                    ecommerce: {
                        items: [{ item_name: document.getElementById('selectedPrice')?.textContent || 'Variant Product' }]
                    }
                });
            });
        }
    }

    // Open FAQ FAQ on product pages
    document.querySelectorAll('.product-faq .faq-item').forEach(item => {
        const btn = item.querySelector('.faq-question');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.product-faq .faq-item.active').forEach(open => {
                open.classList.remove('active');
            });
            if (!isActive) item.classList.add('active');
        });
    });

});

// ── Global Helpers (used inline in HTML) ─────────────────

function toggleNotify(btn) {
    const inlineForm = btn.closest('.product-info, .product-detail-content')
        ?.querySelector('.notify-inline, .notify-inline-section');
    if (inlineForm) {
        inlineForm.classList.toggle('visible');
        if (inlineForm.classList.contains('visible')) {
            inlineForm.querySelector('input')?.focus();
        }
    }
}

function submitNotify(btn) {
    const input = btn.closest('.notify-inline, .notify-inline-section')?.querySelector('input');
    if (!input || !input.value.trim()) return;
    showToast('✓ You\'ll be notified when this restocks!');
    input.value = '';
    const inlineForm = btn.closest('.notify-inline, .notify-inline-section');
    if (inlineForm) inlineForm.classList.remove('visible');
}

function filterProducts(tag) {
    document.querySelectorAll('.product-card-link').forEach(card => {
        const tags = (card.getAttribute('data-tags') || '').split(' ');
        card.style.display = tags.includes(tag) ? '' : 'none';
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === tag);
    });
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleEmailSubmit(e, source = 'Footer') {
    e.preventDefault();
    const input = e.target.querySelector('input[type="email"]');
    if (!input || !input.value.trim()) return;
    
    // Save to localStorage
    let emails = JSON.parse(localStorage.getItem('synexis_emails') || '[]');
    emails.push({ email: input.value, source: source, date: new Date().toISOString() });
    localStorage.setItem('synexis_emails', JSON.stringify(emails));

    showToast('✓ Subscribed! You will be notified of restocks & drops.');
    input.value = '';

    if (source === 'Exit Intent Popup') {
        closeExitPopup();
        localStorage.setItem('synexis_exit_popup_seen', 'true');
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Exit Intent Popup ──────────────────────────────────────────
const exitPopup = document.getElementById('exitPopup');
const exitPopupOverlay = document.getElementById('exitPopupOverlay');
let popupShown = localStorage.getItem('synexis_exit_popup_seen') === 'true';

if (exitPopup && exitPopupOverlay && !popupShown) {
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 0 && !popupShown) {
            exitPopup.classList.add('visible');
            exitPopupOverlay.classList.add('visible');
            popupShown = true;
            localStorage.setItem('synexis_exit_popup_seen', 'true');
        }
    });

    // Also show after 60 seconds if not triggered by exit
    setTimeout(() => {
        if (!popupShown) {
            exitPopup.classList.add('visible');
            exitPopupOverlay.classList.add('visible');
            popupShown = true;
            localStorage.setItem('synexis_exit_popup_seen', 'true');
        }
    }, 60000);
}

function closeExitPopup() {
    if (exitPopup) exitPopup.classList.remove('visible');
    if (exitPopupOverlay) exitPopupOverlay.classList.remove('visible');
}
