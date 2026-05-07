const express = require('express');
const Reservation = require('../models/Reservation');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route GET /api/reservations (Admin only - all visits)
router.get('/', protect, admin, async (req, res) => {
    try {
        const reservations = await Reservation.find({}).populate('user', 'name email phone').populate('product').sort({ createdAt: -1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route GET /api/reservations/product/:id
router.get('/product/:id', async (req, res) => {
    try {
        const reservations = await Reservation.find({ 
            product: req.params.id,
            status: { $in: ['pending_confirmation', 'confirmed'] }
        }).select('startDate endDate');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route GET /api/reservations/my (User's own reservations)
router.get('/my', protect, async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user._id }).populate('product');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route POST /api/reservations
router.post('/', protect, async (req, res) => {
    const { productId, startDate, totalPrice, phone } = req.body;
    
    // Update user's phone if they don't have one
    if (phone) {
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, { phone });
    }
    
    // Calculate end date (8 days later)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 8);

    try {
        // Check for overlapping reservations
        const overlapping = await Reservation.findOne({
            product: productId,
            status: { $in: ['pending_confirmation', 'confirmed'] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        if (overlapping) {
            return res.status(400).json({ message: 'This garment is already reserved for these dates.' });
        }

        const reservation = await Reservation.create({
            user: req.user._id,
            product: productId,
            startDate: start,
            endDate: end,
            phone,
            totalPrice
        });

        res.status(201).json(reservation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route PUT /api/reservations/:id/status (Admin only)
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            reservation.status = req.body.status;
            await reservation.save();
            res.json(reservation);
        } else {
            res.status(404).json({ message: 'Reservation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route DELETE /api/reservations/:id (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            await reservation.deleteOne();
            res.json({ message: 'Reservation removed' });
        } else {
            res.status(404).json({ message: 'Reservation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
