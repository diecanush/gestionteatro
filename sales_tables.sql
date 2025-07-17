-- Tabla para registrar cada venta del snack bar
CREATE TABLE snackbar_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_amount DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para registrar los artículos de cada venta del snack bar
CREATE TABLE snackbar_sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id VARCHAR NOT NULL,
    quantity INT NOT NULL,
    price_per_item DECIMAL(10, 2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES snackbar_sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES snackbarproducts(id) ON DELETE RESTRICT
);
