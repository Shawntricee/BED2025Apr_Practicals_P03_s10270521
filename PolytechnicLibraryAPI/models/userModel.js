const sql = require("mssql");
const dbConfig = require("../dbConfig");

class User {
  static async createUser(userData) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const query = `
        INSERT INTO Users (username, passwordHash, role) 
        VALUES (@username, @passwordHash, @role);
        SELECT SCOPE_IDENTITY() AS user_id;
      `;
      
      const request = connection.request();
      request.input("username", sql.NVarChar(255), userData.username);
      request.input("passwordHash", sql.NVarChar(255), userData.passwordHash);
      request.input("role", sql.NVarChar(20), userData.role);
      
      const result = await request.query(query);
      const newUserId = result.recordset[0].user_id;
      
      return await this.getUserById(newUserId);
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  static async getUserById(userId) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const query = "SELECT user_id, username, role FROM Users WHERE user_id = @userId";
      
      const request = connection.request();
      request.input("userId", sql.Int, userId);
      
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

  static async getUserByUsername(username) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const query = "SELECT user_id, username, passwordHash, role FROM Users WHERE username = @username";
      
      const request = connection.request();
      request.input("username", sql.NVarChar(255), username);
      
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

module.exports = User;