import React, { useState, useEffect } from 'react';
import { SnackBarProduct, SnackBarProductDelivery } from '../../types';
import { getSnackBarProducts, deleteSnackBarProduct } from '../../services/api';
import { Link } from 'react-router-dom';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

const ProductManagementPage: React.FC = () => {
    const [products, setProducts] = useState<SnackBarProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getSnackBarProducts();
            setProducts(data);
        } catch (err) {
            setError('Error al cargar los productos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
            try {
                await deleteSnackBarProduct(id);
                fetchProducts(); // Refresh the list
            } catch (err) {
                setError('Error al eliminar el producto.');
                console.error(err);
            }
        }
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-brand-dark min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Gestión de Productos</h1>
                <Link to="/products/new" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                    <PlusCircle size={20} className="mr-2" /> Nuevo Producto
                </Link>
            </div>

            {loading && <p className="text-gray-700 dark:text-gray-300">Cargando productos...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

            {!loading && products.length === 0 && (
                <p className="text-2xl text-gray-500 dark:text-gray-400 text-center py-10">No hay productos registrados.</p>
            )}

            {!loading && products.length > 0 && (
                <div className="overflow-x-auto bg-white dark:bg-brand-navy rounded-lg shadow-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-brand-dark">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio Venta</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entrega</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-brand-navy divide-y divide-gray-200 dark:divide-gray-700">
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${product.sellPrice.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.delivery}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                                            <Edit size={18} />
                                        </Link>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProductManagementPage;
