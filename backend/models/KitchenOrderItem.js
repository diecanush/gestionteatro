export default (sequelize, DataTypes) => {
  const KitchenOrderItem = sequelize.define("KitchenOrderItem", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    price_at_sale: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pendiente', 'listo', 'entregado'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    ishalf: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'kitchen_order_items',
    timestamps: false // No createdAt/updatedAt for this table
  });

  return KitchenOrderItem;
};
