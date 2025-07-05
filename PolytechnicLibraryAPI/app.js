const express = require("express");
const sql = require("mssql");
const path = require("path");

// Load environment variables
require('dotenv').config();

// Fallback environment variables (in case .env doesn't load)
process.env.DB_SERVER = process.env.DB_SERVER || "LAPTOP-L6SVGOVS\\SQLEXPRESS";
process.env.DB_USER = process.env.DB_USER || "libraryadmin";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "LibraryPass123!";
process.env.DB_DATABASE = process.env.DB_DATABASE || "PolytechnicLibrary";
process.env.DB_PORT = process.env.DB_PORT || "1433";
process.env.JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_here_make_it_long_and_complex_polytechnic_library_2024";
process.env.PORT = process.env.PORT || "3000";

// Debug environment variables
console.log("=== ENVIRONMENT VARIABLES DEBUG ===");
console.log("DB_SERVER:", process.env.DB_SERVER);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("DB_USER:", process.env.DB_USER);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");
console.log("===================================");

// Import controllers and middleware
const AuthController = require("./controllers/authController");
const BookController = require("./controllers/bookController");
const { 
  validateUserRegistration, 
  validateUserLogin, 
  validateBookAvailability, 
  validateBookId 
} = require("./middlewares/validation");
const { 
  verifyJWT, 
  requireAuthenticated, 
  requireLibrarian 
} = require("./middlewares/authMiddleware");

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// CORS middleware (for frontend-backend communication)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Authentication routes (no authentication required)
app.post("/register", validateUserRegistration, AuthController.register);
app.post("/login", validateUserLogin, AuthController.login);

// Book routes
app.get("/books", verifyJWT, requireAuthenticated, BookController.getAllBooks);
app.put("/books/:bookId/availability", 
  verifyJWT, 
  requireLibrarian, 
  validateBookId, 
  validateBookAvailability, 
  BookController.updateBookAvailability
);

// Health check route
app.get("/health", (req, res) => {
  res.json({ message: "Polytechnic Library API is running!" });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Database: ${process.env.DB_DATABASE}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});