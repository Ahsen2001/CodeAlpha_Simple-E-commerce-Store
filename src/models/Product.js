const { query } = require('../config/db');

const Product = {
    async getAll() {
        const result = await query('SELECT * FROM products ORDER BY id ASC');
        return result.rows.map(Product.format);
    },

    async getById(id) {
        const result = await query('SELECT * FROM products WHERE id = $1', [id]);
        return result.rows[0] ? Product.format(result.rows[0]) : null;
    },

    async create(product) {
        const result = await query(
            `
                INSERT INTO products (name, price, description, image, rating)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `,
            [product.name, product.price, product.description, product.image, product.rating]
        );

        return Product.format(result.rows[0]);
    },

    async count() {
        const result = await query('SELECT COUNT(*)::int AS count FROM products');
        return result.rows[0].count;
    },

    format(product) {
        return {
            id: Number(product.id),
            name: product.name,
            price: Number(product.price),
            description: product.description,
            image: product.image,
            rating: Number(product.rating)
        };
    }
};

module.exports = Product;
