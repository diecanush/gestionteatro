
import React, { useState } from 'react';

import Modal from '../../components/Modal';

interface TableNumberModalProps {
    isOpen: boolean;

    onSelect: (number: number, customerName?: string) => void;

}

const TableNumberModal: React.FC<TableNumberModalProps> = ({ isOpen, onSelect }) => {
    const numbers = Array.from({ length: 20 }, (_, i) => i + 1);


    return (
        <Modal isOpen={isOpen} onClose={() => {}} title="Seleccionar mesa" hideCloseButton>

            <div className="grid grid-cols-5 gap-4">
                {numbers.map(num => (
                    <button
                        key={num}

                        onClick={() => { onSelect(num); setCustomerName(''); }}

                        className="bg-gray-200 hover:bg-gray-300 dark:bg-brand-blue dark:hover:bg-opacity-80 text-gray-800 dark:text-white font-bold py-3 rounded-lg"
                    >
                        {num}
                    </button>
                ))}
            </div>

            <button
                onClick={() => { onSelect(0, customerName); setCustomerName(''); }}
                className="mt-4 w-full bg-gray-200 hover:bg-gray-300 dark:bg-brand-blue dark:hover:bg-opacity-80 text-gray-800 dark:text-white font-bold py-3 rounded-lg"
            >
                Barra
            </button>

        </Modal>
    );
};

export default TableNumberModal;
