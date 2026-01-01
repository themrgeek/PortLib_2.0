const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const { authMiddleware, adminOnly } = require("../middleware/auth.middleware");

// All routes require admin authentication
router.use(authMiddleware, adminOnly);

// Get all users (students and librarians)
router.get("/", usersController.getAllUsers);

// Get user by ID
router.get("/:id", usersController.getUserById);

// Delete user
router.delete("/:id", usersController.deleteUser);

// Suspend user
router.post("/:id/suspend", usersController.suspendUser);

// Unsuspend user
router.post("/:id/unsuspend", usersController.unsuspendUser);

module.exports = router;

