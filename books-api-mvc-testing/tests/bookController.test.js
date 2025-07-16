const bookController = require("../controllers/bookController");
const bookModel = require("../models/bookModel");

// Mock the Book model
jest.mock("../models/bookModel");

describe("Book Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllBooks", () => {
    it("should fetch all books and return JSON response", async () => {
      const mockBooks = [
        { id: 1, title: "The Lord of the Rings", author: "J.R.R. Tolkien" },
        { id: 2, title: "Harry Potter", author: "J.K. Rowling" }
      ];

      bookModel.getAllBooks.mockResolvedValue(mockBooks);

      const req = {};
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await bookController.getAllBooks(req, res);

      expect(bookModel.getAllBooks).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockBooks);
    });

    it("should handle errors and return 500 status", async () => {
      const errorMessage = "Database connection failed";
      bookModel.getAllBooks.mockRejectedValue(new Error(errorMessage));

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await bookController.getAllBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error retrieving books" });
    });
  });

  describe("getBookById", () => {
    it("should return a book when found", async () => {
      const mockBook = { id: 1, title: "Test Book", author: "Test Author" };
      bookModel.getBookById.mockResolvedValue(mockBook);

      const req = { params: { id: "1" } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await bookController.getBookById(req, res);

      expect(bookModel.getBookById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockBook);
    });

    it("should return 404 when book not found", async () => {
      bookModel.getBookById.mockResolvedValue(null);

      const req = { params: { id: "999" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await bookController.getBookById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Book not found" });
    });
  });

  describe("createBook", () => {
    it("should create a new book and return 201", async () => {
      const bookData = { title: "New Book", author: "New Author" };
      const createdBook = { id: 1, ...bookData };

      bookModel.createBook.mockResolvedValue(createdBook);

      const req = { body: bookData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await bookController.createBook(req, res);

      expect(bookModel.createBook).toHaveBeenCalledWith(bookData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdBook);
    });
  });

  describe("updateBook", () => {
    it("should update a book and return updated data", async () => {
      const bookData = { title: "Updated Book", author: "Updated Author" };
      const updatedBook = { id: 1, ...bookData };

      bookModel.updateBook.mockResolvedValue(updatedBook);

      const req = { params: { id: "1" }, body: bookData };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await bookController.updateBook(req, res);

      expect(bookModel.updateBook).toHaveBeenCalledWith(1, bookData);
      expect(res.json).toHaveBeenCalledWith(updatedBook);
    });

    it("should return 404 when updating non-existent book", async () => {
      bookModel.updateBook.mockResolvedValue(null);

      const req = { params: { id: "999" }, body: { title: "Test", author: "Test" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await bookController.updateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Book not found" });
    });
  });

  describe("deleteBook", () => {
    it("should delete a book and return success message", async () => {
      const deletedBook = { id: 1, title: "Deleted Book", author: "Deleted Author" };
      bookModel.deleteBook.mockResolvedValue(deletedBook);

      const req = { params: { id: "1" } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await bookController.deleteBook(req, res);

      expect(bookModel.deleteBook).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "Book deleted successfully",
        book: deletedBook
      });
    });
  });
});