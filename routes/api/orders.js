const express = require('express');
const router = express.Router();
const Cart = require('../../models/Cart');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');

const buildPaymentReference = () => `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin', auth, admin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/checkout', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || !cart.items.length) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    for (const item of cart.items) {
      if (!item.product || item.product.stock < item.quantity) {
        return res.status(400).json({ msg: `${item.product ? item.product.name : 'A product'} is out of stock` });
      }
    }

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));
    const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      subtotal,
      paymentProvider: 'mock',
      paymentStatus: 'paid',
      paymentReference: buildPaymentReference(),
      shippingAddress: req.body.shippingAddress || {}
    });

    await Promise.all(cart.items.map(item => Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity }
    })));

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/status', auth, admin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
      new: true,
      runValidators: true
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
