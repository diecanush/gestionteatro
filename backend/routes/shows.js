
import express from 'express';
import { getShows, getShowById, createShow, updateShow } from '../controllers/showController.js';

const router = express.Router();

router.get('/', getShows);
router.get('/:id', getShowById);
router.post('/', createShow);
router.put('/:id', updateShow);

export default router;
