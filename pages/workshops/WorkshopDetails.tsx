import React, { useState } from 'react';
import { Workshop, Student } from '../../types';
import { addStudentToWorkshop } from '../../services/api';
import Modal from '../../components/Modal';
import WorkshopAttendance from './WorkshopAttendance';
import WorkshopPayments from './WorkshopPayments';

interface WorkshopDetailsProps {
  workshop: Workshop;
  onBack: () => void;
}

const StudentForm: React.FC<{ 
  workshopId: string; 
  onStudentAdded: (student: Student) => void; 
  onClose: () => void; 
}> = ({ workshopId, onStudentAdded, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    email: '',
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
      alert("Error al agregar alumno.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="firstName" placeholder="Nombre" onChange={handleChange} className="bg-gray-100 dark:bg-brand-dark p-2 rounded w-full" required />
        <input type="text" name="lastName" placeholder="Apellido" onChange={handleChange} className="bg-gray-100 dark:bg-brand-dark p-2 rounded w-full" required />
        <input type="date" name="birthDate" onChange={handleChange} className="bg-gray-100 dark:bg-brand-dark p-2 rounded w-full" required />
        <input type="tel" name="phone" placeholder="Teléfono" onChange={handleChange} className="bg-gray-100 dark:bg-brand-dark p-2 rounded w-full" required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="bg-gray-100 dark:bg-brand-dark p-2 rounded w-full col-span-1 md:col-span-2" required />
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-2">Cancelar</button>
        <button type="submit" className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg">Guardar Alumno</button>
      </div>
    </form>
  );
};

const WorkshopDetails: React.FC<WorkshopDetailsProps> = ({ workshop, onBack }) => {
  const [students, setStudents] = useState<Student[]>(workshop.students || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'payments'>('students');

  // Refresh workshop data when component mounts
  const [workshopData, setWorkshopData] = useState(workshop);

  const handleStudentAdded = (student: Student) => {
    const updatedStudents = [...students, student];
    setStudents(updatedStudents);
    setWorkshopData({ ...workshopData, students: updatedStudents });
  };

  return (
    <div>
      <button onClick={onBack} className="mb-6 bg-gray-200 text-gray-700 dark:bg-brand-blue dark:text-white hover:bg-gray-300 font-bold py-2 px-4 rounded-lg">
        &larr; Volver a Talleres
      </button>
      
      <div className="bg-white dark:bg-brand-navy p-6 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold">{workshopData.name}</h2>
        <p className="text-gray-500 dark:text-gray-400">Profesor/a: {workshopData.teacher}</p>
        {workshopData.classDays && (
          <p className="text-sm text-gray-400 mt-1">
            Días de clase: {workshopData.classDays}
          </p>
        )}

        <div className="my-6 border-b border-gray-200 dark:border-brand-blue">
          <nav className="flex space-x-4">
            <button onClick={() => setActiveTab('students')} 
              className={`py-2 px-4 font-medium ${activeTab === 'students' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-gray-500'}`}>
              Alumnos ({students.length})
            </button>
            <button onClick={() => setActiveTab('attendance')} 
              className={`py-2 px-4 font-medium ${activeTab === 'attendance' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-gray-500'}`}>
              Asistencia
            </button>
            <button onClick={() => setActiveTab('payments')} 
              className={`py-2 px-4 font-medium ${activeTab === 'payments' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-gray-500'}`}>
              Cuotas
            </button>
          </nav>
        </div>

        {activeTab === 'students' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Listado de Alumnos</h3>
              <button onClick={() => setIsModalOpen(true)} className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg">
                + Inscribir Alumno
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 dark:bg-brand-blue">
                  <tr>
                    <th className="p-3">Apellido y Nombre</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Teléfono</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className="border-b border-gray-200 dark:border-brand-blue">
                      <td className="p-3">{student.lastName}, {student.firstName}</td>
                      <td className="p-3">{student.email}</td>
                      <td className="p-3">{student.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && <p className="text-center text-gray-500 py-8">No hay alumnos inscriptos.</p>}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <WorkshopAttendance workshop={workshopData} />
        )}

        {activeTab === 'payments' && (
          <WorkshopPayments workshop={workshopData} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Inscribir Alumno a ${workshopData.name}`}>
        <StudentForm workshopId={workshopData.id} onStudentAdded={handleStudentAdded} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default WorkshopDetails;
