// Shopping Cart Logic
const CartManager = {
    getCart: () => JSON.parse(localStorage.getItem('luxecart')) || [],
    
    saveCart: (cart) => {
        localStorage.setItem('luxecart', JSON.stringify(cart));
        CartManager.updateCartIcon();
    },

    addToCart: (productToAdd, quantityToAdd) => {
        const cart = CartManager.getCart();
        const existingItem = cart.find(item => item.id === productToAdd.id);
        
        if (existingItem) {
            existingItem.quantity += parseInt(quantityToAdd);
        } else {
            cart.push({ ...productToAdd, quantity: parseInt(quantityToAdd) });
        }
        
        CartManager.saveCart(cart);
    },
    
    updateQuantity: (id, amount) => {
        let cart = CartManager.getCart();
        const item = cart.find(item => item.id === id);
        if(item) {
            item.quantity += amount;
            if(item.quantity <= 0) {
                cart = cart.filter(x => x.id !== id);
            }
        }
        CartManager.saveCart(cart);
        
        // Trigger generic custom event so that cart-page can re-render if it is open
        window.dispatchEvent(new Event('cartUpdated'));
    },

    removeItem: (id) => {
        let cart = CartManager.getCart();
        cart = cart.filter(item => item.id !== id);
        CartManager.saveCart(cart);
        window.dispatchEvent(new Event('cartUpdated'));
    },

    updateCartIcon: () => {
        const cart = CartManager.getCart();
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        document.querySelectorAll('#cartCount').forEach(badge => {
            badge.innerText = totalItems;
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    CartManager.updateCartIcon();
    hidePageLoader();
    setupRevealAnimations();
    setupButtonLoadingStates();

    const navbar = document.querySelector('.navbar');
    if(navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 20px 45px rgba(15, 23, 42, 0.08)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        });
    }
});

function hidePageLoader() {
    const loader = document.querySelector('[data-page-loader]');
    if (!loader) {
        return;
    }

    requestAnimationFrame(() => {
        loader.classList.add('hidden');
    });
}

function setupRevealAnimations() {
    const revealItems = document.querySelectorAll('.reveal');
    if (!revealItems.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealItems.forEach((item) => observer.observe(item));
}

function setupButtonLoadingStates() {
    document.querySelectorAll('[data-loading-text]').forEach((button) => {
        button.addEventListener('click', () => {
            if (button.dataset.skipLoading === 'true') {
                return;
            }

            if (button.tagName === 'A') {
                return;
            }

            if (button.form && !button.form.checkValidity()) {
                return;
            }

            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ${button.dataset.loadingText}
            `;
        });
    });
}
