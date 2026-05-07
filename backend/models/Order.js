const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number
    }],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Return Approved', 'Return Pickup Scheduled', 'Return Picked Up', 'Refund Processed', 'Return Rejected'], default: 'Processing' },
    returnReason: { type: String },
    returnType: { type: String, enum: ['Refund', 'Replacement', 'Exchange'] },
    returnPickupDate: { type: Date },

    paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'COD' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    address: {
        fullName: String,
        street: String,
        city: String,
        pincode: String,
        phone: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
