export default (sequelize, DataTypes) => {
  const KitchenOrder = sequelize.define("KitchenOrder", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    table_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pendiente', 'listo', 'entregado'),
      allowNull: false,
      defaultValue: 'pendiente'
    }
  }, {
    tableName: 'kitchen_orders',
    timestamps: true, // Sequelize can manage the created_at and updated_at fields
    updatedAt: 'updated_at',
    createdAt: 'created_at'
  });

  return KitchenOrder;
};
