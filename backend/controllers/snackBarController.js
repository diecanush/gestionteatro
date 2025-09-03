
import SnackBarProduct from '../models/SnackBarProduct.js';
import SnackBarPurchase from '../models/SnackBarPurchase.js';
import Combo from '../models/Combo.js';
import ComboItem from '../models/ComboItem.js';

export const getSnackBarCombos = async (req, res) => {
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

    const formatted = combos.map((combo) => ({
      id: combo.id,
      name: combo.name,
      price: combo.price,
      components: combo.components.map((item) => ({
        id: item.id,
        name: item.name,
        options: item.options.map((p) => p.id),
      })),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all snack bar products
export const getSnackBarProducts = async (req, res) => {
  try {
    const products = await SnackBarProduct.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single snack bar product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await SnackBarProduct.findByPk(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Producto no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new snack bar product
export const createProduct = async (req, res) => {
  try {
    const newProductData = {
      ...req.body,
      id: `prod_${Date.now()}` // Simple unique ID generation
    };
    const product = await SnackBarProduct.create(newProductData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: 'Error al crear el producto.', error: error.message });
  }
};

// Update a snack bar product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await SnackBarProduct.update(req.body, {
      where: { id: id }
    });
    if (updated) {
      const updatedProduct = await SnackBarProduct.findByPk(id);
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Producto no encontrado.' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Purchase stock for a snack bar product
export const purchaseProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, purchasePrice } = req.body;
    const product = await SnackBarProduct.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    product.stock = (product.stock || 0) + Number(quantity);
    if (purchasePrice !== undefined) {
      product.purchasePrice = purchasePrice;
    }
    await product.save();

    await SnackBarPurchase.create({
      productId: product.id,
      quantity: Number(quantity),
      purchasePrice
    });

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a snack bar product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SnackBarProduct.destroy({
      where: { id: id }
    });
    if (deleted) {
      res.status(204).send(); // No content
    } else {
      res.status(404).json({ message: 'Producto no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

