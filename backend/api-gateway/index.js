const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

<<<<<<< HEAD
// Routes
=======
// Service URLs
>>>>>>> feature-101/authentication_page_based_on_microservice
const AUTH_USER_SERVICE_URL =
  process.env.AUTH_USER_SERVICE_URL || "http://localhost:8001";
const AUTH_ADMIN_SERVICE_URL =
  process.env.AUTH_ADMIN_SERVICE_URL || "http://localhost:8002";
<<<<<<< HEAD

=======
const BOOKS_SERVICE_URL =
  process.env.BOOKS_SERVICE_URL || "http://localhost:8003";
const ADMIN_SERVICE_URL =
  process.env.ADMIN_SERVICE_URL || "http://localhost:8004";

// Auth User routes
>>>>>>> feature-101/authentication_page_based_on_microservice
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

<<<<<<< HEAD
=======
// Auth Admin routes
>>>>>>> feature-101/authentication_page_based_on_microservice
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

<<<<<<< HEAD
=======
// Books routes
app.use(
  "/books",
  createProxyMiddleware({
    target: BOOKS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/books": "",
    },
  })
);

// Admin management routes (users, warnings, stats)
app.use(
  "/admin",
  createProxyMiddleware({
    target: ADMIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/admin": "",
    },
  })
);

// Health check
>>>>>>> feature-101/authentication_page_based_on_microservice
app.get("/health", (req, res) => {
  res.status(200).json({ status: "API Gateway is healthy" });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
