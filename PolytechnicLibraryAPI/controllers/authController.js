const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

class AuthController {
  static async register(req, res) {
    const { username, password, role } = req.body;

    try {
      // Check if username already exists
      const existingUser = await User.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const userData = {
        username,
        passwordHash: hashedPassword,
        role: role || 'member' // Default to member if no role specified
      };

      const newUser = await User.createUser(userData);
      
      // Remove sensitive data from response
      const { passwordHash, ...userResponse } = newUser;
      
      return res.status(201).json({ 
        message: "User created successfully",
        user: userResponse
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async login(req, res) {
    const { username, password } = req.body;

    try {
      // Validate user credentials
      const user = await User.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare password with hash
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const payload = {
        id: user.user_id,
        username: user.username,
        role: user.role,
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: "24h" 
      });

      return res.status(200).json({ 
        message: "Login successful",
        token,
        user: {
          id: user.user_id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = AuthController;