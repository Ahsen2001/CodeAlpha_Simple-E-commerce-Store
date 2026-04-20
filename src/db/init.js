const { query } = require('../config/db');
const {
    createProductsTable,
    createOrdersTable,
    createOrderItemsTable
} = require('./schema');
const seedProducts = require('../data/products');
const Product = require('../models/Product');

async function seedInitialProducts() {
    const productCount = await Product.count();

    if (productCount > 0) {
        return;
    }

    for (const product of seedProducts) {
        await Product.create(product);
    }
}

async function initializeDatabase() {
    await query(createProductsTable);
    await query(createOrdersTable);
    await query(createOrderItemsTable);
    await seedInitialProducts();
}

module.exports = {
    initializeDatabase
};
