import React, { useState } from 'react';
import Modal from '../../components/Modal';

interface TableNumberModalProps {
    isOpen: boolean;
    onSelect: (number: number, customerName?: string) => void;
}

const TableNumberModal: React.FC<TableNumberModalProps> = ({ isOpen, onSelect }) => {
    const numbers = Array.from({ length: 20 }, (_, i) => i + 1);
    const [customerName, setCustomerName] = useState('');

    const handleSelect = (num: number) => {
        onSelect(num, num === 0 ? customerName : undefined);
        setCustomerName('');
    };

    return (
        <Modal isOpen={isOpen} onClose={() => {}} title="Seleccionar mesa" hideCloseButton>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Nombre del cliente (opcional)"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full p-2 border rounded bg-white dark:bg-brand-blue text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-300"
                />
            </div>
            <div className="grid grid-cols-5 gap-4">
                {numbers.map(num => (
                    <button
                        key={num}
                        onClick={() => handleSelect(num)}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-brand-blue dark:hover:bg-opacity-80 text-gray-800 dark:text-white font-bold py-3 rounded-lg"
                    >
                        {num}
                    </button>
                ))}
            </div>
            <button
                onClick={() => handleSelect(0)}
                className="mt-4 w-full bg-gray-200 hover:bg-gray-300 dark:bg-brand-blue dark:hover:bg-opacity-80 text-gray-800 dark:text-white font-bold py-3 rounded-lg"
            >
                Barra
            </button>
        </Modal>
    );
};

export default TableNumberModal;
