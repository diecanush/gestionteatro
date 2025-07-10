-- Poblar tabla workshops
INSERT INTO workshops (id, name, schedule, teacher) VALUES
('w1', 'Teatro Adultos Jueves', 'Jueves', 'Jimena Hogas'),
('w2', 'Oratoria Lunes', 'Lunes', 'Santiago Hogas'),
('w3', 'Teatro Adolescentes Sabado', 'Sábado', 'Jimena Hogas');

-- Poblar tabla students
INSERT INTO students (id, lastName, firstName, birthDate, phone, email) VALUES
('s1', 'García', 'Ana', '1990-05-10', '1123456789', 'ana.garcia@example.com'),
('s2', 'Pérez', 'Juan', '1988-11-22', '1198765432', 'juan.perez@example.com'),
('s3', 'Rodríguez', 'María', '2005-03-15', '1155551234', 'maria.rodriguez@example.com'),
('s4', 'López', 'Pedro', '2004-07-01', '1166665678', 'pedro.lopez@example.com'),
('s5', 'Martínez', 'Laura', '1992-09-20', '1177778901', 'laura.martinez@example.com');

-- Poblar tabla workshop_students (relación muchos a muchos)
INSERT INTO workshop_students (workshop_id, student_id) VALUES
('w1', 's1'),
('w1', 's2'),
('w2', 's1'),
('w2', 's5'),
('w3', 's3'),
('w3', 's4');