import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SnackBarProduct, SnackBarProductCategory, SnackBarProductDelivery } from '../types';
import { getSnackBarProductById, createSnackBarProduct, updateSnackBarProduct } from '../services/api';

const ProductForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Partial<SnackBarProduct>>({
        name: '',
        category: SnackBarProductCategory.Bebida,
        purchasePrice: 0,
        sellPrice: 0,
        stock: 0,
        delivery: SnackBarProductDelivery.Bar,
        canBeHalf: false,
        halfPrice: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getSnackBarProductById(id)
                .then(data => {
                    setProduct(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError('Error al cargar el producto.');
                    setLoading(false);
                });
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (id) {
                const { id: productId, createdAt, updatedAt, ...updateData } = product as SnackBarProduct;
                await updateSnackBarProduct(id, updateData);
            } else {
                await createSnackBarProduct(product as Omit<SnackBarProduct, 'id'>);
            }
            navigate('/products');
        } catch (err) {
            setError('Error al guardar el producto.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-brand-dark min-h-screen">
            <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">{id ? 'Editar Producto' : 'Nuevo Producto'}</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
            {loading && <p className="text-gray-700 dark:text-gray-300">Cargando...</p>}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-brand-navy p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre:</label>
                        <input type="text" name="name" id="name" value={product.name || ''} onChange={handleChange} required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent dark:bg-brand-dark dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría:</label>
                        <select name="category" id="category" value={product.category || ''} onChange={handleChange} required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent dark:bg-brand-dark dark:border-gray-600 dark:text-white">
                            {Object.values(SnackBarProductCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio de Compra:</label>
                        <input type="number" name="purchasePrice" id="purchasePrice" value={product.purchasePrice || 0} onChange={handleChange} required step="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent dark:bg-brand-dark dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio de Venta:</label>
                        <input type="number" name="sellPrice" id="sellPrice" value={product.sellPrice || 0} onChange={handleChange} required step="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent dark:bg-brand-dark dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock:</label>
                        <input type="number" name="stock" id="stock" value={product.stock || 0} onChange={handleChange} required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent dark:bg-brand-dark dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="delivery" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Entrega:</label>
                        <select name="delivery" id="delivery" value={product.delivery || ''} onChange={handleChange} required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent dark:bg-brand-dark dark:border-gray-600 dark:text-white">
                            {Object.values(SnackBarProductDelivery).map(del => (
                                <option key={del} value={del}>{del}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" name="canBeHalf" id="canBeHalf" checked={product.canBeHalf || false} onChange={handleChange}
                            className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300 rounded dark:bg-brand-dark dark:border-gray-600" />
                        <label htmlFor="canBeHalf" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Puede ser por Mitad</label>
                    </div>
                    {product.canBeHalf && (
                        <div>
                            <label htmlFor="halfPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio por Mitad:</label>
                            <input type="number" name="halfPrice" id="halfPrice" value={product.halfPrice || 0} onChange={handleChange} step="0.01"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent dark:bg-brand-dark dark:border-gray-600 dark:text-white" />
                        </div>
                    )}
                </div>
                <div className="mt-6">
                    <button type="submit" disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {loading ? 'Guardando...' : 'Guardar Producto'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
