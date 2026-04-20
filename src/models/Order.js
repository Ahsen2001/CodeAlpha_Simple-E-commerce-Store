const { pool } = require('../config/db');

const Order = {
    async create(orderData) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const orderResult = await client.query(
                `
                    INSERT INTO orders (full_name, address, phone_number, total_price)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                `,
                [
                    orderData.customerInfo.fullName,
                    orderData.customerInfo.address,
                    orderData.customerInfo.phoneNumber,
                    orderData.totalPrice
                ]
            );

            const createdOrder = orderResult.rows[0];
            const storedProducts = [];

            for (const product of orderData.products) {
                const itemResult = await client.query(
                    `
                        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING *
                    `,
                    [
                        createdOrder.id,
                        product.productId,
                        product.name,
                        product.price,
                        product.quantity,
                        product.subtotal
                    ]
                );

                const item = itemResult.rows[0];
                storedProducts.push({
                    productId: Number(item.product_id),
                    name: item.product_name,
                    price: Number(item.price),
                    quantity: Number(item.quantity),
                    subtotal: Number(item.subtotal)
                });
            }

            await client.query('COMMIT');

            return {
                id: Number(createdOrder.id),
                customerInfo: {
                    fullName: createdOrder.full_name,
                    address: createdOrder.address,
                    phoneNumber: createdOrder.phone_number
                },
                products: storedProducts,
                totalPrice: Number(createdOrder.total_price),
                createdAt: createdOrder.created_at
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = Order;
