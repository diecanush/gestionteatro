import axios from 'axios';
import { Workshop, Student, Show, SnackBarProduct, SnackBarProductCategory, SnackBarProductDelivery, KitchenOrder } from '../types';

const API_BASE_URL = 'http://69.62.95.248:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// --- MOCK DATA (to be replaced with API calls) ---
// The data for Shows and Snack Bar is still mocked until those endpoints are built.
let mockShows: Show[] = [
    {
        id: 'sh1',
        title: 'La Noche Estrellada',
        description: 'Una obra sobre los sueños y las constelaciones.',
        producer: 'Compañía Onírica',
        date: '2024-08-17',
        time: '21:00',
        hasBar: true,
        capacity: 80,
        availableSeats: 55,
        posterUrl: 'https://picsum.photos/400/600?random=1',
        promoText: '2x1 para estudiantes.',
        doorPrice: 10000,
        advancePrice: 8000,
        hasPromo: true,
        promoName: '2x1 Estudiantes',
        promoPrice: 8000,
    },
    {
        id: 'sh2',
        title: 'Monólogos de la Vagina',
        description: 'Un clásico del teatro contemporáneo.',
        producer: 'Las Actrices',
        date: '2024-08-24',
        time: '22:00',
        hasBar: true,
        capacity: 80,
        availableSeats: 20,
        posterUrl: 'https://picsum.photos/400/600?random=2',
        promoText: 'Jubilados 50% de descuento.',
        doorPrice: 9000,
        advancePrice: 7500,
        hasPromo: false,
    },
];

let mockProducts: SnackBarProduct[] = [
    { id: 'p1', name: 'Quilmes', category: SnackBarProductCategory.Beer, size: '1L', purchasePrice: 800, sellPrice: 2000, stock: 50, delivery: SnackBarProductDelivery.Bar },
    { id: 'p2', name: 'Coca-Cola', category: SnackBarProductCategory.Soda, size: '500ml', purchasePrice: 400, sellPrice: 1000, stock: 80, delivery: SnackBarProductDelivery.Bar },
    { id: 'p3', name: 'Agua sin gas', category: SnackBarProductCategory.Water, size: '500ml', purchasePrice: 300, sellPrice: 800, stock: 100, delivery: SnackBarProductDelivery.Bar },
    { id: 'p4', name: 'Pizza Muzzarella', category: SnackBarProductCategory.Pizza, purchasePrice: 2000, sellPrice: 6000, stock: 20, delivery: SnackBarProductDelivery.Kitchen, canBeHalf: true, halfPrice: 3500 },
    { id: 'p5', name: 'Pizza Fugazzeta', category: SnackBarProductCategory.Pizza, purchasePrice: 2200, sellPrice: 6500, stock: 15, delivery: SnackBarProductDelivery.Kitchen, canBeHalf: true, halfPrice: 3800 },
    { id: 'p6', name: 'Empanada Carne', category: SnackBarProductCategory.Empanada, purchasePrice: 400, sellPrice: 1000, stock: 60, delivery: SnackBarProductDelivery.Kitchen },
    { id: 'p7', name: 'Empanada J&Q', category: SnackBarProductCategory.Empanada, purchasePrice: 400, sellPrice: 1000, stock: 60, delivery: SnackBarProductDelivery.Kitchen },
    { id: 'p8', name: 'Fernet con Coca', category: SnackBarProductCategory.Cocktail, purchasePrice: 1000, sellPrice: 2500, stock: 999, delivery: SnackBarProductDelivery.Bar },
    { id: 'p9', name: 'Papas Fritas', category: SnackBarProductCategory.Snack, size: 'Porción', purchasePrice: 500, sellPrice: 1500, stock: 30, delivery: SnackBarProductDelivery.Kitchen },
];
// --- END MOCK DATA ---

const simulateDelay = <T,>(data: T): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(data), 500));
    
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


// --- Shows & Snack Bar (Still Mocked) ---
export const getShows = async (): Promise<Show[]> => {
    const response = await api.get('/shows');
    return response.data;
};

export const getShowById = async (id: string): Promise<Show> => {
    const response = await api.get(`/shows/${id}`);
    return response.data;
};

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

export const confirmSale = async (order: OrderItem[], tableNumber: number) => {
    const response = await api.post('/sales/confirm', { order, tableNumber });
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