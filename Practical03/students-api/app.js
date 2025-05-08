const express = require("express");
const sql = require("mssql");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database configuration
const dbConfig = {
    user: "booksapi_user", // Replace with your SQL Server login username
    password: "Jungkook12", // Replace with your SQL Server login password
    server: "localhost",
    database: "bed_db",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
  };

// --- GET Routes ---

// GET all students
app.get("/students", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT student_id, name, address FROM Students`;
    const request = connection.request();
    const result = await request.query(sqlQuery);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error in GET /students:", error);
    res.status(500).send("Error retrieving students");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// GET student by ID
app.get("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  if (isNaN(studentId)) {
    return res.status(400).send("Invalid student ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT student_id, name, address FROM Students WHERE student_id = @id`;
    const request = connection.request();
    request.input("id", studentId);
    const result = await request.query(sqlQuery);

    if (!result.recordset[0]) {
      return res.status(404).send("Student not found");
    }
    res.json(result.recordset[0]);
  } catch (error) {
    console.error(`Error in GET /students/${studentId}:`, error);
    res.status(500).send("Error retrieving student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- POST Route ---

// POST create new student
app.post("/students", async (req, res) => {
  const newStudentData = req.body;

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `
      INSERT INTO Students (name, address) 
      VALUES (@name, @address); 
      SELECT SCOPE_IDENTITY() AS student_id;
    `;
    
    const request = connection.request();
    request.input("name", newStudentData.name);
    request.input("address", newStudentData.address || null); // Handle optional address
    
    const result = await request.query(sqlQuery);

    // Get the newly created student ID
    const newStudentId = result.recordset[0].student_id;

    // Fetch the new student to return it
    const getNewStudentQuery = `
      SELECT student_id, name, address 
      FROM Students 
      WHERE student_id = @id
    `;
    
    const getNewStudentRequest = connection.request();
    getNewStudentRequest.input("id", newStudentId);
    const newStudentResult = await getNewStudentRequest.query(getNewStudentQuery);

    res.status(201).json(newStudentResult.recordset[0]);
  } catch (error) {
    console.error("Error in POST /students:", error);
    res.status(500).send("Error creating student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- PUT Route ---

// PUT update student by ID
app.put("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  if (isNaN(studentId)) {
    return res.status(400).send("Invalid student ID");
  }
  
  const updatedStudentData = req.body;
  
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // Update the student in the database
    const updateQuery = `
      UPDATE Students 
      SET name = @name, address = @address 
      WHERE student_id = @id
    `;
    
    const request = connection.request();
    request.input("id", studentId);
    request.input("name", updatedStudentData.name);
    request.input("address", updatedStudentData.address || null);
    
    const result = await request.query(updateQuery);
    
    // Check if a student was actually updated
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Student not found");
    }
    
    // Fetch the updated student to return it
    const getUpdatedStudentQuery = `
      SELECT student_id, name, address 
      FROM Students 
      WHERE student_id = @id
    `;
    
    const getStudentRequest = connection.request();
    getStudentRequest.input("id", studentId);
    const updatedStudent = await getStudentRequest.query(getUpdatedStudentQuery);
    
    res.json(updatedStudent.recordset[0]);
  } catch (error) {
    console.error(`Error in PUT /students/${studentId}:`, error);
    res.status(500).send("Error updating student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- DELETE Route ---

// DELETE student by ID
app.delete("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  if (isNaN(studentId)) {
    return res.status(400).send("Invalid student ID");
  }
  
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // Delete the student from the database
    const deleteQuery = `DELETE FROM Students WHERE student_id = @id`;
    
    const request = connection.request();
    request.input("id", studentId);
    
    const result = await request.query(deleteQuery);
    
    // Check if a student was actually deleted
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Student not found");
    }
    
    // Return 204 No Content on successful deletion
    res.status(204).send();
  } catch (error) {
    console.error(`Error in DELETE /students/${studentId}:`, error);
    res.status(500).send("Error deleting student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// Start the server
app.listen(port, async () => {
  try {
    // Test database connection on startup
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
    await sql.close(); // Close the test connection
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }

  console.log(`Students API server listening on port ${port}`);
});

// Close database connections on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});