
import express from 'express';
import { getWorkshops, getWorkshopById, addStudentToWorkshop, createWorkshop, updateWorkshop } from '../controllers/workshopController.js';

const router = express.Router();

router.get('/', getWorkshops);
router.get('/:id', getWorkshopById);
router.post('/:id/students', addStudentToWorkshop);
router.post('/', createWorkshop);
router.put('/:id', updateWorkshop);

export default router;
