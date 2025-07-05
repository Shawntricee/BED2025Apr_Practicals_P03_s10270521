const Joi = require("joi");

// User registration validation schema
const userRegistrationSchema = Joi.object({
  username: Joi.string().min(3).max(255).required().messages({
    "string.base": "Username must be a string",
    "string.empty": "Username cannot be empty",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username cannot exceed 255 characters",
    "any.required": "Username is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  role: Joi.string().valid('member', 'librarian').messages({
    "any.only": "Role must be either 'member' or 'librarian'",
  }),
});

// User login validation schema
const userLoginSchema = Joi.object({
  username: Joi.string().required().messages({
    "string.empty": "Username cannot be empty",
    "any.required": "Username is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),
});

// Book availability update validation schema
const bookAvailabilitySchema = Joi.object({
  availability: Joi.string().valid('Y', 'N').required().messages({
    "any.only": "Availability must be 'Y' or 'N'",
    "any.required": "Availability is required",
  }),
});

// Middleware functions
function validateUserRegistration(req, res, next) {
  const { error } = userRegistrationSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}

function validateUserLogin(req, res, next) {
  const { error } = userLoginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}

function validateBookAvailability(req, res, next) {
  const { error } = bookAvailabilitySchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}

function validateBookId(req, res, next) {
  const bookId = parseInt(req.params.bookId);

  if (isNaN(bookId) || bookId <= 0) {
    return res.status(400).json({ 
      error: "Invalid book ID. ID must be a positive number" 
    });
  }

  next();
}

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateBookAvailability,
  validateBookId,
};