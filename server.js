require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

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
    // We will render our product listing page here soon
    res.render('index', { title: 'Modern E-Commerce Store' });
});

// App connection
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
