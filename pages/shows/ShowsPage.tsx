
import React, { useState, useEffect } from 'react';
import { Show } from '../../types';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ShowsPage: React.FC = () => {
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchShows = async () => {
            try {
                setLoading(true);
                const response = await api.get('/shows');
                setShows(response.data);
            } catch (error) {
                console.error("Error fetching shows:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShows();
    }, []);

    if (loading) {
        return <div className="text-center p-10">Cargando espectáculos...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Cartelera de Espectáculos</h2>
                <button
                    onClick={() => navigate('/shows/new')}
                    className="bg-brand-accent hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    + Nuevo Espectáculo
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {shows.map(show => (
                    <div key={show.id} className="bg-white dark:bg-brand-navy rounded-lg shadow-xl overflow-hidden flex flex-col sm:flex-row">
                        <img src={show.posterUrl} alt={`Poster de ${show.title}`} className="w-full sm:w-1/3 h-64 sm:h-auto object-cover" />
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{show.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{show.producer}</p>
                            <p className="text-gray-700 dark:text-brand-light flex-grow">{show.description}</p>
                            <div className="my-4 text-sm space-y-2">
                                <p><span className="font-semibold">Fecha:</span> {new Date(show.date).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {show.time}hs</p>
                                <p><span className="font-semibold">Localidades:</span> {show.availableSeats} / {show.capacity}</p>
                                <p><span className="font-semibold">Precios:</span> ${show.advancePrice} (Anticipada) / ${show.doorPrice} (Puerta)</p>
                            </div>
                            <div className="mt-auto flex gap-3">
                                <button className="flex-1 bg-brand-accent hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Vender Entrada</button>
                                <button
                                    onClick={() => navigate(`/shows/edit/${show.id}`)}
                                    className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-brand-blue dark:text-white dark:hover:bg-opacity-80 font-bold py-2 px-4 rounded-lg"
                                >
                                    Editar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShowsPage;