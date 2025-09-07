
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SnackBarProduct = sequelize.define('SnackBarProduct', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Bebida', 'Trago', 'Pizza', 'Empanada', 'Snack'),
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING,
  },
  size: {
    type: DataTypes.STRING,
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
  },
  sellPrice: {
    type: DataTypes.DECIMAL(10, 2),
  },
  stock: {
    type: DataTypes.INTEGER,
  },
  delivery: {
    type: DataTypes.ENUM('Barra', 'Cocina'),
  },
  canBeHalf: {
    type: DataTypes.BOOLEAN,
  },
  halfPrice: {
    type: DataTypes.DECIMAL(10, 2),
  },
}, {
  tableName: 'snackbarproducts'
});

export default SnackBarProduct;
