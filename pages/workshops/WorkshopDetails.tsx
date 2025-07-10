
import React, { useState } from 'react';
import { Workshop, Student } from '../../types';
import { addStudentToWorkshop } from '../../services/api';
import Modal from '../../components/Modal';

interface WorkshopDetailsProps {
  workshop: Workshop;
  onBack: () => void;
}

const StudentForm: React.FC<{ workshopId: string; onStudentAdded: (student: Student) => void; onClose: () => void; }> = ({ workshopId, onStudentAdded, onClose }) => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', birthDate: '', phone: '', email: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newStudent = await addStudentToWorkshop(workshopId, formData);
            onStudentAdded(newStudent);
            onClose();
        } catch (error) {
            console.error("Failed to add student:", error);
            alert("Error al agregar alumno.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="firstName" placeholder="Nombre" onChange={handleChange} className="bg-gray-100 dark:bg-brand-dark p-2 rounded w-full" required />
                <input type="text" name="lastName" placeholder="Apellido" onChange={handleChange} className="bg-gray-100 dark:bg-brand-dark p-2 rounded w-full" required />
                <input type="date" name="birthDate" placeholder="Fecha de Nacimiento" onChange={handleChange} className="bg-gray-100 dark:bg-brand-dark p-2 rounded w-full" required />
                <input type="tel" name="phone" placeholder="Teléfono" onChange={handleChange} className="bg-gray-100 dark:bg-brand-dark p-2 rounded w-full" required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} className="bg-gray-100 dark:bg-brand-dark p-2 rounded w-full col-span-1 md:col-span-2" required />
            </div>
            <div className="flex justify-end pt-4">
                <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg mr-2">Cancelar</button>
                <button type="submit" className="bg-brand-accent hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Guardar Alumno</button>
            </div>
        </form>
    );
};

const WorkshopDetails: React.FC<WorkshopDetailsProps> = ({ workshop, onBack }) => {
  const [students, setStudents] = useState<Student[]>(workshop.Students);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'payments'>('students');
  
  const handleStudentAdded = (student: Student) => {
      setStudents([...students, student]);
  };

  return (
    <div>
        <button onClick={onBack} className="mb-6 bg-gray-200 text-gray-700 dark:bg-brand-blue dark:text-white dark:hover:bg-opacity-80 hover:bg-gray-300 font-bold py-2 px-4 rounded-lg transition-colors">
            &larr; Volver a Talleres
        </button>
        <div className="bg-white dark:bg-brand-navy p-6 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold">{workshop.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">Profesor/a: {workshop.teacher}</p>

            <div className="my-6 border-b border-gray-200 dark:border-brand-blue">
                <nav className="flex space-x-4">
                    <button onClick={() => setActiveTab('students')} className={`py-2 px-4 font-medium ${activeTab === 'students' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-gray-500 dark:text-gray-400'}`}>Alumnos ({students.length})</button>
                    <button onClick={() => setActiveTab('attendance')} className={`py-2 px-4 font-medium ${activeTab === 'attendance' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-gray-500 dark:text-gray-400'}`}>Asistencia</button>
                    <button onClick={() => setActiveTab('payments')} className={`py-2 px-4 font-medium ${activeTab === 'payments' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-gray-500 dark:text-gray-400'}`}>Cobros</button>
                </nav>
            </div>

            {activeTab === 'students' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Listado de Alumnos</h3>
                        <button onClick={() => setIsModalOpen(true)} className="bg-brand-accent hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">+ Inscribir Alumno</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 dark:bg-brand-blue">
                                <tr>
                                    <th className="p-3">Apellido y Nombre</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Teléfono</th>
                                    <th className="p-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id} className="border-b border-gray-200 dark:border-brand-blue hover:bg-gray-50 dark:hover:bg-brand-blue/30">
                                        <td className="p-3">{student.lastName}, {student.firstName}</td>
                                        <td className="p-3">{student.email}</td>
                                        <td className="p-3">{student.phone}</td>
                                        <td className="p-3"><button className="text-brand-accent hover:underline">Ver Ficha</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {students.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay alumnos inscriptos.</p>}
                    </div>
                </div>
            )}
             {activeTab !== 'students' && (
                <div className="text-center text-gray-500 py-16">
                    <h3 className="text-2xl font-bold">Función en desarrollo</h3>
                    <p>El módulo de '{activeTab === 'attendance' ? 'Asistencia' : 'Cobros'}' estará disponible próximamente.</p>
                </div>
            )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Inscribir Alumno a ${workshop.name}`}>
            <StudentForm workshopId={workshop.id} onStudentAdded={handleStudentAdded} onClose={() => setIsModalOpen(false)} />
        </Modal>
    </div>
  );
};

export default WorkshopDetails;