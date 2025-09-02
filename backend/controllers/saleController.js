import { KitchenOrder, KitchenOrderItem, SnackBarProduct, SnackBarSale, SnackBarSaleItem, sequelize } from '../models/index.js';

const confirmSale = async (req, res) => {
    const { order, combos = [], tableNumber, paymentMethod } = req.body;
    const t = await sequelize.transaction();

    try {
        console.log("Received order for confirmation:", JSON.stringify(order, null, 2));

        // Calculate total sale amount
        const standaloneTotal = order.filter(item => !item.comboId).reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
        const comboTotal = combos.reduce((acc, combo) => acc + combo.price, 0);
        const totalSaleAmount = standaloneTotal + comboTotal;

        // Create SnackBarSale record
        const newSale = await SnackBarSale.create({
            total: totalSaleAmount,
            saleDate: new Date(),
            paymentMethod
        }, { transaction: t });

        // Create SnackBarSaleItem records
        for (const item of order) {
            if (!item.comboId) {
                await SnackBarSaleItem.create({
                    saleId: newSale.id,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.unitPrice * item.quantity
                }, { transaction: t });
            }
        }

        for (const combo of combos) {
            await SnackBarSaleItem.create({
                saleId: newSale.id,
                productName: combo.comboName,
                quantity: 1,
                unitPrice: combo.price,
                totalPrice: combo.price
            }, { transaction: t });
        }

        // Separate items for kitchen and bar
        const standaloneKitchenItems = order.filter(item => item.delivery === 'Cocina');
        const comboKitchenItems = combos.flatMap(combo =>
            (combo.items || []).filter(item => item.delivery === 'Cocina').map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: 0,
                isHalf: item.isHalf || false,
            }))
        );
        const kitchenItems = [...standaloneKitchenItems, ...comboKitchenItems];

        // Process kitchen order
        if (kitchenItems.length > 0) {
            const newKitchenOrder = await KitchenOrder.create({
                table_number: tableNumber,
                status: 'pendiente',
                orderType: 'snack_bar',
            }, { transaction: t });

            for (const item of kitchenItems) {
                await KitchenOrderItem.create({
                    order_id: newKitchenOrder.id,
                    product_id: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    price_at_sale: item.unitPrice,
                    ishalf: item.isHalf || false,
                    status: 'pendiente'
                }, { transaction: t });
            }
        }

        // Update stock for standalone items
        for (const item of order) {
            const product = await SnackBarProduct.findByPk(item.productId, { transaction: t });
            if (product) {
                product.stock -= item.quantity;
                await product.save({ transaction: t });
            }
        }

        // Update stock for combo items
        for (const combo of combos) {
            for (const item of combo.items || []) {
                const product = await SnackBarProduct.findByPk(item.productId, { transaction: t });
                if (product) {
                    product.stock -= item.quantity;
                    await product.save({ transaction: t });
                }
            }
        }

        await t.commit();

        // Fetch the full sale details to return
        const saleWithItems = await SnackBarSale.findByPk(newSale.id, {
            include: [{ model: SnackBarSaleItem, as: 'items' }]
        });

        res.status(200).send({ 
            message: 'Venta registrada y comanda(s) generada(s) exitosamente.',
            sale: saleWithItems 
        });
    } catch (error) {
        await t.rollback();
        console.error("Error confirming sale:", error);
        res.status(500).send({ message: 'Error al confirmar la venta.', error: error.message });
    }
};

const getSalesHistory = async (req, res) => {
    try {
        const sales = await SnackBarSale.findAll({
            include: [{ model: SnackBarSaleItem, as: 'items' }],
            order: [['saleDate', 'DESC']]
        });
        res.status(200).json(sales);
    } catch (error) {
        console.error("Error fetching sales history:", error);
        res.status(500).send({ message: 'Error al obtener el historial de ventas.', error: error.message });
    }
};

export default { confirmSale, getSalesHistory };


