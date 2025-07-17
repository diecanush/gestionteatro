
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // Import sequelize instance

// Import models that are directly exported
import Workshop from './Workshop.js';
import Student from './Student.js';
import Show from './Show.js';
import SnackBarProduct from './SnackBarProduct.js';

// Import model functions and initialize them
import _KitchenOrder from './KitchenOrder.js';
import _KitchenOrderItem from './KitchenOrderItem.js';

const KitchenOrder = _KitchenOrder(sequelize, DataTypes);
const KitchenOrderItem = _KitchenOrderItem(sequelize, DataTypes);

// Workshop-Student Association
Workshop.belongsToMany(Student, { through: 'workshop_students', foreignKey: 'workshop_id', as: 'students', timestamps: false });
Student.belongsToMany(Workshop, { through: 'workshop_students', foreignKey: 'student_id', as: 'Workshops', timestamps: false });

// KitchenOrder-KitchenOrderItem Association
KitchenOrder.hasMany(KitchenOrderItem, { as: 'items', foreignKey: 'order_id' });
KitchenOrderItem.belongsTo(KitchenOrder, { as: 'order', foreignKey: 'order_id' });

// SnackBarProduct-KitchenOrderItem Association
SnackBarProduct.hasMany(KitchenOrderItem, { foreignKey: 'product_id' });
KitchenOrderItem.belongsTo(SnackBarProduct, { as: 'product', foreignKey: 'product_id' });

// Import model functions and initialize them
import _SnackBarSale from './SnackBarSale.js';
import _SnackBarSaleItem from './SnackBarSaleItem.js';

const SnackBarSale = _SnackBarSale(sequelize, DataTypes);
const SnackBarSaleItem = _SnackBarSaleItem(sequelize, DataTypes);

// SnackBarSale-SnackBarSaleItem Association
SnackBarSale.hasMany(SnackBarSaleItem, { as: 'items', foreignKey: 'sale_id' });
SnackBarSaleItem.belongsTo(SnackBarSale, { as: 'sale', foreignKey: 'sale_id' });


export { Workshop, Student, Show, SnackBarProduct, KitchenOrder, KitchenOrderItem, SnackBarSale, SnackBarSaleItem, sequelize };
