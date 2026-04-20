require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const products = require('./src/data/products');

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
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Modern E-Commerce Store',
        products: products 
    });
});

app.get('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        return res.status(404).send('Product not found');
    }
    
    res.render('product', { 
        title: product.name,
        product: product 
    });
});

app.get('/cart', (req, res) => {
    res.render('cart', { title: 'Shopping Cart' });
});

// App connection
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
