const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const { authMiddleware, adminOnly } = require("../middleware/auth.middleware");

// All routes require admin authentication
router.use(authMiddleware, adminOnly);

// Get dashboard statistics
router.get("/dashboard", statsController.getDashboardStats);

module.exports = router;

