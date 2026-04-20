const { query } = require('../config/db');

const User = {
    async create(user) {
        const result = await query(
            `
                INSERT INTO users (full_name, email, phone_number, password_hash)
                VALUES ($1, $2, $3, $4)
                RETURNING id, full_name, email, phone_number, created_at
            `,
            [user.fullName, user.email.toLowerCase(), user.phoneNumber, user.passwordHash]
        );

        return User.format(result.rows[0]);
    },

    async getByEmail(email) {
        const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        return result.rows[0] ? User.format(result.rows[0], true) : null;
    },

    async getById(id) {
        const result = await query(
            'SELECT id, full_name, email, phone_number, created_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] ? User.format(result.rows[0]) : null;
    },

    format(user, includePassword = false) {
        return {
            id: Number(user.id),
            fullName: user.full_name,
            email: user.email,
            phoneNumber: user.phone_number,
            createdAt: user.created_at,
            ...(includePassword ? { passwordHash: user.password_hash } : {})
        };
    }
};

module.exports = User;
