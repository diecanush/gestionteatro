-- Table for snack bar combos
CREATE TABLE combos (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Table for items inside a combo
CREATE TABLE combo_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combo_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (combo_id) REFERENCES combos(id)
);
