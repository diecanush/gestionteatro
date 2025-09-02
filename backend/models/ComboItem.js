import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ComboItem = sequelize.define('ComboItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  comboId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'combo_items',
  timestamps: false,
});

export default ComboItem;
