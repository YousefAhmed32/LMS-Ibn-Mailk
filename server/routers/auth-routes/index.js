
const express = require("express");
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  updateUserProfile,
  getUserById,
  getAllUsers,
  refreshToken
} = require("../../controllers/auth-controller");

const { 
  validateLogin, 
  validateUpdate, 
  handleValidationErrors 
} = require("../../middleware/validation");

const { 
  validateRoleBasedRegistration
} = require("../../middleware/roleValidation");

const { 
  authenticateToken, 
  requireAdmin 
} = require("../../middleware/auth");

// Public routes
router.post("/register", validateRoleBasedRegistration, registerUser);
router.post("/login", validateLogin, handleValidationErrors, loginUser);

// Protected routes
router.get("/me", authenticateToken, getCurrentUser);
router.put("/update", authenticateToken, validateUpdate, handleValidationErrors, updateUserProfile);
router.post("/refresh", refreshToken); // Refresh token endpoint (no auth middleware needed)

// Admin only routes
router.get("/users", authenticateToken, requireAdmin, getAllUsers);
router.get("/users/:userId", authenticateToken, requireAdmin, getUserById);

module.exports = router;
