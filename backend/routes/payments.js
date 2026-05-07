const express = require('express');
const Razorpay = require('razorpay');
const { protect } = require('../middleware/auth');
const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route POST /api/payments/create-order
router.post('/create-order', protect, async (req, res) => {
    const { amount, currency = 'INR' } = req.body;
    
    try {
        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency,
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ message: 'Could not create Razorpay order' });
    }
});

module.exports = router;
