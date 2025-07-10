
import Show from '../models/Show.js';
import { v4 as uuidv4 } from 'uuid';

export const getShows = async (req, res) => {
  try {
    const shows = await Show.findAll();
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getShowById = async (req, res) => {
  try {
    const show = await Show.findByPk(req.params.id);
    if (show) {
      res.json(show);
    } else {
      res.status(404).json({ message: 'Show not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShow = async (req, res) => {
  try {
    const newShow = await Show.create({ id: uuidv4(), ...req.body });
    res.status(201).json(newShow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateShow = async (req, res) => {
  try {
    const [updated] = await Show.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedShow = await Show.findByPk(req.params.id);
      res.status(200).json(updatedShow);
    } else {
      res.status(404).json({ message: 'Show not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
