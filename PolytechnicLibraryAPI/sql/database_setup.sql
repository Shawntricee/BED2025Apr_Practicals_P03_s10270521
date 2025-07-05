-- Create Database
CREATE DATABASE PolytechnicLibrary;
GO

USE PolytechnicLibrary;
GO

-- Create Users Table
CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(255) UNIQUE NOT NULL,
    passwordHash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('member', 'librarian'))
);
GO

-- Create Books Table
CREATE TABLE Books (
    book_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    author NVARCHAR(255) NOT NULL,
    availability CHAR(1) NOT NULL DEFAULT 'Y' CHECK (availability IN ('Y', 'N'))
);
GO

-- Insert Sample Books
INSERT INTO Books (title, author, availability) VALUES
('Introduction to Programming', 'John Smith', 'Y'),
('Database Design Fundamentals', 'Jane Doe', 'Y'),
('Web Development Basics', 'Mike Johnson', 'N'),
('Data Structures and Algorithms', 'Sarah Wilson', 'Y'),
('Computer Networks', 'David Brown', 'Y');
GO

-- Hash for 'password123': $2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
INSERT INTO Users (username, passwordHash, role) VALUES
('admin', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'librarian'),
('student1', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'member'),
('librarian1', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'librarian');
GO

-- Create SQL Server login and user for the application
USE master;
GO

-- Create a login for our application
IF NOT EXISTS (SELECT name FROM sys.sql_logins WHERE name = 'libraryadmin')
BEGIN
    CREATE LOGIN libraryadmin WITH PASSWORD = 'LibraryPass123!';
END
GO

-- Create user in the PolytechnicLibrary database
USE PolytechnicLibrary;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'libraryadmin')
BEGIN
    CREATE USER libraryadmin FOR LOGIN libraryadmin;
    ALTER ROLE db_owner ADD MEMBER libraryadmin;
END
GO

-- Verify the setup
SELECT 'Database created successfully' as Status;
SELECT COUNT(*) as BookCount FROM Books;
SELECT COUNT(*) as UserCount FROM Users;