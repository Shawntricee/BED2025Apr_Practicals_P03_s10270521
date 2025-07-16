const userModel = require("../models/userModel");
const sql = require("mssql");

jest.mock("mssql");

describe("User Model Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const userData = { username: "testuser", email: "test@example.com" };
      const createdUser = { id: 1, ...userData };

      const mockCreateRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: [{ id: 1 }] })
      };

      const mockGetRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: [createdUser] })
      };

      const mockConnection = {
        request: jest.fn()
          .mockReturnValueOnce(mockCreateRequest)
          .mockReturnValueOnce(mockGetRequest),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect.mockResolvedValue(mockConnection);

      const result = await userModel.createUser(userData);

      expect(mockCreateRequest.input).toHaveBeenCalledWith("username", sql.NVarChar(50), userData.username);
      expect(mockCreateRequest.input).toHaveBeenCalledWith("email", sql.NVarChar(100), userData.email);
      expect(result).toEqual(createdUser);
    });
  });

  describe("searchUsers", () => {
    it("should search users by search term", async () => {
      const searchTerm = "john";
      const mockResults = [
        { id: 1, username: "john_doe", email: "john@example.com" }
      ];

      const mockRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: mockResults })
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect.mockResolvedValue(mockConnection);

      const result = await userModel.searchUsers(searchTerm);

      expect(mockRequest.input).toHaveBeenCalledWith("searchTerm", sql.NVarChar, searchTerm);
      expect(result).toEqual(mockResults);
    });
  });

  describe("getUsersWithBooks", () => {
    it("should get users with their books", async () => {
      const mockRawData = [
        { user_id: 1, username: "john", email: "john@example.com", book_id: 1, title: "Book 1", author: "Author 1" },
        { user_id: 1, username: "john", email: "john@example.com", book_id: 2, title: "Book 2", author: "Author 2" },
        { user_id: 2, username: "jane", email: "jane@example.com", book_id: null, title: null, author: null }
      ];

      const mockRequest = {
        query: jest.fn().mockResolvedValue({ recordset: mockRawData })
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined)
      };

      sql.connect.mockResolvedValue(mockConnection);

      const result = await userModel.getUsersWithBooks();

      expect(result).toHaveLength(2);
      expect(result[0].books).toHaveLength(2);
      expect(result[1].books).toHaveLength(0);
    });
  });
});