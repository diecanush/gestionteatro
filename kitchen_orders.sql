-- Tabla para las comandas generales de la cocina
CREATE TABLE `kitchen_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `table_number` INT NOT NULL,
  `status` ENUM('pendiente', 'listo', 'entregado') NOT NULL DEFAULT 'pendiente',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para los productos específicos de cada comanda
CREATE TABLE `kitchen_order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  -- Guardar el precio al momento de la venta es crucial para reportes precisos
  `price_at_sale` DECIMAL(10, 2) NOT NULL, 
  FOREIGN KEY (`order_id`) REFERENCES `kitchen_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `snackbarproducts`(`id`)
);
