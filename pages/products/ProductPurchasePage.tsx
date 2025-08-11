import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SnackBarProduct } from '../../types';
import { getSnackBarProducts, purchaseSnackBarProduct } from '../../services/api';

const ProductPurchasePage: React.FC = () => {
  const [products, setProducts] = useState<SnackBarProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSnackBarProducts()
      .then(setProducts)
      .catch(() => setError('Error al cargar los productos.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    try {
      setLoading(true);
      await purchaseSnackBarProduct(selectedProductId, quantity, purchasePrice);
      setMessage('Stock actualizado correctamente.');
      setError(null);
      setQuantity(0);
      setPurchasePrice(0);
    } catch (err) {
      setError('Error al actualizar el stock.');
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-brand-dark min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">Compras</h1>
      {message && <p className="text-green-500 bg-green-100 p-3 rounded-md">{message}</p>}
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-brand-navy p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Producto:</label>
            <select
              id="product"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent dark:bg-brand-dark dark:border-gray-600 dark:text-white"
            >
              <option value="">Seleccionar...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Link to="/products/new" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Crear nuevo producto</Link>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent dark:bg-brand-dark dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio de Compra:</label>
            <input
              type="number"
              step="0.01"
              id="purchasePrice"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(parseFloat(e.target.value))}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent dark:bg-brand-dark dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Actualizar Stock'}
        </button>
      </form>
    </div>
  );
};

export default ProductPurchasePage;
