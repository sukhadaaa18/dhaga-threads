const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['pending_confirmation', 'confirmed', 'cancelled', 'completed'], 
        default: 'pending_confirmation' 
    },
    phone: { type: String },
    totalPrice: { type: Number, required: true }
}, { timestamps: true });

// Reservation model simplified for reliability

module.exports = mongoose.model('Reservation', reservationSchema);
