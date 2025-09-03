import React, { useEffect, useState } from 'react';
import {
    Combo,
    ComboComponent,
    SnackBarProduct,
    SnackBarProductCategory,
} from '../../types';
import {
    getCombos,
    createCombo,
    updateCombo,
    getSnackBarProducts,
} from '../../services/api';

type ComponentState = ComboComponent & {
    selectionType: 'category' | 'product';
};

const emptyComponent = (): ComponentState => ({
    name: '',
    quantity: 1,
    productIds: [],
    categories: [],
    selectionType: 'category',
});

const ComboBuilderPage: React.FC = () => {
    const [products, setProducts] = useState<SnackBarProduct[]>([]);
    const [combos, setCombos] = useState<Combo[]>([]);
    const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [components, setComponents] = useState<ComponentState[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [prodData, comboData] = await Promise.all([
                getSnackBarProducts(),
                getCombos(),
            ]);
            setProducts(prodData);
            setCombos(comboData);
        };
        fetchData();
    }, []);

    const addComponent = () => setComponents([...components, emptyComponent()]);

    const updateComponent = (index: number, updated: Partial<ComponentState>) => {
        const newComponents = [...components];
        newComponents[index] = { ...newComponents[index], ...updated };
        setComponents(newComponents);
    };

    const removeComponent = (index: number) => {
        setComponents(components.filter((_, i) => i !== index));
    };

    const handleCategoryChange = (
        index: number,
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const categories = Array.from(e.target.selectedOptions).map(
            o => o.value as SnackBarProductCategory,
        );
        const productIds = products
            .filter(p => categories.includes(p.category))
            .map(p => p.id);
        updateComponent(index, { categories, productIds });
    };

    const handleProductChange = (
        index: number,
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const productIds = Array.from(e.target.selectedOptions).map(o => o.value);
        updateComponent(index, { productIds });
    };

    const handleSelectionTypeChange = (
        index: number,
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const selectionType = e.target.value as 'category' | 'product';
        updateComponent(index, {
            selectionType,
            categories: [],
            productIds: [],
        });
    };

    const resetForm = () => {
        setEditingCombo(null);
        setName('');
        setPrice(0);
        setComponents([]);
    };

    const handleSubmit = async () => {
        const comboData = {
            name,
            price,
            components: components.map(c => ({
                name: c.name,
                quantity: c.quantity,
                productIds:
                    c.selectionType === 'category'
                        ? products
                              .filter(p => c.categories?.includes(p.category))
                              .map(p => p.id)
                        : c.productIds,
            })),
        };
        if (editingCombo && editingCombo.id) {
            await updateCombo(editingCombo.id, comboData);
        } else {
            await createCombo(comboData);
        }
        const comboList = await getCombos();
        setCombos(comboList);
        resetForm();
    };

    const handleEdit = (combo: Combo) => {
        setEditingCombo(combo);
        setName(combo.name);
        setPrice(combo.price);
        setComponents(
            combo.components.map(c => {
                const categories = Array.from(
                    new Set(
                        products
                            .filter(p => c.productIds.includes(p.id))
                            .map(p => p.category),
                    ),
                ) as SnackBarProductCategory[];
                const allCategoryProducts = products
                    .filter(p => categories.includes(p.category))
                    .map(p => p.id);
                const isCategorySelection =
                    allCategoryProducts.length === c.productIds.length &&
                    allCategoryProducts.every(id => c.productIds.includes(id));
                return {
                    name: c.name,
                    quantity: c.quantity ?? 1,
                    productIds: c.productIds,
                    categories: isCategorySelection ? categories : [],
                    selectionType: isCategorySelection ? 'category' : 'product',
                };
            }),
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{editingCombo ? 'Editar Combo' : 'Nuevo Combo'}</h2>
            <div className="bg-white dark:bg-brand-navy p-4 rounded shadow mb-6">
                <input
                    className="w-full p-2 border rounded mb-4"
                    placeholder="Nombre del combo"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <input
                    type="number"
                    className="w-full p-2 border rounded mb-4"
                    placeholder="Precio del combo"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                />
                {components.map((component, idx) => (
                    <div key={idx} className="border rounded p-3 mb-4">
                        <input
                            className="w-full p-2 border rounded mb-2"
                            placeholder="Nombre del componente"
                            value={component.name}
                            onChange={e => updateComponent(idx, { name: e.target.value })}
                        />
                        <input
                            type="number"
                            min={1}
                            className="w-full p-2 border rounded mb-2"
                            placeholder="Cantidad"
                            value={component.quantity}
                            onChange={e =>
                                updateComponent(idx, {
                                    quantity: Number(e.target.value),
                                })
                            }
                        />
                        <select
                            className="w-full border rounded p-2 mb-2"
                            value={component.selectionType}
                            onChange={e => handleSelectionTypeChange(idx, e)}
                        >
                            <option value="category">Categorías</option>
                            <option value="product">Productos</option>
                        </select>
                        {component.selectionType === 'category' ? (
                            <select
                                multiple
                                className="w-full border rounded p-2 h-32 mb-2"
                                value={component.categories}
                                onChange={e => handleCategoryChange(idx, e)}
                            >
                                {Object.values(SnackBarProductCategory).map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <select
                                multiple
                                className="w-full border rounded p-2 h-32 mb-2"
                                value={component.productIds}
                                onChange={e => handleProductChange(idx, e)}
                            >
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <button
                            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                            onClick={() => removeComponent(idx)}
                        >
                            Eliminar
                        </button>
                    </div>
                ))}
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={addComponent}
                >
                    Agregar componente
                </button>
                <div className="mt-4 flex gap-2">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        onClick={handleSubmit}
                    >
                        {editingCombo ? 'Actualizar' : 'Crear'}
                    </button>
                    {editingCombo && (
                        <button
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                            onClick={resetForm}
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Combos existentes</h2>
            <ul>
                {combos.map(combo => (
                    <li key={combo.id} className="flex justify-between items-center bg-gray-200 dark:bg-brand-blue p-2 rounded mb-2">
                        <span>{combo.name}</span>
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                            onClick={() => handleEdit(combo)}
                        >
                            Editar
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ComboBuilderPage;
