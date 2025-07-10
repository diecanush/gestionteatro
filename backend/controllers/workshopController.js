
import Workshop from '../models/Workshop.js';
import Student from '../models/Student.js';
import { v4 as uuidv4 } from 'uuid';

export const getWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.findAll({ include: { model: Student, as: 'Students' } });
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkshopById = async (req, res) => {
  try {
    const workshop = await Workshop.findByPk(req.params.id, { include: { model: Student, as: 'Students' } });
    if (workshop) {
      res.json(workshop);
    } else {
      res.status(404).json({ message: 'Workshop not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addStudentToWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findByPk(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    const newStudentData = { ...req.body, id: `stu_${Date.now()}` }; // Generate a unique ID
    const student = await Student.create(newStudentData);
    await workshop.addStudent(student);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createWorkshop = async (req, res) => {
  try {
    const generatedId = uuidv4();
    console.log('Generated Workshop ID:', generatedId);
    const newWorkshop = await Workshop.create({ ...req.body, id: generatedId });
    res.status(201).json(newWorkshop);
  } catch (error) {
    console.error('Error creating workshop:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateWorkshop = async (req, res) => {
  try {
    const [updated] = await Workshop.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedWorkshop = await Workshop.findByPk(req.params.id);
      res.status(200).json(updatedWorkshop);
    } else {
      res.status(404).json({ message: 'Workshop not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
