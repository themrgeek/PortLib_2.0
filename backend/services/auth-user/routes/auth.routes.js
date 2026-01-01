const express = require("express");
const multer = require("multer");
const {
  signup,
  verifyOTP,
  login,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/signup", upload.single("id_proof"), signup);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/verify-login-otp", verifyLoginOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
