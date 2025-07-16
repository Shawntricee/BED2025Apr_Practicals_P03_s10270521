const bookModel = require("../models/bookModel");
const sql = require("mssql");

jest.mock("mssql");

describe("Book Model Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllBooks", () => {
    it("should retrieve all books from the database", async () => {
      const mockBooks = [
        { id: 1, title: "Book 1", author: "Author 1" },
        { id: 2, title: "Book 2", author: "Author 2" }
      ];

      const mockRequest = {
        query: jest.fn().mockResolvedValue({ recordset: mockBooks })
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect.mockResolvedValue(mockConnection);

      const books = await bookModel.getAllBooks();

      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(books).toHaveLength(2);
      expect(books[0].title).toBe("Book 1");
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database Error";
      sql.connect.mockRejectedValue(new Error(errorMessage));

      await expect(bookModel.getAllBooks()).rejects.toThrow(errorMessage);
    });
  });

  describe("getBookById", () => {
    it("should retrieve a specific book by ID", async () => {
      const mockBook = { id: 1, title: "Test Book", author: "Test Author" };

      const mockRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: [mockBook] })
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect.mockResolvedValue(mockConnection);

      const book = await bookModel.getBookById(1);

      expect(mockRequest.input).toHaveBeenCalledWith("id", sql.Int, 1);
      expect(book).toEqual(mockBook);
    });

    it("should return null when book not found", async () => {
      const mockRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: [] })
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect.mockResolvedValue(mockConnection);

      const book = await bookModel.getBookById(999);

      expect(book).toBeNull();
    });
  });

  describe("createBook", () => {
    it("should create a new book", async () => {
      const bookData = { title: "New Book", author: "New Author" };
      const createdBook = { id: 1, ...bookData };

      // Mock the create operation
      const mockCreateRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: [{ id: 1 }] })
      };

      // Mock the get operation for returning the created book
      const mockGetRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: [createdBook] })
      };

      const mockConnection = {
        request: jest.fn()
          .mockReturnValueOnce(mockCreateRequest)
          .mockReturnValueOnce(mockGetRequest),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect.mockResolvedValue(mockConnection);

      const result = await bookModel.createBook(bookData);

      expect(mockCreateRequest.input).toHaveBeenCalledWith("title", sql.NVarChar(50), bookData.title);
      expect(mockCreateRequest.input).toHaveBeenCalledWith("author", sql.NVarChar(50), bookData.author);
      expect(result).toEqual(createdBook);
    });
  });

  describe("updateBook", () => {
    it("should update a book successfully", async () => {
      const bookData = { title: "Updated Book", author: "Updated Author" };
      const updatedBook = { id: 1, ...bookData };

      // Mock the update operation
      const mockUpdateRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
      };

      // Mock the get operation for returning the updated book
      const mockGetRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: [updatedBook] })
      };

      const mockConnection = {
        request: jest.fn()
          .mockReturnValueOnce(mockUpdateRequest)
          .mockReturnValueOnce(mockGetRequest),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect.mockResolvedValue(mockConnection);

      const result = await bookModel.updateBook(1, bookData);

      expect(result).toEqual(updatedBook);
    });

    it("should return null when updating non-existent book", async () => {
      const bookData = { title: "Updated Book", author: "Updated Author" };

      const mockRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [0] })
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect.mockResolvedValue(mockConnection);

      const result = await bookModel.updateBook(999, bookData);

      expect(result).toBeNull();
    });
  });
});