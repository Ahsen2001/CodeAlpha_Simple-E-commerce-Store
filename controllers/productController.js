const products = [
    {
        id: 1,
        name: 'Aura Smart Watch',
        price: 299.99,
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
        description: 'The next generation of wrist-based intelligence. Track your daily routines seamlessly.'
    },
    {
        id: 2,
        name: 'Echo Noise Cancelling Headphones',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
        description: 'Immersive sound with industry-leading active noise cancellation technology.'
    },
    {
        id: 3,
        name: 'Lunar Minimalist Desk Lamp',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
        description: 'Sleek, aluminum design designed to illuminate your workspace perfectly.'
    },
    {
        id: 4,
        name: 'Nimbus Mechanical Keyboard',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
        description: 'Tactile, satisfying typing experience built for developers and professionals.'
    }
];

exports.getHomepage = (req, res) => {
    res.render('index', { 
        title: 'Modern E-Commerce Store',
        products: products
    });
};

exports.getProductDetails = (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
        return res.status(404).render('404', { title: 'Product Not Found' });
    }
    res.render('product', {
        title: product.name,
        product: product
    });
};
