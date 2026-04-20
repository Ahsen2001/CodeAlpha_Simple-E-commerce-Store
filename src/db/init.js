const { query } = require('../config/db');
const {
    createProductsTable,
    createUsersTable,
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
    await query(createUsersTable);
    await query(createOrdersTable);
    await query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL');
    await query(createOrderItemsTable);
    await seedInitialProducts();
}

module.exports = {
    initializeDatabase
};
