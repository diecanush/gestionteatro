import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { SnackBarCombo, SnackBarProduct } from '../../types';

interface ComboModalProps {
    isOpen: boolean;
    combo: SnackBarCombo | null;
    products: SnackBarProduct[];
    onConfirm: (selection: { [componentId: string]: string }) => void;
    onClose: () => void;
}

const ComboModal: React.FC<ComboModalProps> = ({ isOpen, combo, products, onConfirm, onClose }) => {
    const [selected, setSelected] = useState<{ [componentId: string]: string }>({});

    useEffect(() => {
        if (isOpen) {
            setSelected({});
        }
    }, [isOpen]);

    if (!isOpen || !combo) return null;

    const handleSelect = (componentId: string, productId: string) => {
        setSelected(prev => ({ ...prev, [componentId]: productId }));
    };

    const allSelected = combo.components.every(c => selected[c.id]);

    const confirm = () => {
        if (allSelected) {
            onConfirm(selected);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={combo.name}>
            {combo.components.map(component => (
                <div key={component.id} className="mb-4">
                    <p className="font-semibold mb-2 text-gray-800 dark:text-white">{component.name}</p>
                    <div className="grid grid-cols-2 gap-2">
                        {products
                            .filter(p => component.options.includes(p.id))
                            .map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSelect(component.id, p.id)}
                                    className={`p-2 rounded border text-left ${
                                        selected[component.id] === p.id
                                            ? 'bg-brand-accent text-white'
                                            : 'bg-gray-100 dark:bg-brand-blue text-gray-800 dark:text-white'
                                    }`}
                                >
                                    {p.name}
                                </button>
                            ))}
                    </div>
                </div>
            ))}
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
