export default (sequelize, DataTypes) => {
    const SnackBarPurchase = sequelize.define("SnackBarPurchase", {
        productId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'product_id'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        purchasePrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'purchase_price'
        },
        purchaseDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'purchase_date'
        }
    }, {
        timestamps: false
    });

    SnackBarPurchase.associate = models => {
        SnackBarPurchase.belongsTo(models.SnackBarProduct, {
            foreignKey: 'product_id',
            as: 'product'
        });
    };

    return SnackBarPurchase;
};
