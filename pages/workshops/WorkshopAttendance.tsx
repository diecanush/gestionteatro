import React, { useState, useEffect, useCallback } from 'react';
import { Workshop, Student } from '../../types';
import {
  getWorkshopAttendance,
  recordAttendance,
  AttendanceRecord,
} from '../../services/api';

interface WorkshopAttendanceProps {
  workshop: Workshop;
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const WorkshopAttendance: React.FC<WorkshopAttendanceProps> = ({ workshop }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseClassDays = (): number[] => {
    if (!workshop.classDays) return [];
    try {
      return JSON.parse(workshop.classDays);
    } catch {
      return workshop.classDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
    }
  };

  const generateDatesForMonth = useCallback((): string[] => {
    const days = parseClassDays();
    if (days.length === 0) return [];

    const dates: string[] = [];
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const workshopStart = workshop.startDate ? new Date(workshop.startDate) : null;
    const workshopEnd = workshop.endDate ? new Date(workshop.endDate) : null;

    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (days.includes(dayOfWeek)) {
        const dateStr = d.toISOString().split('T')[0];
        if (workshopStart && d < workshopStart) continue;
        if (workshopEnd && d > workshopEnd) continue;
        dates.push(dateStr);
      }
    }
    return dates;
  }, [currentMonth, currentYear, workshop.startDate, workshop.endDate]);

  const dates = generateDatesForMonth();

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const days = parseClassDays();
    if (days.includes(today.getDay())) {
      setSelectedDate(todayStr);
    } else if (dates.length > 0) {
      const nextDate = dates.find(d => d >= todayStr) || dates[dates.length - 1];
      setSelectedDate(nextDate);
    }
  }, [dates.length]);

  const fetchAttendance = async () => {
    if (dates.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];
      const data = await getWorkshopAttendance(workshop.id, startDate, endDate);
      const attendanceMap: Record<string, AttendanceRecord> = {};
      data.forEach((record: AttendanceRecord) => {
        const key = `${record.student_id}_${record.date}`;
        attendanceMap[key] = record;
      });
      setAttendance(attendanceMap);
    } catch (err) {
      console.error('Error loading attendance:', err);
      setError('Error al cargar asistencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth, currentYear, workshop.id]);

  const getAttendanceStatus = (studentId: string, date: string): 'P' | 'A' | null => {
    const key = `${studentId}_${date}`;
    return attendance[key]?.status || null;
  };

  const handleCellClick = async (student: Student, date: string) => {
    const currentStatus = getAttendanceStatus(student.id, date);
    const newStatus = currentStatus === 'P' ? 'A' : 'P';
    const key = `${student.id}_${date}`;
    
    setAttendance(prev => ({ ...prev, [key]: { ...prev[key], student_id: student.id, date, status: newStatus } as AttendanceRecord }));
    setSaving(true);
    try {
      await recordAttendance(workshop.id, date, [{ studentId: student.id, status: newStatus }]);
    } catch (err) {
      console.error('Error saving:', err);
      fetchAttendance();
    } finally {
      setSaving(false);
    }
  };

  const isSelectedDate = (date: string) => date === selectedDate;
  const monthName = new Date(currentYear, currentMonth).toLocaleString('es-AR', { month: 'long', year: 'numeric' });
  const getDayName = (dateStr: string) => DAYS_OF_WEEK[new Date(dateStr).getDay()];
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto"></div>
        <p className="mt-4 text-gray-500">Cargando asistencia...</p>
      </div>
    );
  }

  const classDaysList = parseClassDays();
  if (classDaysList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">El taller no tiene días de clase definidos.</p>
        <p className="text-sm mt-2">Edita el taller para agregar los días (ej: [1,3] para lunes y miércoles)</p>
      </div>
    );
  }

  if (workshop.students.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">No hay alumnos inscriptos.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentMonth(m => m === 0 ? (setCurrentYear(y => y - 1), 11) : m - 1)} className="px-3 py-1 bg-gray-200 dark:bg-brand-blue rounded">←</button>
          <h3 className="text-xl font-semibold capitalize">{monthName}</h3>
          <button onClick={() => setCurrentMonth(m => m === 11 ? (setCurrentYear(y => y + 1), 0) : m + 1)} className="px-3 py-1 bg-gray-200 dark:bg-brand-blue rounded">→</button>
        </div>
        <button onClick={() => { const n = new Date(); setCurrentMonth(n.getMonth()); setCurrentYear(n.getFullYear()); }}
          className="px-4 py-2 rounded bg-brand-accent text-white">Hoy</button>
      </div>

      {saving && <div className="text-sm text-blue-500 mb-2">Guardando...</div>}
      {error && <div className="text-sm text-red-500 mb-2">{error}</div>}

      {/* Attendance Table */}
      <div className="overflow-x-auto border dark:border-brand-blue rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-brand-blue sticky top-0">
            <tr>
              <th className="p-3 text-left sticky left-0 bg-gray-100 dark:bg-brand-blue min-w-[180px] z-10 border-r">Alumno</th>
              {dates.map(date => (
                <th key={date} className={`p-2 text-center min-w-[60px] border-r cursor-pointer ${isSelectedDate(date) ? 'bg-brand-accent/20' : ''}`}
                  onClick={() => setSelectedDate(date)}>
                  <div className="text-xs text-gray-500">{getDayName(date)}</div>
                  <div className="text-sm font-semibold">{formatDate(date)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workshop.students.map(student => (
              <tr key={student.id} className="border-b dark:border-brand-blue hover:bg-gray-50 dark:hover:bg-brand-blue/30">
                <td className="p-3 sticky left-0 bg-white dark:bg-brand-navy border-r z-10">
                  <div className="font-medium">{student.lastName}</div>
                  <div className="text-sm text-gray-500">{student.firstName}</div>
                </td>
                {dates.map(date => {
                  const status = getAttendanceStatus(student.id, date);
                  const isTodaySelected = isSelectedDate(date);
                  return (
                    <td key={`${student.id}-${date}`}
                      className={`p-0 text-center border-r cursor-pointer transition-colors ${isTodaySelected ? 'ring-2 ring-brand-accent ring-inset' : ''} ${status === 'P' ? 'bg-green-100 dark:bg-green-900/50' : status === 'A' ? 'bg-red-100 dark:bg-red-900/50' : ''}`}
                      onClick={() => handleCellClick(student, date)}>
                      <div className="py-3 text-lg font-bold min-h-[48px] flex items-center justify-center">
                        {status === 'P' ? 'P' : status === 'A' ? 'A' : '-'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-100 border"/> <span>Presente</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-100 border"/> <span>Ausente</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-brand-accent"/> <span>Seleccionado</span></div>
      </div>
    </div>
  );
};

export default WorkshopAttendance;
