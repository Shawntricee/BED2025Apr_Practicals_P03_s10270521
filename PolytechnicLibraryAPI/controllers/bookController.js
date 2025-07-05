const Book = require("../models/bookModel");

class BookController {
  static async getAllBooks(req, res) {
    try {
      const books = await Book.getAllBooks();
      res.json(books);
    } catch (error) {
      console.error("Controller error:", error);
      res.status(500).json({ error: "Error retrieving books" });
    }
  }

  static async updateBookAvailability(req, res) {
    try {
      const bookId = parseInt(req.params.bookId);
      const { availability } = req.body;

      // Validate availability value
      if (!availability || !['Y', 'N'].includes(availability)) {
        return res.status(400).json({ 
          error: "Availability must be 'Y' or 'N'" 
        });
      }

      const updatedBook = await Book.updateBookAvailability(bookId, availability);
      
      if (!updatedBook) {
        return res.status(404).json({ error: "Book not found" });
      }
      
      res.json({
        message: "Book availability updated successfully",
        book: updatedBook
      });
    } catch (error) {
      console.error("Controller error:", error);
      res.status(500).json({ error: "Error updating book availability" });
    }
  }
}

module.exports = BookController;