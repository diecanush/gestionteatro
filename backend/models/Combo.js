import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Combo = sequelize.define('Combo', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'combos',
  timestamps: false,
});

export default Combo;
