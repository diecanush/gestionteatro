
import React, { useState, useEffect } from 'react';
import { Workshop } from '../../types';
import { api } from '../../services/api';
import WorkshopDetails from './WorkshopDetails';
import { useNavigate } from 'react-router-dom';

const WorkshopsPage: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const response = await api.get('/workshops');
        setWorkshops(response.data);
      } catch (error) {
        console.error("Error fetching workshops:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Cargando talleres...</div>;
  }
  
  if (selectedWorkshop) {
      return <WorkshopDetails workshop={selectedWorkshop} onBack={() => setSelectedWorkshop(null)} />;
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Listado de Talleres</h2>
            <button
                onClick={() => navigate('/workshops/new')}
                className="bg-brand-accent hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                + Nuevo Taller
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map(workshop => (
                <div key={workshop.id} 
                     className="bg-white dark:bg-brand-navy rounded-lg shadow-lg p-5 flex flex-col justify-between hover:shadow-xl hover:ring-2 hover:ring-brand-accent transition-all cursor-pointer"
                     >
                    <div onClick={() => {
                        console.log('Selected workshop ID:', workshop.id);
                        setSelectedWorkshop(workshop);
                    }}>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{workshop.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{workshop.teacher}</p>
                        <p className="text-gray-700 dark:text-brand-light mt-3">{workshop.schedule}</p>
                        <div className="mt-4 text-xs flex justify-between text-gray-500 dark:text-gray-400">
                            <span>Inicio: {workshop.startDate && !isNaN(new Date(workshop.startDate).getTime()) ? new Date(workshop.startDate).toLocaleDateString() : 'N/A'}</span>
                            <span>Fin: {workshop.endDate && !isNaN(new Date(workshop.endDate).getTime()) ? new Date(workshop.endDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-brand-blue flex justify-between items-center">
                         <span className="text-lg font-semibold text-brand-accent">${workshop.fee ? workshop.fee.toLocaleString() : 'N/A'}</span>
                         <span className="text-sm font-medium text-gray-800 dark:text-white">{workshop.students?.length || 0} Alumno(s)</span>
                         <button
                            onClick={() => navigate(`/workshops/edit/${workshop.id}`)}
                            className="ml-4 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-brand-blue dark:text-white dark:hover:bg-opacity-80 font-bold py-1 px-3 rounded-lg text-sm"
                        >
                            Editar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default WorkshopsPage;