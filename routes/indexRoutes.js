const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'Modern E-Commerce Store' });
});

module.exports = router;
