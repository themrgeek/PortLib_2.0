const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

// Routes
const AUTH_USER_SERVICE_URL =
  process.env.AUTH_USER_SERVICE_URL || "http://localhost:8001";
const AUTH_ADMIN_SERVICE_URL =
  process.env.AUTH_ADMIN_SERVICE_URL || "http://localhost:8002";

app.use(
  "/auth/user",
  createProxyMiddleware({
    target: AUTH_USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/auth/user": "",
    },
  })
);

app.use(
  "/auth/admin",
  createProxyMiddleware({
    target: AUTH_ADMIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/auth/admin": "",
    },
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "API Gateway is healthy" });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
