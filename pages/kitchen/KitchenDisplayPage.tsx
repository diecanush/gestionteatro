import React, { useState, useEffect } from 'react';
import { getKitchenOrders, updateOrderStatus } from '../../services/api';
import { KitchenOrder, KitchenOrderItem } from '../../types';
import { Card } from '../../components/Card';
import { Tag, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const OrderCard = ({ order, onStatusChange }: { order: KitchenOrder, onStatusChange: (id: number, status: 'listo' | 'entregado') => void }) => {

    const getStatusColor = () => {
        switch (order.status) {
            case 'pendiente': return 'bg-yellow-500';
            case 'listo': return 'bg-green-500';
            default: return 'bg-gray-400';
        }
    };

    const handleNextStatus = () => {
        if (order.status === 'pendiente') {
            onStatusChange(order.id, 'listo');
        } else if (order.status === 'listo') {
            onStatusChange(order.id, 'entregado');
        }
    };

    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        const calculateTimeAgo = () => {
                const now = new Date().getTime();
                const createdAt = new Date(order.created_at + 'Z').getTime();
                const seconds = Math.floor((now - createdAt) / 1000);

                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                if (seconds < 60) {
                    setTimeAgo(Math.floor(seconds) + " seg");
                } else if (minutes < 60) {
                    setTimeAgo(minutes + " min");
                } else if (hours < 24) {
                    setTimeAgo(hours + " hs");
                } else if (days < 30) {
                    setTimeAgo(days + " días");
                } else {
                    setTimeAgo(Math.floor(days / 30) + " meses");
                }
            };

        calculateTimeAgo();
        const interval = setInterval(calculateTimeAgo, 1000); // Update every second
        return () => clearInterval(interval);
    }, [order.created_at]);

    return (
        <div className={`border-l-8 ${getStatusColor()} rounded-lg shadow-lg p-4 flex flex-col justify-between h-full bg-white dark:bg-brand-navy`}>
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Mesa #{order.table_number}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock size={14} className="mr-1 text-gray-600 dark:text-gray-400" /> {timeAgo} atrás
                    </span>
                </div>
                <ul className="space-y-2">
                    {order.items.map((item: KitchenOrderItem) => (
                        <li key={item.id} className="flex items-center text-lg text-gray-800 dark:text-white">
                            <Tag size={16} className="mr-2 text-gray-600 dark:text-gray-400" />
                            <span className="font-semibold mr-2">{item.quantity}x</span>
                            <span>{item.product.name}{item.ishalf ? ' (1/2)' : ''}</span>
                        </li>
                    ))}
                </ul>
            </div>
            {order.status !== 'entregado' && (
                 <button 
                    onClick={handleNextStatus}
                    className={`mt-4 w-full py-2 px-4 rounded-md text-white font-semibold flex items-center justify-center transition-colors 
                        ${order.status === 'pendiente' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                    {order.status === 'pendiente' ? 'Marcar como Listo' : 'Marcar como Entregado'}
                    {order.status === 'pendiente' ? <CheckCircle size={20} className="ml-2"/> : <ArrowRight size={20} className="ml-2"/>}
                </button>
            )}
        </div>
    );
};

export const KitchenDisplayPage = () => {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchOrders = async () => {
        try {
            const activeOrders = await getKitchenOrders();
            setOrders(activeOrders.filter(o => o.status !== 'entregado'));
        } catch (err) {
            setError('No se pudieron cargar las comandas. Intente de nuevo.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOrders(); // Initial fetch
        const interval = setInterval(fetchOrders, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const handleStatusChange = async (id: number, status: 'listo' | 'entregado') => {
        try {
            await updateOrderStatus(id, status);
            // Optimistically update UI
            setOrders(prevOrders => prevOrders.map(o => o.id === id ? { ...o, status } : o).filter(o => o.status !== 'entregado'));
        } catch (err) {
            setError('No se pudo actualizar la comanda.');
            console.error(err);
        }
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-brand-dark min-h-screen">
            <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">Comandas de Cocina</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-10">
                        <p className="text-2xl text-gray-500 dark:text-gray-400">No hay comandas pendientes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
