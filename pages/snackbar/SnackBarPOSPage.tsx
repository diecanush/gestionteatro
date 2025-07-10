
import React, { useState, useEffect } from 'react';
import { SnackBarProduct, OrderItem, SnackBarProductDelivery } from '../../types';
import { getSnackBarProducts, confirmSale } from '../../services/api';
import Modal from '../../components/Modal';

const SnackBarPOSPage: React.FC = () => {
    const [products, setProducts] = useState<SnackBarProduct[]>([]);
    const [order, setOrder] = useState<OrderItem[]>([]);
    const [tableNumber, setTableNumber] = useState<number | ''>(0); // New state for table number
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pizzaToAdd, setPizzaToAdd] = useState<SnackBarProduct | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const data = await getSnackBarProducts();
            setProducts(data);
            setLoading(false);
        };
        fetchProducts();
    }, []);
    
    const addToOrder = (product: SnackBarProduct, isHalf: boolean = false) => {
        const price = isHalf && product.halfPrice ? product.halfPrice : product.sellPrice;
        const existingItemIndex = order.findIndex(item => item.productId === product.id && item.isHalf === isHalf);
        
        if (existingItemIndex > -1) {
            const newOrder = [...order];
            newOrder[existingItemIndex].quantity++;
            newOrder[existingItemIndex].totalPrice = newOrder[existingItemIndex].quantity * newOrder[existingItemIndex].unitPrice;
            setOrder(newOrder);
        } else {
            const newItem: OrderItem = {
                productId: product.id,
                productName: product.name + (isHalf ? ' (1/2)' : ''),
                quantity: 1,
                unitPrice: price,
                totalPrice: price,
                isHalf: isHalf,
                delivery: product.delivery,
            };
            setOrder([...order, newItem]);
        }
    };
    
    const handleProductClick = (product: SnackBarProduct) => {
        if(product.canBeHalf) {
            setPizzaToAdd(product);
            setIsModalOpen(true);
        } else {
            addToOrder(product);
        }
    };
    
    const handlePizzaSelection = (isHalf: boolean) => {
        if(pizzaToAdd) {
            addToOrder(pizzaToAdd, isHalf);
        }
        setIsModalOpen(false);
        setPizzaToAdd(null);
    };

    const handleConfirmSale = async () => {
        if (order.length === 0) return;
        if (tableNumber === '') {
            alert("Por favor, ingrese un número de mesa válido.");
            return;
        }
        try {
            const result = await confirmSale(order.map(item => ({ ...item, isHalf: item.isHalf || false })), tableNumber as number);
            alert(result.message); // Simulate success
            // In a real app, you would print receipts/commandas here
            console.log("Comanda Cocina:", order.filter(i => i.delivery === SnackBarProductDelivery.Kitchen));
            console.log("Ticket Barra:", order.filter(i => i.delivery === SnackBarProductDelivery.Bar));
            setOrder([]);
        } catch (error) {
            alert("Error al confirmar la venta.");
        }
    };

    const total = order.reduce((sum, item) => sum + item.totalPrice, 0);

    const categories = [...new Set(products.map(p => p.category))];

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-screen lg:max-h-[calc(100vh-140px)]">
            {/* Products */}
            <div className="flex-grow lg:w-2/3 w-full bg-white dark:bg-brand-navy p-4 rounded-lg shadow-lg overflow-y-auto lg:h-auto h-2/3">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Productos</h3>
                {loading ? <p className="text-gray-700 dark:text-gray-300">Cargando...</p> : (
                    <div className="space-y-6">
                        {categories.map(category => (
                             <div key={category}>
                                 <h4 className="text-lg font-semibold text-brand-accent mb-2">{category}</h4>
                                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {products.filter(p => p.category === category).map(product => (
                                    <button key={product.id} onClick={() => handleProductClick(product)}
                                        className="bg-gray-100 dark:bg-brand-blue text-left p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent">
                                        <p className="font-bold text-gray-800 dark:text-white">{product.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">${product.sellPrice.toLocaleString()}</p>
                                    </button>
                                ))}
                                 </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order */}
            <div className="lg:w-1/3 w-full bg-white dark:bg-brand-navy p-4 rounded-lg shadow-lg flex flex-col lg:h-auto h-1/3">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Pedido Actual</h3>
                    <div className="flex items-center">
                        <label htmlFor="tableNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Mesa:</label>
                        <input
                            type="number"
                            id="tableNumber"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm dark:bg-brand-dark dark:border-gray-600 dark:text-white text-center"
                            placeholder="#"
                        />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    {order.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center mt-10">Agregue productos al pedido.</p>
                    ) : (
                        <ul className="space-y-2">
                            {order.map((item, index) => (
                                <li key={index} className="flex justify-between items-center bg-gray-100 dark:bg-brand-dark p-2 rounded">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">{item.productName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.quantity} x ${item.unitPrice.toLocaleString()}</p>
                                    </div>
                                    <p className="font-bold text-lg text-gray-800 dark:text-white">${item.totalPrice.toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-brand-blue">
                    <div className="flex justify-between items-center text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                        <span>TOTAL:</span>
                        <span className="text-brand-accent">${total.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setOrder([])} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors">Limpiar</button>
                        <button onClick={handleConfirmSale} disabled={order.length === 0} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">Cobrar</button>
                    </div>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Seleccionar opción para ${pizzaToAdd?.name}`}>
                <div className="p-4 text-center">
                    <p className="mb-6 text-lg text-gray-800 dark:text-white">¿Desea la pizza entera o por mitad?</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => handlePizzaSelection(false)} className="bg-gray-200 hover:bg-gray-300 dark:bg-brand-blue dark:hover:bg-opacity-80 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-lg">Entera (${pizzaToAdd?.sellPrice.toLocaleString()})</button>
                        <button onClick={() => handlePizzaSelection(true)} className="bg-gray-200 hover:bg-gray-300 dark:bg-brand-blue dark:hover:bg-opacity-80 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-lg">Mitad (${pizzaToAdd?.halfPrice?.toLocaleString()})</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SnackBarPOSPage;