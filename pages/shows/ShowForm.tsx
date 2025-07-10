
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';

interface Show {
  id: string;
  title: string;
  description: string;
  producer: string;
  date: string;
  time: string;
  hasBar: boolean;
  capacity: number;
  availableSeats: number;
  posterUrl: string;
  promoText: string;
  doorPrice: number;
  advancePrice: number;
  hasPromo: boolean;
  promoName: string;
  promoPrice: number;
}

const ShowForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<Show>({
    id: '',
    title: '',
    description: '',
    producer: '',
    date: '',
    time: '',
    hasBar: false,
    capacity: 0,
    availableSeats: 0,
    posterUrl: '',
    promoText: '',
    doorPrice: 0,
    advancePrice: 0,
    hasPromo: false,
    promoName: '',
    promoPrice: 0,
  });

  useEffect(() => {
    if (id) {
      api.get(`/shows/${id}`)
        .then(response => {
          const fetchedShow = response.data;
          // Format date for input type="date"
          if (fetchedShow.date) {
            fetchedShow.date = new Date(fetchedShow.date).toISOString().split('T')[0];
          }
          setShow(fetchedShow);
        })
        .catch(error => console.error('Error fetching show:', error));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setShow(prevShow => ({
      ...prevShow,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form...', show);
    if (id) {
      api.put(`/shows/${id}`, show)
        .then(() => {
          console.log('Show updated successfully!');
          navigate('/shows');
        })
        .catch(error => console.error('Error updating show:', error));
    } else {
      api.post('/shows', show)
        .then(() => {
          console.log('Show created successfully!');
          navigate('/shows');
        })
        .catch(error => console.error('Error creating show:', error));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Editar Espectáculo' : 'Crear Espectáculo'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Título</label>
          <input
            type="text"
            name="title"
            id="title"
            value={show.title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
          <textarea
            name="description"
            id="description"
            value={show.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          ></textarea>
        </div>
        <div>
          <label htmlFor="producer" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Productor</label>
          <input
            type="text"
            name="producer"
            id="producer"
            value={show.producer}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Fecha</label>
          <input
            type="date"
            name="date"
            id="date"
            value={show.date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Hora</label>
          <input
            type="time"
            name="time"
            id="time"
            value={show.time}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="hasBar"
            id="hasBar"
            checked={show.hasBar}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="hasBar" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">Tiene Bar</label>
        </div>
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Capacidad</label>
          <input
            type="number"
            name="capacity"
            id="capacity"
            value={show.capacity}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="availableSeats" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Asientos Disponibles</label>
          <input
            type="number"
            name="availableSeats"
            id="availableSeats"
            value={show.availableSeats}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="posterUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-200">URL del Poster</label>
          <input
            type="text"
            name="posterUrl"
            id="posterUrl"
            value={show.posterUrl}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="promoText" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Texto de Promoción</label>
          <input
            type="text"
            name="promoText"
            id="promoText"
            value={show.promoText}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="doorPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Precio en Puerta</label>
          <input
            type="number"
            name="doorPrice"
            id="doorPrice"
            value={show.doorPrice}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="advancePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Precio Anticipado</label>
          <input
            type="number"
            name="advancePrice"
            id="advancePrice"
            value={show.advancePrice}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="hasPromo"
            id="hasPromo"
            checked={show.hasPromo}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="hasPromo" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">Tiene Promoción</label>
        </div>
        {show.hasPromo && (
          <>
            <div>
              <label htmlFor="promoName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nombre de Promoción</label>
              <input
                type="text"
                name="promoName"
                id="promoName"
                value={show.promoName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="promoPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Precio de Promoción</label>
              <input
                type="number"
                name="promoPrice"
                id="promoPrice"
                value={show.promoPrice}
                onChange={handleChange}
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>
          </>
        )}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate('/shows')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {id ? 'Actualizar' : 'Crear'} Espectáculo
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShowForm;
