require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
const User = require('./src/models/User');
const { initializeDatabase } = require('./src/db/init');
const {
    attachSession,
    clearSession,
    createSession,
    hashPassword,
    verifyPassword
} = require('./src/utils/auth');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(attachSession);

// Set up EJS for Templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Basic Routes
app.get('/', async (req, res) => {
    try {
        const products = await Product.getAll();

        res.render('index', {
            title: 'Modern E-Commerce Store',
            products: products,
            activePage: 'home'
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
            product: product,
            activePage: 'product'
        });
    } catch (error) {
        console.error('Failed to load product:', error.message);
        res.status(500).send('Unable to load the product right now.');
    }
});

app.get('/cart', (req, res) => {
    res.render('cart', { title: 'Shopping Cart', activePage: 'cart' });
});

app.get('/checkout', (req, res) => {
    res.render('checkout', { title: 'Checkout', activePage: 'checkout' });
});

app.get('/register', (req, res) => {
    if (req.currentUser) {
        return res.redirect('/');
    }

    res.render('register', {
        title: 'Register',
        activePage: 'register',
        formData: {},
        errors: {},
        successMessage: null
    });
});

app.post('/register', async (req, res) => {
    const { fullName = '', email = '', phoneNumber = '', password = '', confirmPassword = '' } = req.body;
    const formData = {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim()
    };
    const errors = {};

    if (formData.fullName.length < 3) {
        errors.fullName = 'Full name must be at least 3 characters long.';
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        errors.email = 'Enter a valid email address.';
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(formData.phoneNumber)) {
        errors.phoneNumber = 'Enter a valid phone number.';
    }

    if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
    }

    try {
        if (!errors.email) {
            const existingUser = await User.getByEmail(formData.email);
            if (existingUser) {
                errors.email = 'An account with this email already exists.';
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).render('register', {
                title: 'Register',
                activePage: 'register',
                formData,
                errors,
                successMessage: null
            });
        }

        const newUser = await User.create({
            ...formData,
            passwordHash: hashPassword(password)
        });

        createSession(res, {
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email
        });

        res.redirect('/');
    } catch (error) {
        console.error('Failed to register user:', error.message);
        res.status(500).render('register', {
            title: 'Register',
            activePage: 'register',
            formData,
            errors: {
                general: 'Unable to create your account right now.'
            },
            successMessage: null
        });
    }
});

app.get('/login', (req, res) => {
    if (req.currentUser) {
        return res.redirect('/');
    }

    res.render('login', {
        title: 'Login',
        activePage: 'login',
        formData: {},
        errors: {}
    });
});

app.post('/login', async (req, res) => {
    const { email = '', password = '' } = req.body;
    const formData = { email: email.trim() };
    const errors = {};

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        errors.email = 'Enter a valid email address.';
    }

    if (!password) {
        errors.password = 'Password is required.';
    }

    try {
        let user = null;

        if (Object.keys(errors).length === 0) {
            user = await User.getByEmail(formData.email);

            if (!user || !verifyPassword(password, user.passwordHash)) {
                errors.general = 'Invalid email or password.';
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).render('login', {
                title: 'Login',
                activePage: 'login',
                formData,
                errors
            });
        }

        createSession(res, {
            id: user.id,
            fullName: user.fullName,
            email: user.email
        });

        res.redirect('/');
    } catch (error) {
        console.error('Failed to login user:', error.message);
        res.status(500).render('login', {
            title: 'Login',
            activePage: 'login',
            formData,
            errors: {
                general: 'Unable to log in right now.'
            }
        });
    }
});

app.post('/logout', (req, res) => {
    clearSession(req, res);
    res.redirect('/');
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
            userId: req.currentUser ? req.currentUser.id : null,
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
