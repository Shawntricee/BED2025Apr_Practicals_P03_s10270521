const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Book {
  static async getAllBooks() {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const query = "SELECT book_id, title, author, availability FROM Books ORDER BY title";
      
      const result = await connection.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  static async updateBookAvailability(bookId, availability) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const query = "UPDATE Books SET availability = @availability WHERE book_id = @bookId";
      
      const request = connection.request();
      request.input("bookId", sql.Int, bookId);
      request.input("availability", sql.Char(1), availability);
      
      const result = await request.query(query);
      
      if (result.rowsAffected[0] === 0) {
        return null;
      }
      
      return await this.getBookById(bookId);
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  static async getBookById(bookId) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const query = "SELECT book_id, title, author, availability FROM Books WHERE book_id = @bookId";
      
      const request = connection.request();
      request.input("bookId", sql.Int, bookId);
      
      const result = await request.query(query);
      return result.recordset[0] || null;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}

module.exports = Book;