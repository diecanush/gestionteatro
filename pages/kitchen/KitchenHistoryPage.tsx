import React, { useState, useEffect } from 'react';
import { getKitchenOrders } from '../../services/api';
import { KitchenOrder } from '../../types';
import { Clock, Tag } from 'lucide-react';

const KitchenHistoryPage = () => {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                // Fetch all orders, including delivered ones
                const allOrders = await getKitchenOrders(true);
                setOrders(allOrders);
            } catch (err) {
                setError('No se pudo cargar el historial de comandas.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const timeSince = (date: string) => {
        const now = new Date().getTime();
        const createdAt = new Date(date + 'Z').getTime();
        let seconds = Math.floor((now - createdAt) / 1000);

        if (seconds < 0) {
            return "futuro"; // Should not happen with correct server time
        }

        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) {
            return Math.floor(seconds) + " seg";
        } else if (minutes < 60) {
            return minutes + " min";
        } else if (hours < 24) {
            return hours + " hs";
        } else if (days < 30) {
            return days + " días";
        } else {
            return Math.floor(days / 30) + " meses";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendiente': return 'bg-yellow-500';
            case 'listo': return 'bg-green-500';
            case 'entregado': return 'bg-blue-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-brand-dark min-h-screen">
            <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">Historial de Comandas</h1>
            {loading && <p className="text-gray-700 dark:text-gray-300">Cargando historial...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
            
            {!loading && orders.length === 0 && (
                <p className="text-2xl text-gray-500 dark:text-gray-400 text-center py-10">No hay comandas en el historial.</p>
            )}

            <div className="overflow-x-auto bg-white dark:bg-brand-navy rounded-lg shadow-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-brand-dark">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID Comanda</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mesa</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Productos</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tiempo Transcurrido</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Creación</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-brand-navy divide-y divide-gray-200 dark:divide-gray-700">
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.table_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)} text-white capitalize`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    <ul className="list-disc list-inside">
                                        {order.items.map(item => (
                                            <li key={item.id}>{item.quantity}x {item.product.name}{item.ishalf ? ' (1/2)' : ''}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{timeSince(order.created_at)} atrás</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(order.created_at + 'Z').toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KitchenHistoryPage;
