const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  brand: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.5
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text', tags: 'text' });

module.exports = mongoose.model('product', ProductSchema);
