const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Homepage with products
router.get('/', productController.getHomepage);

// We'll prepare the product details route for Phase 3
router.get('/product/:id', productController.getProductDetails);

module.exports = router;
