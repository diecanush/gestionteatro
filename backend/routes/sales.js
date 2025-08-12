import express from 'express';
import saleController from '../controllers/saleController.js';

const router = express.Router();

// Expect { order, tableNumber, paymentMethod } in body
router.post('/confirm', (req, res, next) => {
    if (!req.body.paymentMethod) {
        return res.status(400).json({ message: 'paymentMethod is required' });
    }
    next();
}, saleController.confirmSale);
router.get('/history', saleController.getSalesHistory);

export default router;

