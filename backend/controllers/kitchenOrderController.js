import { KitchenOrder, KitchenOrderItem, SnackBarProduct, sequelize } from '../models/index.js';

// Create a new kitchen order from a sale
export const createOrder = async (req, res) => {
    // The request body should contain table_number and an array of items from the sale
    const { table_number, items } = req.body; 
    
    if (!table_number || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send({ message: "El número de mesa y una lista de productos son obligatorios." });
    }

    const transaction = await sequelize.transaction();

    try {
        // Filter for items that need to be sent to the kitchen
        const kitchenItems = [];
        for (const item of items) {
            const product = await SnackBarProduct.findByPk(item.product_id);
            if (!product) {
                throw new Error(`Producto con id ${item.product_id} no encontrado.`);
            }
            // This is the key logic: only add items that are prepared in the kitchen
            if (product.delivery === 'cocina') {
                kitchenItems.push({
                    ...item,
                    price_at_sale: product.price // Capture price at the moment of sale
                });
            }
        }

        // If no items are for the kitchen, there's no need to create a kitchen order
        if (kitchenItems.length === 0) {
            await transaction.commit();
            return res.status(200).send({ message: "No hay productos para enviar a la cocina." });
        }

        // Create the main order record
        const order = await KitchenOrder.create({ 
            table_number: table_number, 
            status: 'pendiente' 
        }, { transaction });

        // Create the individual order item records
        const orderItemsPromises = kitchenItems.map(item => {
            return KitchenOrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_sale: item.price_at_sale
            }, { transaction });
        });

        await Promise.all(orderItemsPromises);

        await transaction.commit();

        // Respond with the newly created order, including its items
        const result = await KitchenOrder.findByPk(order.id, { 
            include: [{ 
                model: KitchenOrderItem, 
                as: 'items',
                include: [{
                    model: SnackBarProduct,
                    as: 'product'
                }]
            }] 
        });

        res.status(201).send(result);

    } catch (error) {
        await transaction.rollback();
        res.status(500).send({ message: error.message || "Ocurrió un error al crear la comanda." });
    }
};

// Get all kitchen orders (for the kitchen display)
export const getAllOrders = async (req, res) => {
    try {
        const { includeDelivered } = req.query;
        const whereClause = includeDelivered === 'true' ? {} : { status: ['pendiente', 'listo'] };

        const orders = await KitchenOrder.findAll({
            where: whereClause,
            include: [{
                model: KitchenOrderItem,
                as: 'items',
                include: [{
                    model: SnackBarProduct,
                    as: 'product',
                    attributes: ['name'] // Only need the product name for the kitchen view
                }]
            }],
            order: [['created_at', 'ASC']] // Show oldest pending orders first
        });
        res.send(orders);
    } catch (error) {
        res.status(500).send({ message: error.message || "Ocurrió un error al obtener las comandas." });
    }
};

// Update an order's status
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pendiente', 'listo', 'entregado'];

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).send({ message: "Estado inválido." });
    }

    try {
        const order = await KitchenOrder.findByPk(id);
        if (!order) {
            return res.status(404).send({ message: "Comanda no encontrada." });
        }
        order.status = status;
        await order.save();
        res.send(order);
    } catch (error) {
        res.status(500).send({ message: "Ocurrió un error al actualizar el estado de la comanda." });
    }
};
