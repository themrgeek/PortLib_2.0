const express = require("express");
const {
  signup,
  verifyOTP,
  login,
  verifyLoginOTP,
  approveAdmin,
  forgotPassword,
  resetPassword,
} = require("../controllers/admin.controller");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/verify-login-otp", verifyLoginOTP);
router.post("/approve", approveAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
