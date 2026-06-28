import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WorkshopPayment = sequelize.define('WorkshopPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  workshop_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  student_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12,
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  paid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  paid_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  payment_method: {
    type: DataTypes.ENUM('Efectivo', 'Transferencia', 'Tarjeta'),
    allowNull: true,
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'workshop_payments',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['workshop_id', 'student_id', 'month', 'year'],
    },
  ],
});

export default WorkshopPayment;
