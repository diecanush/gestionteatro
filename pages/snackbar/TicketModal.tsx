import React from 'react';
import { SnackBarSale } from '../../types';
import Modal from '../../components/Modal';

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: SnackBarSale;
}

const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, sale }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ticket de Venta #${sale.id}`}>
            <div className="p-4 bg-white text-gray-800 font-mono text-sm">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">Onírico Sur</h2>
                    <p>Comprobante de Venta</p>
                    <p>{new Date(sale.saleDate).toLocaleString()}</p>
                </div>
                <div className="border-t border-b border-dashed border-gray-400 py-2 my-2">
                    {sale.items.map(item => (
                        <div key={item.id} className="flex justify-between">
                            <span>{item.productName} x{item.quantity}</span>
                            <span>${Number(item.totalPrice).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
                <div className="text-right font-bold text-lg">
                    <p>TOTAL: ${Number(sale.total).toLocaleString()}</p>
                </div>
                <div className="text-center mt-4 text-xs">
                    <p>¡Gracias por su compra!</p>
                </div>
            </div>
            <div className="p-4 bg-gray-100 flex justify-end">
                 <button 
                    onClick={onClose} 
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Cerrar
                </button>
            </div>
        </Modal>
    );
};

export default TicketModal;
