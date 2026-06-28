import Workshop from '../models/Workshop.js';
import Student from '../models/Student.js';
import WorkshopPayment from '../models/WorkshopPayment.js';
import { Op } from 'sequelize';

// Get all payments for a workshop
export const getPaymentsByWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { month, year } = req.query;

    const whereClause = { workshop_id: workshopId };
    
    if (month) whereClause.month = parseInt(month);
    if (year) whereClause.year = parseInt(year);

    const payments = await WorkshopPayment.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      order: [['year', 'DESC'], ['month', 'DESC']],
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error al obtener los pagos', error: error.message });
  }
};

// Get payments for a specific student
export const getStudentPayments = async (req, res) => {
  try {
    const { workshopId, studentId } = req.params;

    const payments = await WorkshopPayment.findAll({
      where: {
        workshop_id: workshopId,
        student_id: studentId,
      },
      order: [['year', 'DESC'], ['month', 'DESC']],
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record or update a payment
export const recordPayment = async (req, res) => {
  try {
    const { workshopId, studentId } = req.params;
    const { month, year, amount, paid, paid_date, payment_method, notes } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        message: 'Se requiere mes y año',
      });
    }

    const paymentData = {
      workshop_id: workshopId,
      student_id: studentId,
      month: parseInt(month),
      year: parseInt(year),
      amount: amount || 0,
      paid: paid || false,
      paid_date: paid_date || null,
      payment_method: payment_method || null,
      notes: notes || null,
    };

    const [payment, created] = await WorkshopPayment.upsert(paymentData, {
      returning: true,
    });

    res.status(created ? 201 : 200).json({
      message: created ? 'Pago registrado' : 'Pago actualizado',
      payment,
      created,
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Error al registrar pago', error: error.message });
  }
};

// Update a payment
export const updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, paid, paid_date, payment_method, notes } = req.body;

    const payment = await WorkshopPayment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    if (amount !== undefined) payment.amount = amount;
    if (paid !== undefined) payment.paid = paid;
    if (paid_date !== undefined) payment.paid_date = paid_date;
    if (payment_method !== undefined) payment.payment_method = payment_method;
    if (notes !== undefined) payment.notes = notes;

    await payment.save();

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a payment
export const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const deleted = await WorkshopPayment.destroy({
      where: { id: paymentId },
    });

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Pago no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment summary for a workshop
export const getPaymentSummary = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { year } = req.query;

    const whereClause = { workshop_id: workshopId };
    if (year) whereClause.year = parseInt(year);

    const payments = await WorkshopPayment.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    // Calculate summary per student
    const summary = {};
    const monthlySummary = {};

    for (const payment of payments) {
      const studentId = payment.student_id;
      const monthKey = `${payment.year}-${String(payment.month).padStart(2, '0')}`;

      if (!summary[studentId]) {
        summary[studentId] = {
          student: payment.student,
          totalDue: 0,
          totalPaid: 0,
          balance: 0,
          monthsPaid: 0,
          monthsPending: 0,
        };
      }

      summary[studentId].totalDue += parseFloat(payment.amount);
      if (payment.paid) {
        summary[studentId].totalPaid += parseFloat(payment.amount);
        summary[studentId].monthsPaid++;
      } else {
        summary[studentId].monthsPending++;
      }
      summary[studentId].balance = summary[studentId].totalDue - summary[studentId].totalPaid;

      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = {
          month: payment.month,
          year: payment.year,
          totalDue: 0,
          totalCollected: 0,
          pending: 0,
          studentsPaid: 0,
          studentsPending: 0,
        };
      }

      monthlySummary[monthKey].totalDue += parseFloat(payment.amount);
      if (payment.paid) {
        monthlySummary[monthKey].totalCollected += parseFloat(payment.amount);
        monthlySummary[monthKey].studentsPaid++;
      } else {
        monthlySummary[monthKey].pending += parseFloat(payment.amount);
        monthlySummary[monthKey].studentsPending++;
      }
    }

    res.json({
      students: Object.values(summary),
      byMonth: Object.values(monthlySummary).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Initialize payments for a month
export const initializeMonthPayments = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: 'Se requiere mes y año' });
    }

    const workshop = await Workshop.findByPk(workshopId, {
      include: [
        {
          model: Student,
          as: 'students',
          attributes: ['id'],
        },
      ],
    });

    if (!workshop) {
      return res.status(404).json({ message: 'Taller no encontrado' });
    }

    const defaultAmount = workshop.fee || 0;
    const created = [];
    const existing = [];

    for (const student of workshop.students) {
      try {
        const [payment, wasCreated] = await WorkshopPayment.findOrCreate({
          where: {
            workshop_id: workshopId,
            student_id: student.id,
            month: parseInt(month),
            year: parseInt(year),
          },
          defaults: {
            amount: defaultAmount,
            paid: false,
          },
        });

        if (wasCreated) {
          created.push(payment);
        } else {
          existing.push(payment);
        }
      } catch (err) {
        console.error(`Error for student ${student.id}:`, err);
      }
    }

    res.json({
      message: 'Inicialización completa',
      created: created.length,
      existing: existing.length,
    });
  } catch (error) {
    console.error('Error initializing payments:', error);
    res.status(500).json({ message: error.message });
  }
};
