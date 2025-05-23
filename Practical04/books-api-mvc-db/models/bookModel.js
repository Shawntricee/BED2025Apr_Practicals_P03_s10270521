const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all books
async function getAllBooks() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT id, title, author FROM Books";
    const result = await connection.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Get book by ID
async function getBookById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT id, title, author FROM Books WHERE id = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Book not found
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Create new book
async function createBook(bookData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "INSERT INTO Books (title, author) VALUES (@title, @author); SELECT SCOPE_IDENTITY() AS id;";
    const request = connection.request();
    request.input("title", sql.NVarChar(50), bookData.title);
    request.input("author", sql.NVarChar(50), bookData.author);
    const result = await request.query(query);

    const newBookId = result.recordset[0].id;
    return await getBookById(newBookId);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Update a book
async function updateBook(id, bookData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "UPDATE Books SET title = @title, author = @author WHERE id = @id";
    
    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("title", sql.NVarChar(50), bookData.title);
    request.input("author", sql.NVarChar(50), bookData.author);
    
    const result = await request.query(query);
    
    // Check if any rows were affected
    if (result.rowsAffected[0] === 0) {
      return null; // Book not found
    }
    
    // Return the updated book
    return await getBookById(id);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Delete a book
async function deleteBook(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // First get the book to return it later
    const book = await getBookById(id);
    if (!book) {
      return null; // Book not found
    }
    
    // Delete the book
    const query = "DELETE FROM Books WHERE id = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);
    const result = await request.query(query);
    
    // Return the deleted book
    return book;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};