const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

// Load environment variables
dotenv.config();

const bookController = require("./controllers/bookController");
const userController = require("./controllers/userController");
const { validateBook, validateBookId } = require("./middlewares/bookValidation");
const { validateUser, validateUserId } = require("./middlewares/userValidation");

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Swagger setup
try {
  const swaggerDocument = require("./swagger-output.json");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log("Swagger documentation available at http://localhost:3000/api-docs");
} catch (error) {
  console.log("Swagger documentation not available. Run 'npm run swagger' to generate it.");
}

// Book routes
app.get("/books", bookController.getAllBooks);
app.get("/books/:id", validateBookId, bookController.getBookById);
app.post("/books", validateBook, bookController.createBook);
app.put("/books/:id", validateBookId, validateBook, bookController.updateBook);
app.delete("/books/:id", validateBookId, bookController.deleteBook);

// User routes
app.post("/users", validateUser, userController.createUser);
app.get("/users", userController.getAllUsers);
app.get("/users/search", userController.searchUsers);
app.get("/users/with-books", userController.getUsersWithBooks);
app.get("/users/:id", validateUserId, userController.getUserById);
app.put("/users/:id", validateUserId, validateUser, userController.updateUser);
app.delete("/users/:id", validateUserId, userController.deleteUser);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});

module.exports = app; // Export for testing