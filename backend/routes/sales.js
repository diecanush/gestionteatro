import express from 'express';
import saleController from '../controllers/saleController.js';

const router = express.Router();

router.post('/confirm', saleController.confirmSale);

export default router;