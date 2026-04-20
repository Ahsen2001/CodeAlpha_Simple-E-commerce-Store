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
    // Initial cart icon load
    CartManager.updateCartIcon();
    
    // Smooth navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if(navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        });
    }
});
