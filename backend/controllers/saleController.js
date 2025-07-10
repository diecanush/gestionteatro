import { KitchenOrder, KitchenOrderItem, SnackBarProduct } from '../models/index.js';

const confirmSale = async (req, res) => {
    const { order, tableNumber } = req.body;

    try {
        console.log("Received order for confirmation:", JSON.stringify(order, null, 2));

        // Separate items for kitchen and bar
        const kitchenItems = order.filter(item => {
            console.log(`Checking item: ${item.productName}, Delivery: ${item.delivery}`);
            return item.delivery === 'Cocina';
        });
        const barItems = order.filter(item => item.delivery === 'Bar');

        console.log("Kitchen items to process:", JSON.stringify(kitchenItems, null, 2));

        // Process kitchen order
        if (kitchenItems.length > 0) {
            try {
                const newKitchenOrder = await KitchenOrder.create({
                table_number: tableNumber, // Use the provided table number
                status: 'pendiente',
                orderType: 'snack_bar',
            });
                console.log("New KitchenOrder created with ID:", newKitchenOrder.id);

                for (const item of kitchenItems) {
                    await KitchenOrderItem.create({
                        order_id: newKitchenOrder.id, // Corrected foreign key name
                        product_id: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        price_at_sale: item.unitPrice,
                        ishalf: item.isHalf || false,
                    });
                    console.log(`KitchenOrderItem created for product: ${item.productName}`);
                }
                console.log("All KitchenOrderItems created.");
            } catch (kitchenError) {
                console.error("Error creating KitchenOrder or KitchenOrderItems:", kitchenError);
            }
        }

        // TODO: Process bar items (e.g., update stock, generate bar ticket)

        // Update stock for all products in the order
        for (const item of order) {
            console.log(`Attempting to update stock for productId: ${item.productId}, quantity: ${item.quantity}`);
            try {
                const product = await SnackBarProduct.findByPk(item.productId);
                if (product) {
                    console.log(`Found product: ${product.name}, current stock: ${product.stock}`);
                    product.stock -= item.quantity;
                    await product.save();
                    console.log(`Updated stock for ${product.name}. New stock: ${product.stock}`);
                } else {
                    console.warn(`Product with ID ${item.productId} not found.`);
                }
            } catch (stockError) {
                console.error(`Error updating stock for productId ${item.productId}:`, stockError);
            }
        }

        res.status(200).send({ message: 'Venta registrada y comanda(s) generada(s) exitosamente.' });
    } catch (error) {
        console.error("Error confirming sale:", error);
        res.status(500).send({ message: 'Error al confirmar la venta.', error: error.message });
    }
};

export default { confirmSale };
