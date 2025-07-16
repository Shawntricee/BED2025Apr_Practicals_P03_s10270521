const userController = require("../controllers/userController");
const userModel = require("../models/userModel");

jest.mock("../models/userModel");

describe("User Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a new user and return 201", async () => {
      const userData = { username: "testuser", email: "test@example.com" };
      const createdUser = { id: 1, ...userData };

      userModel.createUser.mockResolvedValue(createdUser);

      const req = { body: userData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await userController.createUser(req, res);

      expect(userModel.createUser).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdUser);
    });

    it("should handle creation errors", async () => {
      userModel.createUser.mockRejectedValue(new Error("Database error"));

      const req = { body: { username: "test", email: "test@example.com" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error creating user" });
    });
  });

  describe("getAllUsers", () => {
    it("should fetch all users and return JSON response", async () => {
      const mockUsers = [
        { id: 1, username: "user1", email: "user1@example.com" },
        { id: 2, username: "user2", email: "user2@example.com" }
      ];

      userModel.getAllUsers.mockResolvedValue(mockUsers);

      const req = {};
      const res = {
        json: jest.fn()
      };

      await userController.getAllUsers(req, res);

      expect(userModel.getAllUsers).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe("searchUsers", () => {
    it("should search users with search term", async () => {
      const searchTerm = "john";
      const mockResults = [
        { id: 1, username: "john_doe", email: "john@example.com" }
      ];

      userModel.searchUsers.mockResolvedValue(mockResults);

      const req = { query: { searchTerm } };
      const res = {
        json: jest.fn()
      };

      await userController.searchUsers(req, res);

      expect(userModel.searchUsers).toHaveBeenCalledWith(searchTerm);
      expect(res.json).toHaveBeenCalledWith(mockResults);
    });

    it("should return 400 when search term is missing", async () => {
      const req = { query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await userController.searchUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Search term is required" });
    });
  });
});