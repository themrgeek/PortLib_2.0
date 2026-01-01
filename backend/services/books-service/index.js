const express = require("express");
const cors = require("cors");
const booksRoutes = require("./routes/books.routes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8003;

app.use(cors());
app.use(express.json());

// Routes
app.use("/", booksRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Books service is healthy" });
});

app.listen(PORT, () => {
  console.log(`Books service running on port ${PORT}`);
});

