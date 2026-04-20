const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        rating NUMERIC(2, 1) NOT NULL DEFAULT 0
    );
`;

const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone_number VARCHAR(50) NOT NULL,
        total_price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`;

const createOrderItemsTable = `
    CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL
    );
`;

module.exports = {
    createProductsTable,
    createOrdersTable,
    createOrderItemsTable
};
