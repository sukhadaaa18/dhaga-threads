const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    image: { type: String, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ['dresses', 'sleeveless-a-line-kurtis', 'a-line-kurtis-with-sleeves', 'gharara', 'lehengas', 'kurtis', 'a-line-kurtis']
    },
    description: { type: String, required: true },
    fabric: { type: String, required: true },
    tag: { type: String },
    isNewProduct: { type: Boolean, default: false },
    isOutOfStock: { type: Boolean, default: false },
    isSale: { type: Boolean, default: false },
    isFestive: { type: Boolean, default: false },
    outOfStockSizes: { 
        type: [String], 
        default: [] 
    },
    stock: { type: Number, default: 10 },
    reelVideo: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
