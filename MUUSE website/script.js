document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navigation Bar on Scroll
    const navbar = document.querySelector('.navbar') || document.getElementById('navbar');
    
    let lastScrollY = window.scrollY;

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

        // 2. Intersection Observer for Scroll Animations
        // Setup observer options
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15 // Trigger when 15% of the element is visible
        };
    
        // Callback for observer
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add the 'visible' class to trigger CSS animation
                    entry.target.classList.add('visible');
                    // Optional: Stop observing once animated
                    observer.unobserve(entry.target);
                }
            });
        };
    
        // Initialize observer
        const animationObserver = new IntersectionObserver(observerCallback, observerOptions);
    
        // Select all elements to animate
        const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
    
        // Observe each element so the animation triggers when it comes into view
        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });

    // 3. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelectorAll('.nav-links');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.forEach(linkGroup => {
                linkGroup.style.display = linkGroup.style.display === 'flex' ? 'none' : 'flex';
                linkGroup.style.flexDirection = 'column';
                linkGroup.style.position = 'absolute';
                linkGroup.style.top = '100%';
                linkGroup.style.left = '0';
                linkGroup.style.width = '100%';
                linkGroup.style.backgroundColor = 'var(--clr-bg-primary)';
                linkGroup.style.padding = '1rem';
            });
        });
    }

    // 4. Cart Logic using localStorage
    let cart = JSON.parse(localStorage.getItem('muuse_cart')) || [];

    const updateCartBadge = () => {
        const cartLink = document.getElementById('cart-link');
        if (cartLink) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartLink.textContent = `Cart (${totalItems})`;
        }
    };

    const saveCart = () => {
        localStorage.setItem('muuse_cart', JSON.stringify(cart));
        updateCartBadge();
        renderCartPage();
    };

    // Add to cart buttons on Shop page
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const name = e.target.getAttribute('data-name');
            const price = parseFloat(e.target.getAttribute('data-price'));
            
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }
            
            saveCart();
            
            // Visual feedback
            const originalText = e.target.textContent;
            e.target.textContent = 'Added!';
            e.target.style.backgroundColor = 'var(--clr-accent-dark)';
            e.target.style.color = 'var(--clr-white)';
            setTimeout(() => {
                e.target.textContent = originalText;
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'var(--clr-accent-dark)';
            }, 1000);
        });
    });

    // Cart Page rendering
    const renderCartPage = () => {
        const cartContainer = document.getElementById('cart-container');
        if (!cartContainer) return; // Not on cart page

        const emptyMessage = document.getElementById('empty-cart-message');
        const contentWrapper = document.getElementById('cart-content-wrapper');
        const itemsList = document.getElementById('cart-items-list');
        const subtotalEl = document.getElementById('cart-subtotal');
        const totalEl = document.getElementById('cart-total');

        if (cart.length === 0) {
            emptyMessage.style.display = 'block';
            contentWrapper.style.display = 'none';
            return;
        }

        emptyMessage.style.display = 'none';
        contentWrapper.style.display = 'flex';
        itemsList.innerHTML = '';
        
        let subtotal = 0;

        cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                </div>
                <div class="item-price">$${item.price.toFixed(2)}</div>
                <div class="item-qty">
                    <input type="number" value="${item.quantity}" min="1" class="qty-input" data-index="${index}" style="width: 50px; padding: 0.2rem;">
                </div>
                <div class="item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                    <button class="remove-item" data-index="${index}">Remove</button>
                </div>
            `;
            itemsList.appendChild(itemEl);
        });

        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        totalEl.textContent = `$${subtotal.toFixed(2)}`; // Assuming no tax/shipping for demo

        // Quantity change listeners
        document.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = e.target.getAttribute('data-index');
                const newQty = parseInt(e.target.value);
                if (newQty > 0) {
                    cart[index].quantity = newQty;
                    saveCart();
                }
            });
        });

        // Remove listeners
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                cart.splice(index, 1);
                saveCart();
            });
        });
    };

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            cart = [];
            saveCart();
            const msg = document.getElementById('checkout-message');
            msg.style.display = 'block';
            setTimeout(() => {
                msg.style.display = 'none';
                renderCartPage();
            }, 3000);
        });
    }

    // 5. Account Logic using localStorage
    let currentUser = JSON.parse(localStorage.getItem('muuse_user'));
    
    const renderAccountPage = () => {
        const authSection = document.getElementById('auth-section');
        const profileSection = document.getElementById('profile-section');
        if (!authSection || !profileSection) return;

        if (currentUser) {
            authSection.style.display = 'none';
            profileSection.style.display = 'flex';
            document.getElementById('welcome-message').textContent = `Welcome, ${currentUser.name}`;
            document.getElementById('edit-name').value = currentUser.name;
            document.getElementById('edit-email').value = currentUser.email;
            document.getElementById('edit-address').value = currentUser.address || '';
        } else {
            authSection.style.display = 'flex';
            profileSection.style.display = 'none';
        }
    };

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value; // In a real app, never store plain text passwords!
            
            // For demo, we just store the user and "log them in"
            currentUser = { name, email, password, address: '' };
            localStorage.setItem('muuse_user', JSON.stringify(currentUser));
            renderAccountPage();
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Demo verification against whatever was last registered
            const savedUser = JSON.parse(localStorage.getItem('muuse_user'));
            const errorEl = document.getElementById('login-error');
            
            if (savedUser && savedUser.email === email && savedUser.password === password) {
                currentUser = savedUser;
                errorEl.textContent = '';
                renderAccountPage();
            } else {
                errorEl.textContent = 'Invalid email or password. Please register if you haven\'t.';
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            currentUser = null;
            // Note: we don't clear the saved user from localStorage entirely so they can log back in
            // But we simulate a session clear by resetting currentUser
            renderAccountPage();
            // Optional: reset forms
            if(loginForm) loginForm.reset();
            if(registerForm) registerForm.reset();
        });
    }

    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if(currentUser) {
                currentUser.name = document.getElementById('edit-name').value;
                currentUser.address = document.getElementById('edit-address').value;
                localStorage.setItem('muuse_user', JSON.stringify(currentUser));
                
                document.getElementById('welcome-message').textContent = `Welcome, ${currentUser.name}`;
                
                const successMsg = document.getElementById('profile-success');
                successMsg.style.display = 'block';
                setTimeout(() => {
                    successMsg.style.display = 'none';
                }, 3000);
            }
        });
    }

    // Initializations
    updateCartBadge();
    renderCartPage();
    renderAccountPage();

    // Category tabs behavior
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            // toggle active button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // show target panel
            tabPanels.forEach(panel => {
                if (panel.id === target) panel.classList.add('active'); else panel.classList.remove('active');
            });
        });
    });

    // Activate a tab if the URL has a hash (e.g. shop.html#scrubs)
    const activateFromHash = () => {
        const hash = location.hash.replace('#', '');
        if (!hash) return;
        const targetBtn = Array.from(tabButtons).find(b => b.getAttribute('data-target') === hash);
        if (targetBtn) targetBtn.click();
    };

    // Run once on load
    activateFromHash();

    // Also handle hashchange if user navigates back/forward
    window.addEventListener('hashchange', activateFromHash);
});
