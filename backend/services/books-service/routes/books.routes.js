const express = require("express");
const router = express.Router();
const booksController = require("../controllers/books.controller");
const { authMiddleware, adminOnly } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// Public routes
router.get("/", booksController.getAllBooks);
router.get("/:id", booksController.getBookById);

// Admin only routes
router.post("/", authMiddleware, adminOnly, upload.single("cover_image"), booksController.createBook);
router.put("/:id", authMiddleware, adminOnly, upload.single("cover_image"), booksController.updateBook);
router.delete("/:id", authMiddleware, adminOnly, booksController.deleteBook);

// Stats route for dashboard
router.get("/stats/summary", authMiddleware, adminOnly, booksController.getBookStats);

module.exports = router;

