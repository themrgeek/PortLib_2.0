const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());

app.use("/", authRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Auth User Service is healthy" });
});

app.listen(PORT, () => {
  console.log(`Auth User Service running on port ${PORT}`);
});
