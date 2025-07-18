export default (sequelize, DataTypes) => {
    const SnackBarSaleItem = sequelize.define("SnackBarSaleItem", {
        productName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        unitPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        totalPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        saleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'sale_id', // Explicitly map to sale_id column in DB
        }
    }, {
        timestamps: false
    });

    SnackBarSaleItem.associate = models => {
        SnackBarSaleItem.belongsTo(models.SnackBarSale, {
            foreignKey: 'sale_id', // Use sale_id here as well
            as: 'sale'
        });
    };

    return SnackBarSaleItem;
};
