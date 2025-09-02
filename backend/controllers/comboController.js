import Combo from '../models/Combo.js';
import ComboItem from '../models/ComboItem.js';
import SnackBarProduct from '../models/SnackBarProduct.js';

export const getCombos = async (req, res) => {
  try {
    const combos = await Combo.findAll({
      include: {
        model: ComboItem,
        as: 'items',
        include: { model: SnackBarProduct, as: 'options', through: { attributes: [] } }
      }
    });
    res.json(combos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComboById = async (req, res) => {
  try {
    const combo = await Combo.findByPk(req.params.id, {
      include: {
        model: ComboItem,
        as: 'items',
        include: { model: SnackBarProduct, as: 'options', through: { attributes: [] } }
      }
    });
    if (combo) {
      res.json(combo);
    } else {
      res.status(404).json({ message: 'Combo no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCombo = async (req, res) => {
  try {
    const { name, price, items } = req.body;
    const combo = await Combo.create({ id: `combo_${Date.now()}`, name, price });

    if (Array.isArray(items)) {
      for (const item of items) {
        const comboItem = await ComboItem.create({ comboId: combo.id, label: item.label });
        if (Array.isArray(item.productIds) && item.productIds.length) {
          const products = await SnackBarProduct.findAll({ where: { id: item.productIds } });
          await comboItem.setOptions(products);
        }
      }
    }

    const created = await Combo.findByPk(combo.id, {
      include: {
        model: ComboItem,
        as: 'items',
        include: { model: SnackBarProduct, as: 'options', through: { attributes: [] } }
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCombo = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Combo.update(req.body, { where: { id } });
    if (updated) {
      const combo = await Combo.findByPk(id, {
        include: {
          model: ComboItem,
          as: 'items',
          include: { model: SnackBarProduct, as: 'options', through: { attributes: [] } }
        }
      });
      res.status(200).json(combo);
    } else {
      res.status(404).json({ message: 'Combo no encontrado.' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCombo = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Combo.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Combo no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
