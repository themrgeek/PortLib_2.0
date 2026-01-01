const express = require("express");
const cors = require("cors");
const usersRoutes = require("./routes/users.routes");
const warningsRoutes = require("./routes/warnings.routes");
const statsRoutes = require("./routes/stats.routes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8004;

app.use(cors());
app.use(express.json());

// Routes
app.use("/users", usersRoutes);
app.use("/warnings", warningsRoutes);
app.use("/stats", statsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Admin service is healthy" });
});

app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`);
});

