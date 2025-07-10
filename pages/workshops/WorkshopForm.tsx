
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';

interface Workshop {
  id: string;
  name: string;
  schedule: string;
  startDate: string;
  endDate: string;
  teacher: string;
  fee: number;
}

const WorkshopForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [workshop, setWorkshop] = useState<Workshop>({
    id: '',
    name: '',
    schedule: '',
    startDate: '',
    endDate: '',
    teacher: '',
    fee: 0,
  });

  useEffect(() => {
    if (id) {
      api.get(`/workshops/${id}`)
        .then(response => {
          const fetchedWorkshop = response.data;
          if (fetchedWorkshop.startDate) {
            fetchedWorkshop.startDate = new Date(fetchedWorkshop.startDate).toISOString().split('T')[0];
          }
          if (fetchedWorkshop.endDate) {
            fetchedWorkshop.endDate = new Date(fetchedWorkshop.endDate).toISOString().split('T')[0];
          }
          setWorkshop(fetchedWorkshop);
        })
        .catch(error => console.error('Error fetching workshop:', error));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWorkshop(prevWorkshop => ({
      ...prevWorkshop,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting workshop form...', workshop);
    if (id) {
      api.put(`/workshops/${id}`, workshop)
        .then(() => {
          console.log('Workshop updated successfully!');
          navigate('/workshops');
        })
        .catch(error => console.error('Error updating workshop:', error));
    } else {
      api.post('/workshops', workshop)
        .then(() => {
          console.log('Workshop created successfully!');
          navigate('/workshops');
        })
        .catch(error => console.error('Error creating workshop:', error));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Editar Taller' : 'Crear Taller'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nombre</label>
          <input
            type="text"
            name="name"
            id="name"
            value={workshop.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
            required
          />
        </div>
        <div>
          <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Horario</label>
          <input
            type="text"
            name="schedule"
            id="schedule"
            value={workshop.schedule}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Fecha de Inicio</label>
          <input
            type="date"
            name="startDate"
            id="startDate"
            value={workshop.startDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Fecha de Fin</label>
          <input
            type="date"
            name="endDate"
            id="endDate"
            value={workshop.endDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Profesor</label>
          <input
            type="text"
            name="teacher"
            id="teacher"
            value={workshop.teacher}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="fee" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Costo</label>
          <input
            type="number"
            name="fee"
            id="fee"
            value={workshop.fee}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate('/workshops')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {id ? 'Actualizar' : 'Crear'} Taller
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkshopForm;
