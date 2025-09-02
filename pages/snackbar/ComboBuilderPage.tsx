import React, { useEffect, useState } from 'react';
import { Combo, ComboComponent, SnackBarProduct } from '../../types';
import { getCombos, createCombo, updateCombo, getSnackBarProducts } from '../../services/api';

const emptyComponent = (): ComboComponent => ({ name: '', productIds: [] });

const ComboBuilderPage: React.FC = () => {
    const [products, setProducts] = useState<SnackBarProduct[]>([]);
    const [combos, setCombos] = useState<Combo[]>([]);
    const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
    const [name, setName] = useState('');
    const [components, setComponents] = useState<ComboComponent[]>([]);

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

    const updateComponent = (index: number, updated: Partial<ComboComponent>) => {
        const newComponents = [...components];
        newComponents[index] = { ...newComponents[index], ...updated };
        setComponents(newComponents);
    };

    const removeComponent = (index: number) => {
        setComponents(components.filter((_, i) => i !== index));
    };

    const handleSelectChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const values = Array.from(e.target.selectedOptions).map(o => o.value);
        updateComponent(index, { productIds: values });
    };

    const resetForm = () => {
        setEditingCombo(null);
        setName('');
        setComponents([]);
    };

    const handleSubmit = async () => {
        const comboData = { name, components };
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
        setComponents(combo.components.map(c => ({ name: c.name, productIds: c.productIds })));
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
                {components.map((component, idx) => (
                    <div key={idx} className="border rounded p-3 mb-4">
                        <input
                            className="w-full p-2 border rounded mb-2"
                            placeholder="Nombre del componente"
                            value={component.name}
                            onChange={e => updateComponent(idx, { name: e.target.value })}
                        />
                        <select
                            multiple
                            className="w-full border rounded p-2 h-32"
                            value={component.productIds}
                            onChange={e => handleSelectChange(idx, e)}
                        >
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
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
