const jwt = require("jsonwebtoken");

function verifyJWT(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token." });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Access denied. Insufficient permissions." 
      });
    }

    next();
  };
}

// Specific middleware for librarian-only routes
function requireLibrarian(req, res, next) {
  return requireRole(['librarian'])(req, res, next);
}

// Middleware for routes accessible by both members and librarians
function requireAuthenticated(req, res, next) {
  return requireRole(['member', 'librarian'])(req, res, next);
}

module.exports = {
  verifyJWT,
  requireRole,
  requireLibrarian,
  requireAuthenticated,
};