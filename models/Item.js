const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema    
const ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'Other'
    },
    aiConfidence: {
        type: Number,
        default: 0
    },
    addedByVoice: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
}); 

module.exports = Item = mongoose.model('item', ItemSchema);
