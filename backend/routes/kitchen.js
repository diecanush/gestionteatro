import express from 'express';
const router = express.Router();
import * as kitchenOrderController from '../controllers/kitchenOrderController.js';

// POST a new order to the kitchen
router.post('/', kitchenOrderController.createOrder);

// GET all active orders for the kitchen display
router.get('/', kitchenOrderController.getAllOrders);

// PATCH to update an order's status (e.g., from 'pending' to 'ready')
router.patch('/:id/status', kitchenOrderController.updateOrderStatus);

export default router;
