import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // Import sequelize instance

// Import models that are directly exported
import Workshop from './Workshop.js';
import Student from './Student.js';
import Show from './Show.js';
import SnackBarProduct from './SnackBarProduct.js';
import Combo from './Combo.js';
import ComboItem from './ComboItem.js';

// Import model functions and initialize them
import _KitchenOrder from './KitchenOrder.js';
import _KitchenOrderItem from './KitchenOrderItem.js';
import _SnackBarPurchase from './SnackBarPurchase.js';

const KitchenOrder = _KitchenOrder(sequelize, DataTypes);
const KitchenOrderItem = _KitchenOrderItem(sequelize, DataTypes);
const SnackBarPurchase = _SnackBarPurchase(sequelize, DataTypes);

// Workshop-Student Association
Workshop.belongsToMany(Student, { through: 'workshop_students', foreignKey: 'workshop_id', as: 'students', timestamps: false });
Student.belongsToMany(Workshop, { through: 'workshop_students', foreignKey: 'student_id', as: 'Workshops', timestamps: false });

// KitchenOrder-KitchenOrderItem Association
KitchenOrder.hasMany(KitchenOrderItem, { as: 'items', foreignKey: 'order_id' });
KitchenOrderItem.belongsTo(KitchenOrder, { as: 'order', foreignKey: 'order_id' });

// SnackBarProduct-KitchenOrderItem Association
SnackBarProduct.hasMany(KitchenOrderItem, { foreignKey: 'product_id' });
KitchenOrderItem.belongsTo(SnackBarProduct, { as: 'product', foreignKey: 'product_id' });

// SnackBarProduct-SnackBarPurchase Association
SnackBarProduct.hasMany(SnackBarPurchase, { as: 'purchases', foreignKey: 'product_id' });
SnackBarPurchase.belongsTo(SnackBarProduct, { as: 'product', foreignKey: 'product_id' });

// Combo-ComboItem Association
Combo.hasMany(ComboItem, { as: 'items', foreignKey: 'comboId' });
ComboItem.belongsTo(Combo, { as: 'combo', foreignKey: 'comboId' });

// ComboItem-SnackBarProduct Association (options)
ComboItem.belongsToMany(SnackBarProduct, {
  through: 'comboitem_products',
  as: 'options',
  foreignKey: 'combo_item_id',
  otherKey: 'product_id',
  timestamps: false,
});
SnackBarProduct.belongsToMany(ComboItem, {
  through: 'comboitem_products',
  as: 'comboItems',
  foreignKey: 'product_id',
  otherKey: 'combo_item_id',
  timestamps: false,
});

// Import model functions and initialize them
import _SnackBarSale from './SnackBarSale.js';
import _SnackBarSaleItem from './SnackBarSaleItem.js';

const SnackBarSale = _SnackBarSale(sequelize, DataTypes);
const SnackBarSaleItem = _SnackBarSaleItem(sequelize, DataTypes);

// SnackBarSale-SnackBarSaleItem Association
SnackBarSale.hasMany(SnackBarSaleItem, { as: 'items', foreignKey: 'sale_id' });
SnackBarSaleItem.belongsTo(SnackBarSale, { as: 'sale', foreignKey: 'sale_id' });

export {
  Workshop,
  Student,
  Show,
  SnackBarProduct,
  Combo,
  ComboItem,
  KitchenOrder,
  KitchenOrderItem,
  SnackBarPurchase,
  SnackBarSale,
  SnackBarSaleItem,
  sequelize,
};
