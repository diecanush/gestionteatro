
export enum Page {
  Dashboard = 'DASHBOARD',
  Workshops = 'WORKSHOPS',
  Shows = 'SHOWS',
  SnackBar = 'SNACK_BAR',
}

export interface Student {
  id: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  phone: string;
  email: string;
}

export interface Workshop {
  id: string;
  name: string;
  schedule: string;
  startDate: string;
  endDate: string;
  teacher: string;
  fee: number;
  students: Student[];
}

export interface Show {
  id: string;
  title: string;
  description: string;
  producer: string;
  date: string;
  time: string;
  hasBar: boolean;
  capacity: number;
  availableSeats: number;
  posterUrl: string;
  promoText: string;
  doorPrice: number;
  advancePrice: number;
  hasPromo: boolean;
  promoName?: string;
  promoPrice?: number;
}

export enum SnackBarProductCategory {
  Beer = "Cerveza",
  Soda = "Gaseosa",
  Water = "Agua",
  FlavoredWater = "Agua Saborizada",
  Pizza = "Pizza",
  Empanada = "Empanada",
  Cocktail = "Trago",
  Snack = "Snack",
}

export enum SnackBarProductDelivery {
    Bar = "Barra",
    Kitchen = "Cocina",
}

export interface SnackBarProduct {
    id: string;
    name: string;
    category: SnackBarProductCategory;
    brand?: string;
    size?: string;
    purchasePrice: number;
    sellPrice: number;
    stock: number;
    delivery: SnackBarProductDelivery;
    canBeHalf?: boolean;
    halfPrice?: number;
}

export interface SnackBarComboComponent {
    id: string;
    name: string;
    options: string[]; // product IDs allowed for this component
}

export interface SnackBarCombo {
    id: string;
    name: string;
    price: number;
    components: SnackBarComboComponent[];
}

export interface OrderCombo {
    comboId: string;
    comboName: string;
    price: number;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isHalf?: boolean;
    delivery: SnackBarProductDelivery;
    comboId?: string;
}

export interface TicketSale {
    id: string;
    showId: string;
    buyerName: string;
    buyerPhone: string;
    quantity: number;
    paymentMethod: 'Efectivo' | 'Transferencia' | 'Tarjeta';
    proofOfPayment?: string;
    bank?: string;
    purchaseDate: string;
}

export interface KitchenOrderItem {
  id: number;
  quantity: number;
  price_at_sale: string;
  status: 'pendiente' | 'listo' | 'entregado';
  ishalf?: boolean; // Added this line
  product: {
    name: string;
  };
}

export interface KitchenOrder {
  id: number;
  table_number: number;
  status: 'pendiente' | 'listo' | 'entregado';
  created_at: string;
  items: KitchenOrderItem[];
}

export interface SnackBarSaleItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SnackBarSale {
  id: number;
  total: number;
  saleDate: string;
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  items: SnackBarSaleItem[];
}


export interface ComboComponent {
  id?: number;
  name: string;
  productIds: string[];
}

export interface Combo {
  id?: number;
  name: string;
  components: ComboComponent[];

}
