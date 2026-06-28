import axios from 'axios';
import { Workshop, Student, Show, SnackBarProduct, SnackBarProductCategory, SnackBarProductDelivery, KitchenOrder, OrderItem, SnackBarSale, OrderCombo, Combo } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// --- Workshop API ---

export const getWorkshops = async (): Promise<Workshop[]> => {
  const response = await api.get('/workshops');
  return response.data;
};

export const getWorkshopById = async (id: string): Promise<Workshop> => {
  const response = await api.get(`/workshops/${id}`);
  return response.data;
};

export const addStudentToWorkshop = async (workshopId: string, student: Omit<Student, 'id'>): Promise<Student> => {
  const response = await api.post(`/workshops/${workshopId}/students`, student);
  return response.data;
};

// --- Workshop Attendance API ---

export interface AttendanceRecord {
  id?: number;
  workshop_id: string;
  student_id: string;
  date: string;
  status: 'P' | 'A';
  notes?: string;
  student?: Student;
}

export interface ClassDayInfo {
  classDays: number[];
  dates: {
    date: string;
    dayOfWeek: number;
    isActive: boolean;
  }[];
  workshopStartDate?: string;
  workshopEndDate?: string;
}

export const getWorkshopAttendance = async (workshopId: string, startDate: string, endDate: string): Promise<AttendanceRecord[]> => {
  const response = await api.get(`/workshops/${workshopId}/attendance?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getWorkshopClassDays = async (workshopId: string, month: number, year: number): Promise<ClassDayInfo> => {
  const response = await api.get(`/workshops/${workshopId}/attendance/class-days?month=${month}&year=${year}`);
  return response.data;
};

export const recordAttendance = async (workshopId: string, date: string, attendance: { studentId: string; status: 'P' | 'A'; notes?: string }[]) => {
  const response = await api.post(`/workshops/${workshopId}/attendance`, { date, attendance });
  return response.data;
};

export const updateAttendanceRecord = async (attendanceId: number, status: 'P' | 'A', notes?: string) => {
  const response = await api.put(`/workshops/attendance/record/${attendanceId}`, { status, notes });
  return response.data;
};

export const getAttendanceSummary = async (workshopId: string, startDate: string, endDate: string) => {
  const response = await api.get(`/workshops/${workshopId}/attendance/summary?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// --- Workshop Payments API ---

export interface PaymentRecord {
  id?: number;
  workshop_id: string;
  student_id: string;
  month: number;
  year: number;
  amount: number;
  paid: boolean;
  paid_date?: string;
  payment_method?: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  notes?: string;
  student?: Student;
}

export const getWorkshopPayments = async (workshopId: string, month?: number, year?: number): Promise<PaymentRecord[]> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());
  const response = await api.get(`/workshops/${workshopId}/payments?${params.toString()}`);
  return response.data;
};

export const recordPayment = async (workshopId: string, studentId: string, payment: Omit<PaymentRecord, 'id' | 'workshop_id' | 'student_id'>) => {
  const response = await api.post(`/workshops/${workshopId}/payments/student/${studentId}`, payment);
  return response.data;
};

export const updatePayment = async (paymentId: number, payment: Partial<PaymentRecord>) => {
  const response = await api.put(`/workshops/payments/${paymentId}`, payment);
  return response.data;
};

export const initializeMonthPayments = async (workshopId: string, month: number, year: number) => {
  const response = await api.post(`/workshops/${workshopId}/payments/initialize`, { month, year });
  return response.data;
};

export const getPaymentsSummary = async (workshopId: string, year?: number) => {
  const params = year ? `?year=${year}` : '';
  const response = await api.get(`/workshops/${workshopId}/payments/summary${params}`);
  return response.data;
};

// --- Shows API ---

export const getShows = async (): Promise<Show[]> => {
  const response = await api.get('/shows');
  return response.data;
};

export const getShowById = async (id: string): Promise<Show> => {
  const response = await api.get(`/shows/${id}`);
  return response.data;
};

export const createShow = async (show: Omit<Show, 'id'>): Promise<Show> => {
  const response = await api.post('/shows', show);
  return response.data;
};

export const updateShow = async (id: string, show: Partial<Show>): Promise<Show> => {
  const response = await api.put(`/shows/${id}`, show);
  return response.data;
};

// --- Snack Bar & Combos API ---

export const getSnackBarProducts = async (): Promise<SnackBarProduct[]> => {
  const response = await api.get('/snackbar');
  return response.data;
};

export const getSnackBarProductById = async (id: string): Promise<SnackBarProduct> => {
  const response = await api.get(`/snackbar/${id}`);
  return response.data;
};

export const createSnackBarProduct = async (product: Omit<SnackBarProduct, 'id'>): Promise<SnackBarProduct> => {
  const response = await api.post('/snackbar', product);
  return response.data;
};

export const updateSnackBarProduct = async (id: string, product: Partial<SnackBarProduct>): Promise<SnackBarProduct> => {
  const response = await api.put(`/snackbar/${id}`, product);
  return response.data;
};

export const deleteSnackBarProduct = async (id: string): Promise<void> => {
  await api.delete(`/snackbar/${id}`);
};

export const purchaseSnackBarProduct = async (id: string, quantity: number, purchasePrice: number): Promise<SnackBarProduct> => {
  const response = await api.post(`/snackbar/${id}/purchase`, { quantity, purchasePrice });
  return response.data;
};

export const getCombos = async (): Promise<Combo[]> => {
  const response = await api.get('/combos');
  return response.data;
};

export const getComboById = async (id: string): Promise<Combo> => {
  const response = await api.get(`/combos/${id}`);
  return response.data;
};

export const createCombo = async (combo: Omit<Combo, 'id'>): Promise<Combo> => {
  const response = await api.post('/combos', combo);
  return response.data;
};

export const updateCombo = async (id: string, combo: Partial<Combo>): Promise<Combo> => {
  const response = await api.put(`/combos/${id}`, combo);
  return response.data;
};

export const deleteCombo = async (id: string): Promise<void> => {
  await api.delete(`/combos/${id}`);
};

export const confirmSale = async (
  order: OrderItem[],
  tableNumber: number,
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Tarjeta',
  combos: OrderCombo[] = []
) => {
  const standaloneItems = order.filter(item => !item.comboId);
  const response = await api.post('/sales/confirm', {
    order: standaloneItems,
    combos,
    tableNumber,
    paymentMethod,
  });
  return response.data;
};

export const getSalesHistory = async (): Promise<SnackBarSale[]> => {
  const response = await api.get('/sales/history');
  return response.data;
};

// --- Kitchen API ---

export const getKitchenOrders = async (includeDelivered: boolean = false): Promise<KitchenOrder[]> => {
  const response = await api.get(`/kitchen${includeDelivered ? '?includeDelivered=true' : ''}`);
  return response.data;
};

export const updateOrderStatus = async (orderId: number, status: 'pendiente' | 'listo' | 'entregado'): Promise<KitchenOrder> => {
  const response = await api.patch(`/kitchen/${orderId}/status`, { status });
  return response.data;
};

export const updateKitchenItemStatus = async (itemId: number, status: 'pendiente' | 'listo' | 'entregado') => {
  const response = await api.patch(`/kitchen/items/${itemId}/status`, { status });
  return response.data;
};
