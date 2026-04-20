require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
const { initializeDatabase } = require('./src/db/init');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS for Templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Basic Routes
app.get('/', async (req, res) => {
    try {
        const products = await Product.getAll();

        res.render('index', {
            title: 'Modern E-Commerce Store',
            products: products
        });
    } catch (error) {
        console.error('Failed to load products:', error.message);
        res.status(500).send('Unable to load products right now.');
    }
});

app.get('/product/:id', async (req, res) => {
    const productId = parseInt(req.params.id);

    try {
        const product = await Product.getById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.render('product', {
            title: product.name,
            product: product
        });
    } catch (error) {
        console.error('Failed to load product:', error.message);
        res.status(500).send('Unable to load the product right now.');
    }
});

app.get('/cart', (req, res) => {
    res.render('cart', { title: 'Shopping Cart' });
});

app.get('/checkout', (req, res) => {
    res.render('checkout', { title: 'Checkout' });
});

app.post('/checkout', async (req, res) => {
    const { fullName, address, phoneNumber, cartItems } = req.body;
    const errors = {};

    if (!fullName || fullName.trim().length < 3) {
        errors.fullName = 'Full name must be at least 3 characters long.';
    }

    if (!address || address.trim().length < 10) {
        errors.address = 'Address must be at least 10 characters long.';
    }

    if (!phoneNumber || !/^[0-9+\-\s()]{7,20}$/.test(phoneNumber.trim())) {
        errors.phoneNumber = 'Enter a valid phone number.';
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        errors.cartItems = 'Your cart is empty.';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }

    try {
        const normalizedProducts = [];
        let totalPrice = 0;

        for (const cartItem of cartItems) {
            const product = await Product.getById(Number(cartItem.id));
            const quantity = Number(cartItem.quantity);

            if (!product || !Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    errors: {
                        cartItems: 'One or more cart items are invalid.'
                    }
                });
            }

            const lineTotal = product.price * quantity;
            totalPrice += lineTotal;

            normalizedProducts.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                subtotal: Number(lineTotal.toFixed(2))
            });
        }

        const order = await Order.create({
            customerInfo: {
                fullName: fullName.trim(),
                address: address.trim(),
                phoneNumber: phoneNumber.trim()
            },
            products: normalizedProducts,
            totalPrice: Number(totalPrice.toFixed(2))
        });

        res.status(200).json({
            success: true,
            message: 'Order placed successfully.',
            order: order
        });
    } catch (error) {
        console.error('Failed to process order:', error.message);
        res.status(500).json({
            success: false,
            message: 'Unable to process the order right now.'
        });
    }
});

// App connection
initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Database initialization failed:', error.message);
        process.exit(1);
    });
