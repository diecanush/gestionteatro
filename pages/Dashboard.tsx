
import React from 'react';
import Card from '../components/Card';
import { WorkshopIcon, ShowIcon, SnackBarIcon } from '../components/icons';

const DashboardPage: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title="Resumen de Talleres" className="dark:bg-gradient-to-br from-brand-blue to-brand-navy">
        <div className="flex items-center">
          <WorkshopIcon className="h-16 w-16 text-brand-accent opacity-80" />
          <div className="ml-4">
            <p className="text-4xl font-bold">3</p>
            <p className="text-gray-500 dark:text-gray-300">Talleres activos</p>
          </div>
        </div>
      </Card>
      
      <Card title="Próximos Espectáculos" className="dark:bg-gradient-to-br from-brand-blue to-brand-navy">
        <div className="flex items-center">
          <ShowIcon className="h-16 w-16 text-brand-accent opacity-80" />
          <div className="ml-4">
            <p className="text-4xl font-bold">2</p>
            <p className="text-gray-500 dark:text-gray-300">Shows en cartelera</p>
          </div>
        </div>
      </Card>

      <Card title="Snack Bar" className="dark:bg-gradient-to-br from-brand-blue to-brand-navy">
        <div className="flex items-center">
          <SnackBarIcon className="h-16 w-16 text-brand-accent opacity-80" />
          <div className="ml-4">
            <p className="text-4xl font-bold">$12,500</p>
            <p className="text-gray-500 dark:text-gray-300">Ventas del día (simulado)</p>
          </div>
        </div>
      </Card>

      <Card title="Actividad Reciente" className="md:col-span-2 lg:col-span-3">
        <ul className="space-y-3">
          <li className="flex items-center text-sm">
            <span className="bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 text-xs font-bold mr-3 px-2 py-1 rounded-full">PAGO</span>
            <span className="text-gray-700 dark:text-brand-light">Juan Perez pagó la cuota del Taller de Teatro para Adultos.</span>
            <span className="ml-auto text-gray-500 dark:text-gray-400">Hace 5 minutos</span>
          </li>
          <li className="flex items-center text-sm">
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 text-xs font-bold mr-3 px-2 py-1 rounded-full">VENTA</span>
            <span className="text-gray-700 dark:text-brand-light">Venta de 2 entradas para 'La Noche Estrellada'.</span>
            <span className="ml-auto text-gray-500 dark:text-gray-400">Hace 30 minutos</span>
          </li>
          <li className="flex items-center text-sm">
            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 text-xs font-bold mr-3 px-2 py-1 rounded-full">ALUMNO</span>
            <span className="text-gray-700 dark:text-brand-light">Ana Rodriguez se inscribió al Taller de Clown.</span>
            <span className="ml-auto text-gray-500 dark:text-gray-400">Hace 2 horas</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default DashboardPage;