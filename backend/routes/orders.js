const express = require('express');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route GET /api/orders (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email phone').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route GET /api/orders/my (User's orders)
router.get('/my', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route POST /api/orders
router.post('/', protect, async (req, res) => {
    const { items, totalPrice, address, paymentMethod, paymentStatus, razorpayPaymentId } = req.body;
    try {
        const order = await Order.create({
            user: req.user._id,
            items,
            totalPrice,
            address,
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: paymentStatus || 'Pending',
            razorpayPaymentId
        });

        // Decrement stock
        const Product = require('../models/Product');
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route PUT /api/orders/:id/status
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status;
            await order.save();
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route PUT /api/orders/:id/request-return
router.put('/:id/request-return', protect, async (req, res) => {
    try {
        const { returnReason, returnType, returnPickupDate } = req.body;
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (order) {
            if (order.status !== 'Delivered') {
                return res.status(400).json({ message: 'Only delivered orders can be returned' });
            }
            order.status = 'Return Requested';
            order.returnReason = returnReason;
            order.returnType = returnType;
            order.returnPickupDate = returnPickupDate;
            await order.save();
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
