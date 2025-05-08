const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- GET Routes ---

// GET all books
app.get("/books", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT id, title, author FROM Books`;
    const request = connection.request();
    const result = await request.query(sqlQuery);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error in GET /books:", error);
    res.status(500).send("Error retrieving books");
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

// GET book by ID
app.get("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT id, title, author FROM Books WHERE id = @id`;
    const request = connection.request();
    request.input("id", bookId); // Bind the id parameter
    const result = await request.query(sqlQuery);

    if (!result.recordset[0]) {
      return res.status(404).send("Book not found");
    }
    res.json(result.recordset[0]);
  } catch (error) {
    console.error(`Error in GET /books/${bookId}:`, error);
    res.status(500).send("Error retrieving book");
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

// POST create new book
app.post("/books", async (req, res) => {
  const newBookData = req.body;

  // WARNING: No validation is performed here. Invalid data may cause database errors.

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `INSERT INTO Books (title, author) VALUES (@title, @author); SELECT SCOPE_IDENTITY() AS id;`;
    const request = connection.request();
    // Bind parameters from the request body
    request.input("title", newBookData.title);
    request.input("author", newBookData.author);
    const result = await request.query(sqlQuery);

    // Get the newly created book ID
    const newBookId = result.recordset[0].id;

    // Fetch the new book to return it
    const getNewBookQuery = `SELECT id, title, author FROM Books WHERE id = @id`;
    const getNewBookRequest = connection.request();
    getNewBookRequest.input("id", newBookId);
    const newBookResult = await getNewBookRequest.query(getNewBookQuery);

    res.status(201).json(newBookResult.recordset[0]);
  } catch (error) {
    console.error("Error in POST /books:", error);
    res.status(500).send("Error creating book");
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

  console.log(`Server listening on port ${port}`);
});

// Close database connections on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});