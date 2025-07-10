
import express from 'express';
import { getSnackBarProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/snackBarController.js';

const router = express.Router();

router.get('/', getSnackBarProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
