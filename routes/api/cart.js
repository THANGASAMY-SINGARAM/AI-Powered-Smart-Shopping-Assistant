const express = require('express');
const router = express.Router();
const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const auth = require('../../middleware/auth');

const getCart = async userId => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate('items.product');
  }

  return cart;
};

router.get('/', auth, async (req, res) => {
  try {
    res.json(await getCart(req.user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/items', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);

    if (!product || product.stock < quantity) {
      return res.status(400).json({ msg: 'Product unavailable' });
    }

    const cart = await getCart(req.user.id);
    const existing = cart.items.find(item => item.product._id.toString() === productId);

    if (existing) {
      const nextQuantity = existing.quantity + Number(quantity);
      if (nextQuantity > product.stock) {
        return res.status(400).json({ msg: 'Not enough stock available' });
      }
      existing.quantity = nextQuantity;
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    res.status(201).json(await getCart(req.user.id));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/items/:productId', auth, async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    const cart = await getCart(req.user.id);
    const existing = cart.items.find(item => item.product._id.toString() === req.params.productId);

    if (!existing) {
      return res.status(404).json({ msg: 'Cart item not found' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.product._id.toString() !== req.params.productId);
    } else {
      const product = await Product.findById(req.params.productId);
      if (!product || quantity > product.stock) {
        return res.status(400).json({ msg: 'Not enough stock available' });
      }
      existing.quantity = quantity;
    }

    await cart.save();
    res.json(await getCart(req.user.id));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/items/:productId', auth, async (req, res) => {
  try {
    const cart = await getCart(req.user.id);
    cart.items = cart.items.filter(item => item.product._id.toString() !== req.params.productId);
    await cart.save();
    res.json(await getCart(req.user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    const cart = await getCart(req.user.id);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
