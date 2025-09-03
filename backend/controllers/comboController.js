import Combo from '../models/Combo.js';
import ComboItem from '../models/ComboItem.js';
import SnackBarProduct from '../models/SnackBarProduct.js';

const formatCombo = (combo) => ({
  id: combo.id,
  name: combo.name,
  price: combo.price,
    components: combo.components.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      productIds: item.options.map((p) => p.id),
    })),
});

export const getCombos = async (req, res) => {
  try {
    const combos = await Combo.findAll({
      include: {
        model: ComboItem,
        as: 'components',
        include: {
          model: SnackBarProduct,
          as: 'options',
          attributes: ['id'],
          through: { attributes: [] },
        },
      },
    });
    res.json(combos.map(formatCombo));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComboById = async (req, res) => {
  try {
    const combo = await Combo.findByPk(req.params.id, {
      include: {
        model: ComboItem,
        as: 'components',
        include: {
          model: SnackBarProduct,
          as: 'options',
          attributes: ['id'],
          through: { attributes: [] },
        },
      },
    });
    if (combo) {
      res.json(formatCombo(combo));
    } else {
      res.status(404).json({ message: 'Combo no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCombo = async (req, res) => {
  try {
    const { name, price, components } = req.body;
    const combo = await Combo.create({ id: `combo_${Date.now()}`, name, price });

    if (Array.isArray(components)) {
        for (const component of components) {
          const comboItem = await ComboItem.create({
            comboId: combo.id,
            name: component.name,
            quantity: component.quantity ?? 1,
          });
          if (Array.isArray(component.productIds) && component.productIds.length) {
            const products = await SnackBarProduct.findAll({ where: { id: component.productIds } });
            await comboItem.setOptions(products);
          }
        }
      }

    const created = await Combo.findByPk(combo.id, {
      include: {
        model: ComboItem,
        as: 'components',
        include: {
          model: SnackBarProduct,
          as: 'options',
          attributes: ['id'],
          through: { attributes: [] },
        },
      },
    });
    res.status(201).json(formatCombo(created));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCombo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, components } = req.body;
    const combo = await Combo.findByPk(id);
    if (!combo) {
      return res.status(404).json({ message: 'Combo no encontrado.' });
    }

    combo.name = name ?? combo.name;
    combo.price = price ?? combo.price;
    await combo.save();

    if (Array.isArray(components)) {
        await ComboItem.destroy({ where: { comboId: id } });
        for (const component of components) {
          const comboItem = await ComboItem.create({
            comboId: id,
            name: component.name,
            quantity: component.quantity ?? 1,
          });
          if (Array.isArray(component.productIds) && component.productIds.length) {
            const products = await SnackBarProduct.findAll({ where: { id: component.productIds } });
            await comboItem.setOptions(products);
          }
        }
    }

    const updatedCombo = await Combo.findByPk(id, {
      include: {
        model: ComboItem,
        as: 'components',
        include: {
          model: SnackBarProduct,
          as: 'options',
          attributes: ['id'],
          through: { attributes: [] },
        },
      },
    });
    res.status(200).json(formatCombo(updatedCombo));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCombo = async (req, res) => {
  try {
    const { id } = req.params;
    await ComboItem.destroy({ where: { comboId: id } });
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

