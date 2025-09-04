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
    references: {
      model: 'combos',
      key: 'id',
    },
    field: 'combo_id',
  },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  }, {
    tableName: 'combo_items',
    timestamps: false,
  });

export default ComboItem;
