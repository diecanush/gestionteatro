import React, { useState, useEffect } from 'react';
import { Workshop, Student } from '../../types';
import {
  getWorkshopPayments,
  recordPayment,
  initializeMonthPayments,
  PaymentRecord,
} from '../../services/api';

interface WorkshopPaymentsProps {
  workshop: Workshop;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WorkshopPayments: React.FC<WorkshopPaymentsProps> = ({ workshop }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [selectedMonth, selectedYear, workshop.id]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await getWorkshopPayments(workshop.id, selectedMonth + 1, selectedYear);
      setPayments(data);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentToggle = async (student: Student) => {
    const currentPayment = payments.find(p => p.student_id === student.id);
    const newPaid = !currentPayment?.paid;
    
    if (!currentPayment) {
      // Need to initialize first
      return;
    }

    setPayments(prev => prev.map(p => 
      p.student_id === student.id ? { ...p, paid: newPaid } : p
    ));

    try {
      await recordPayment(workshop.id, student.id, {
        ...currentPayment,
        paid: newPaid,
        paid_date: newPaid ? new Date().toISOString().split('T')[0] : undefined,
      });
    } catch {
      fetchPayments();
    }
  };

  const initializeMonth = async () => {
    setInitializing(true);
    try {
      await initializeMonthPayments(workshop.id, selectedMonth + 1, selectedYear);
      await fetchPayments();
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando pagos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
            className="p-2 border rounded dark:bg-brand-dark"
          >
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="p-2 border rounded dark:bg-brand-dark"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
        <button
          onClick={initializeMonth}
          disabled={initializing}
          className="bg-brand-accent text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {initializing ? 'Inicializando...' : 'Inicializar Mes'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-brand-blue">
            <tr>
              <th className="p-3 text-left">Alumno</th>
              <th className="p-3 text-center">Monto</th>
              <th className="p-3 text-center">Estado</th>
              <th className="p-3 text-center">Fecha Pago</th>
              <th className="p-3 text-center">Método</th>
            </tr>
          </thead>
          <tbody>
            {workshop.students.map(student => {
              const payment = payments.find(p => p.student_id === student.id);
              return (
                <tr key={student.id} className="border-b dark:border-brand-blue">
                  <td className="p-3">{student.lastName}, {student.firstName}</td>
                  <td className="p-3 text-center">
                    ${payment?.amount || workshop.fee}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handlePaymentToggle(student)}
                      className={`px-4 py-2 rounded ${
                        payment?.paid 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 dark:bg-brand-blue'
                      }`}
                    >
                      {payment?.paid ? 'Pagado ✓' : 'Pendiente'}
                    </button>
                  </td>
                  <td className="p-3 text-center">{payment?.paid_date || '-'}</td>
                  <td className="p-3 text-center">{payment?.payment_method || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkshopPayments;
