const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');

const seedProducts = [
  {
    name: 'Everyday Cotton Hoodie',
    description: 'Midweight fleece hoodie with a soft brushed interior.',
    category: 'Apparel',
    brand: 'Northline',
    price: 49.99,
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80',
    tags: ['hoodie', 'cotton', 'casual'],
    featured: true,
    rating: 4.7
  },
  {
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Over-ear headphones with 30-hour battery life and low-latency mode.',
    category: 'Electronics',
    brand: 'Auralux',
    price: 129.99,
    stock: 16,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    tags: ['audio', 'wireless', 'travel'],
    featured: true,
    rating: 4.8
  },
  {
    name: 'Ceramic Pour-Over Coffee Set',
    description: 'Manual brewer set with ribbed dripper, server, and reusable filter.',
    category: 'Home',
    brand: 'Brewstead',
    price: 34.5,
    stock: 31,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    tags: ['coffee', 'kitchen', 'ceramic'],
    featured: false,
    rating: 4.5
  },
  {
    name: 'Trail Running Backpack',
    description: 'Lightweight 12L pack with hydration sleeve and weather-resistant shell.',
    category: 'Outdoor',
    brand: 'Ridgeway',
    price: 74,
    stock: 11,
    imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=80',
    tags: ['backpack', 'running', 'hydration'],
    featured: true,
    rating: 4.6
  },
  {
    name: 'Minimal Desk Lamp',
    description: 'Dimmable LED task lamp with warm-to-cool color temperature controls.',
    category: 'Home Office',
    brand: 'Lumora',
    price: 58,
    stock: 19,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    tags: ['desk', 'lighting', 'office'],
    featured: false,
    rating: 4.4
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated 24oz bottle that keeps drinks cold for up to 24 hours.',
    category: 'Outdoor',
    brand: 'HydraPeak',
    price: 22.95,
    stock: 42,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
    tags: ['bottle', 'fitness', 'travel'],
    featured: false,
    rating: 4.3
  }
];

const buildQuery = ({ search, category, minPrice, maxPrice, inStock }) => {
  const query = {};

  if (search) {
    query.$text = { $search: search };
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  return query;
};

router.get('/', async (req, res) => {
  try {
    const sortMap = {
      newest: { createdAt: -1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      rating: { rating: -1 }
    };
    const products = await Product.find(buildQuery(req.query))
      .sort(sortMap[req.query.sort] || { featured: -1, createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recommendations', async (req, res) => {
  try {
    const cartCategories = (req.query.categories || '').split(',').filter(Boolean);
    const query = cartCategories.length ? { category: { $in: cartCategories } } : { featured: true };
    const products = await Product.find(query).sort({ rating: -1, featured: -1 }).limit(6);
    res.json(products.map(product => ({
      ...product.toObject(),
      recommendationReason: cartCategories.length
        ? `Popular with ${product.category} shoppers`
        : 'Trending with shoppers right now'
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/seed', auth, admin, async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count) {
      return res.json({ inserted: 0, msg: 'Products already exist' });
    }

    const products = await Product.insertMany(seedProducts);
    res.status(201).json({ inserted: products.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
