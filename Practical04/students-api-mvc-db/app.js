const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const studentController = require("./controllers/studentController");
const { validateStudent, validateStudentId } = require("./middlewares/studentValidation");

// Create Express app
const app = express();
const port = process.env.PORT || 3001; // Using different port from books API

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- Serve static files from the 'public' directory ---
app.use(express.static(path.join(__dirname, "public")));

// Routes for students
app.get("/students", studentController.getAllStudents);
app.get("/students/:id", validateStudentId, studentController.getStudentById);
app.post("/students", validateStudent, studentController.createStudent);
app.put("/students/:id", validateStudentId, validateStudent, studentController.updateStudent);
app.delete("/students/:id", validateStudentId, studentController.deleteStudent);

// Start server
app.listen(port, () => {
  console.log(`Students API Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Students API Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});