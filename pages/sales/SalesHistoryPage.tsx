import React, { useState, useEffect } from 'react';
import { getSalesHistory } from '../../services/api';
import { SnackBarSale } from '../../types';

const SalesHistoryPage: React.FC = () => {
    const [sales, setSales] = useState<SnackBarSale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                const data = await getSalesHistory();
                setSales(data);
            } catch (error) {
                console.error("Error fetching sales history:", error);
            }
            setLoading(false);
        };
        fetchSales();
    }, []);

    const salesByDay = sales.reduce((acc, sale) => {
        const date = new Date(sale.saleDate).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(sale);
        return acc;
    }, {} as Record<string, SnackBarSale[]>);

    return (
        <div className="p-6 bg-gray-50 dark:bg-brand-dark-blue min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Historial de Ventas del Snack Bar</h1>
            {loading ? (
                <p className="text-center text-gray-600 dark:text-gray-300">Cargando historial...</p>
            ) : (
                <div className="space-y-8">
                    {Object.keys(salesByDay).map(date => (
                        <div key={date}>
                            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b pb-2">{date}</h2>
                            <div className="space-y-4">
                                {salesByDay[date].map(sale => (
                                    <div key={sale.id} className="bg-white dark:bg-brand-navy p-4 rounded-lg shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-lg text-brand-accent">Venta #{sale.id}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(sale.saleDate).toLocaleTimeString()}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Método de Pago: {sale.paymentMethod}</p>
                                            </div>
                                            <p className="font-bold text-xl text-gray-800 dark:text-white">Total: ${Number(sale.total).toLocaleString()}</p>
                                        </div>
                                        <div className="mt-4 border-t pt-2">
                                            <h4 className="font-semibold text-gray-600 dark:text-gray-300">Artículos:</h4>
                                            <ul className="list-disc list-inside pl-2 mt-2 text-sm text-gray-700 dark:text-gray-300">
                                                {sale.items.map(item => (
                                                    <li key={item.id}>{item.productName} x{item.quantity} - ${Number(item.totalPrice).toLocaleString()}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SalesHistoryPage;
