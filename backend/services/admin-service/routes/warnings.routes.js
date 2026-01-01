const express = require("express");
const router = express.Router();
const warningsController = require("../controllers/warnings.controller");
const { authMiddleware, adminOnly } = require("../middleware/auth.middleware");

// All routes require admin authentication
router.use(authMiddleware, adminOnly);

// Get all warnings
router.get("/", warningsController.getAllWarnings);

// Get warnings for a specific user
router.get("/user/:userId", warningsController.getUserWarnings);

// Send a warning
router.post("/", warningsController.sendWarning);

// Mark warning as read
router.patch("/:id/read", warningsController.markAsRead);

module.exports = router;

