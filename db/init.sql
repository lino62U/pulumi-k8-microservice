-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS myapp_db;
USE myapp_db;

-- ===========================================
-- 1. Tabla de usuarios (para login)
-- ===========================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'User',
  avatarUrl VARCHAR(255),
  department VARCHAR(100)
);

-- Usuarios iniciales
INSERT INTO users (name, email, password, role, avatarUrl, department)
VALUES
  ('Admin User', 'admin@adv.com', 'password', 'Admin', 'https://picsum.photos/id/237/200/200', 'Management'),
  ('Alice', 'alice@example.com', '1234', 'Employee', 'https://picsum.photos/id/1005/200/200', 'Creative'),
  ('Bob', 'bob@example.com', '5678', 'Employee', 'https://picsum.photos/id/1011/200/200', 'Technology');


-- ===========================================
-- 2. Tabla de empleados
-- ===========================================
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  department VARCHAR(100),
  startDate DATE,
  status ENUM('Active', 'OnLeave', 'Terminated') DEFAULT 'Active',
  avatarUrl VARCHAR(255)
);

INSERT INTO employees (name, email, role, department, startDate, status, avatarUrl)
VALUES
  ('John Doe', 'john.doe@example.com', 'Creative Director', 'Creative', '2022-01-15', 'Active', 'https://picsum.photos/id/1005/200/200'),
  ('Jane Smith', 'jane.smith@example.com', 'Account Manager', 'Client Services', '2021-11-20', 'Active', 'https://picsum.photos/id/1011/200/200'),
  ('Mike Johnson', 'mike.johnson@example.com', 'Senior Developer', 'Technology', '2020-05-10', 'OnLeave', 'https://picsum.photos/id/1025/200/200'),
  ('Emily Brown', 'emily.brown@example.com', 'Graphic Designer', 'Creative', '2023-02-01', 'Active', 'https://picsum.photos/id/1012/200/200'),
  ('David Wilson', 'david.wilson@example.com', 'HR Manager', 'Administration', '2019-08-12', 'Active', 'https://picsum.photos/id/1027/200/200'),
  ('Sarah Clark', 'sarah.clark@example.com', 'Copywriter', 'Creative', '2023-07-22', 'Active', 'https://picsum.photos/id/1013/200/200'),
  ('Robert Turner', 'robert.turner@example.com', 'Media Buyer', 'Media', '2022-09-05', 'Terminated', 'https://picsum.photos/id/1029/200/200'),
  ('Olivia Martinez', 'olivia.martinez@example.com', 'Social Media Manager', 'Digital', '2022-03-18', 'Active', 'https://picsum.photos/id/1014/200/200');


-- ===========================================
-- 3. Tabla de asistencia
-- ===========================================
DROP TABLE IF EXISTS attendance;
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId INT NOT NULL,
  employeeName VARCHAR(100),
  date DATE,
  checkIn TIME,
  checkOut TIME,
  status ENUM('Present', 'Late', 'Absent') DEFAULT 'Present',
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

INSERT INTO attendance (employeeId, employeeName, date, checkIn, checkOut, status) VALUES
(1, 'John Doe', '2024-07-28', '09:05', '17:30', 'Present'),
(2, 'Jane Smith', '2024-07-28', '09:15', '17:45', 'Late'),
(3, 'Mike Johnson', '2024-07-28', NULL, NULL, 'Absent'),
(4, 'Emily Brown', '2024-07-28', '08:55', '17:20', 'Present'),
(1, 'John Doe', '2024-07-27', '09:00', '17:25', 'Present'),
(2, 'Jane Smith', '2024-07-27', '09:02', '17:33', 'Present'),
(5, 'David Wilson', '2024-07-28', '08:45', '18:00', 'Present'),
(6, 'Sarah Clark', '2024-07-28', NULL, NULL, 'Absent');


-- ===========================================
-- 4. Tabla de proyectos
-- ===========================================
DROP TABLE IF EXISTS projects;
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  client VARCHAR(100),
  deadline DATE,
  status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
  progress INT DEFAULT 0
);

INSERT INTO projects (name, client, deadline, status, progress)
VALUES
  ('QuantumLeap Campaign', 'Innovate Corp', '2024-09-30', 'In Progress', 75),
  ('Nebula App Launch', 'TechFrontier', '2024-10-15', 'In Progress', 40),
  ('EcoConnect Branding', 'GreenSolutions', '2024-08-25', 'Completed', 100),
  ('Starlight Socials', 'Momentum Media', '2024-11-01', 'Not Started', 0);


-- ===========================================
-- 5. Relación proyecto-empleado
-- ===========================================
DROP TABLE IF EXISTS project_team;
CREATE TABLE project_team (
  projectId INT NOT NULL,
  employeeId INT NOT NULL,
  PRIMARY KEY (projectId, employeeId),
  FOREIGN KEY (projectId) REFERENCES projects(id),
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

-- Asignaciones basadas en MOCK_PROJECTS
INSERT INTO project_team (projectId, employeeId) VALUES
(1, 1), (1, 4), (1, 6),
(2, 2), (2, 3), (2, 8),
(3, 1), (3, 2), (3, 4),
(4, 8);
