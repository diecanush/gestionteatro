import express from 'express';
import {
  getPaymentsByWorkshop,
  getStudentPayments,
  recordPayment,
  updatePayment,
  deletePayment,
  getPaymentSummary,
  initializeMonthPayments,
} from '../controllers/workshopPaymentController.js';

const router = express.Router({ mergeParams: true });

// Base path: /api/workshops/:workshopId/payments

// Get all payments for a workshop
router.get('/', getPaymentsByWorkshop);

// Get payment summary
router.get('/summary', getPaymentSummary);

// Initialize payments for a month
router.post('/initialize', initializeMonthPayments);

// Get payments for a specific student
router.get('/student/:studentId', getStudentPayments);

// Record/update payment for a student
router.post('/student/:studentId', recordPayment);

// Update a specific payment
router.put('/:paymentId', updatePayment);

// Delete a payment
router.delete('/:paymentId', deletePayment);

export default router;
