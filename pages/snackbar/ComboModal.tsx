import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { SnackBarCombo, SnackBarProduct } from '../../types';

interface ComboModalProps {
    isOpen: boolean;
    combo: SnackBarCombo | null;
    products: SnackBarProduct[];
    onConfirm: (
        selection: {
            [componentId: string]: { productId: string; quantity: number }[];
        },
    ) => void;
    onClose: () => void;
}

const ComboModal: React.FC<ComboModalProps> = ({
    isOpen,
    combo,
    products,
    onConfirm,
    onClose,
}) => {
    const [selected, setSelected] = useState<{
        [componentId: string]: string[];
    }>({});

    useEffect(() => {
        if (isOpen) {
            setSelected({});
        }
    }, [isOpen]);

    if (!isOpen || !combo) return null;

    const handleChange = (
        componentId: string,
        productId: string,
        delta: 1 | -1,
        limit: number,
    ) => {
        setSelected(prev => {
            const current = prev[componentId] || [];
            if (delta === 1) {
                if (current.length >= limit) return prev;
                return { ...prev, [componentId]: [...current, productId] };
            } else {
                const index = current.indexOf(productId);
                if (index === -1) return prev;
                const newArr = [...current];
                newArr.splice(index, 1);
                return { ...prev, [componentId]: newArr };
            }
        });
    };

    const allSelected = combo.components.every(
        c => (selected[c.id]?.length || 0) === (c.quantity || 1),
    );

    const confirm = () => {
        if (!allSelected) return;
        const formatted = Object.fromEntries(
            Object.entries(selected).map(([componentId, ids]) => {
                const counts: { [productId: string]: number } = {};
                ids.forEach(id => {
                    counts[id] = (counts[id] || 0) + 1;
                });
                return [
                    componentId,
                    Object.entries(counts).map(([productId, quantity]) => ({
                        productId,
                        quantity,
                    })),
                ];
            }),
        );
        onConfirm(formatted);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={combo.name}>
            {combo.components.map(component => {
                const selections = selected[component.id] || [];
                const limit = component.quantity || 1;
                const totalSelected = selections.length;
                return (
                    <div key={component.id} className="mb-4">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-white">
                            {component.name}
                        </p>
                        <div className="space-y-2">
                            {products
                                .filter(p => component.options.includes(p.id))
                                .map(p => {
                                    const count = selections.filter(id => id === p.id).length;
                                    return (
                                        <div
                                            key={p.id}
                                            className="flex items-center justify-between p-2 rounded border bg-gray-100 dark:bg-brand-blue text-gray-800 dark:text-white"
                                        >
                                            <span>{p.name}</span>
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() =>
                                                        handleChange(
                                                            component.id,
                                                            p.id,
                                                            -1,
                                                            limit,
                                                        )
                                                    }
                                                    disabled={count === 0}
                                                    className="px-2 py-1 bg-gray-200 dark:bg-brand-dark rounded disabled:opacity-50"
                                                >
                                                    -
                                                </button>
                                                <span className="px-2">{count}</span>
                                                <button
                                                    onClick={() =>
                                                        handleChange(
                                                            component.id,
                                                            p.id,
                                                            1,
                                                            limit,
                                                        )
                                                    }
                                                    disabled={totalSelected >= limit}
                                                    className="px-2 py-1 bg-gray-200 dark:bg-brand-dark rounded disabled:opacity-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {totalSelected}/{limit} seleccionados
                        </p>
                    </div>
                );
            })}
            <button
                onClick={confirm}
                disabled={!allSelected}
                className="mt-4 w-full bg-brand-accent text-white py-2 rounded disabled:bg-gray-400"
            >
                Agregar Combo
            </button>
        </Modal>
    );
};

export default ComboModal;
