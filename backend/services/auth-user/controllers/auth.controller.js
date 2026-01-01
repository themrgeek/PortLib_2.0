const supabase = require("../../../shared/db/supabase");
const {
  hashPassword,
  comparePassword,
  generateToken,
  generateOTP,
} = require("../../../shared/services/auth.utils");
const { sendEmail } = require("../../../shared/services/email.service");
const { sendSMS } = require("../../../shared/services/sms.service");
const { uploadFile } = require("../../../shared/services/storage.service");

const signup = async (req, res) => {
  try {
    const { role, email, phone, password, confirm_password, ...extraFields } =
      req.body;

    if (password !== confirm_password) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "ID proof is required" });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id, status, email, phone")
      .or(`email.eq.${email},phone.eq.${phone}`)
      .maybeSingle();

    if (existingUser) {
      if (existingUser.status === "active") {
        const field = existingUser.email === email ? "Email" : "Phone";
        return res.status(400).json({ error: `${field} is already registered` });
      } else {
        // Delete old pending user to allow re-signup
        await supabase.from("users").delete().eq("id", existingUser.id);
      }
    }

    // Check for ID uniqueness (student_id or employee_id)
    const idField = role === "student" ? "student_id" : "employee_id";
    if (extraFields[idField]) {
      const { data: existingId } = await supabase
        .from("users")
        .select("id")
        .eq(idField, extraFields[idField])
        .maybeSingle();
      
      if (existingId) {
        return res.status(400).json({ error: `${idField.replace('_', ' ').toUpperCase()} is already registered` });
      }
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Upload ID card
    const fileName = `${role}/${Date.now()}_${req.file.originalname}`;
    const id_card_url = await uploadFile(
      "verification-docs",
      fileName,
      req.file.buffer,
      req.file.mimetype
    );

    // Create user in DB
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([
        {
          role,
          email,
          phone,
          password_hash,
          id_card_url,
          status: "pending",
          ...extraFields,
        },
      ])
      .select()
      .single();

    if (userError) throw userError;

    // Generate and store OTPs
    const emailOTP = generateOTP();
    const smsOTP = generateOTP();

    const { error: otpError } = await supabase.from("otps").insert([
      {
        user_id: user.id,
        otp_code: emailOTP,
        type: "email",
        expires_at: new Date(Date.now() + 10 * 60000),
      },
      {
        user_id: user.id,
        otp_code: smsOTP,
        type: "sms",
        expires_at: new Date(Date.now() + 10 * 60000),
      },
    ]);

    if (otpError) throw otpError;

    // Send OTPs
    await sendEmail({
      to: email,
      subject: "Your Signup OTP",
      text: `Your email verification OTP is ${emailOTP}`,
    });

    await sendSMS({
      to: phone,
      body: `Your phone verification OTP is ${smsOTP}`,
    });

    res
      .status(201)
      .json({
        message:
          "Signup successful. Please verify OTPs sent to your email and phone.",
        userId: user.id,
      });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { userId, emailOTP, smsOTP } = req.body;

    // Verify Email OTP
    const { data: emailData, error: emailError } = await supabase
      .from("otps")
      .select("*")
      .eq("user_id", userId)
      .eq("otp_code", emailOTP)
      .eq("type", "email")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (emailError || !emailData)
      return res.status(400).json({ error: "Invalid or expired email OTP" });

    // Verify SMS OTP
    const { data: smsData, error: smsError } = await supabase
      .from("otps")
      .select("*")
      .eq("user_id", userId)
      .eq("otp_code", smsOTP)
      .eq("type", "sms")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (smsError || !smsData)
      return res.status(400).json({ error: "Invalid or expired SMS OTP" });

    // Activate user
    const { error: updateError } = await supabase
      .from("users")
      .update({ status: "active" })
      .eq("id", userId);

    if (updateError) throw updateError;

    // Delete used OTPs
    await supabase.from("otps").delete().eq("user_id", userId);

    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.error("OTP Verification error:", error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body; // identifier can be student_id or employee_id
    const identifierField = role === "student" ? "student_id" : "employee_id";

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq(identifierField, identifier)
      .eq("role", role)
      .single();

    if (error || !user)
      return res.status(401).json({ error: "Invalid credentials" });
    if (user.status !== "active")
      return res.status(403).json({ error: "Account not verified or blocked" });

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Generate login OTPs
    const emailOTP = generateOTP();
    const smsOTP = generateOTP();

    await supabase.from("otps").insert([
      {
        user_id: user.id,
        otp_code: emailOTP,
        type: "email",
        expires_at: new Date(Date.now() + 10 * 60000),
      },
      {
        user_id: user.id,
        otp_code: smsOTP,
        type: "sms",
        expires_at: new Date(Date.now() + 10 * 60000),
      },
    ]);

    await sendEmail({
      to: user.email,
      subject: "Login OTP",
      text: `Your login OTP is ${emailOTP}`,
    });
    await sendSMS({ to: user.phone, body: `Your login OTP is ${smsOTP}` });

    res
      .status(200)
      .json({ message: "OTP sent for login verification", userId: user.id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

const verifyLoginOTP = async (req, res) => {
  try {
    const { userId, emailOTP, smsOTP } = req.body;

    // Same logic as verifyOTP but returns a JWT
    const { data: emailData, error: emailError } = await supabase
      .from("otps")
      .select("*")
      .eq("user_id", userId)
      .eq("otp_code", emailOTP)
      .eq("type", "email")
      .gt("expires_at", new Date().toISOString())
      .single();

    const { data: smsData, error: smsError } = await supabase
      .from("otps")
      .select("*")
      .eq("user_id", userId)
      .eq("otp_code", smsOTP)
      .eq("type", "sms")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (emailError || !emailData || smsError || !smsData) {
      return res.status(400).json({ error: "Invalid or expired OTPs" });
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    const token = generateToken({ id: user.id, role: user.role });

    await supabase.from("otps").delete().eq("user_id", userId);

    res
      .status(200)
      .json({
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email, role: user.role },
      });
  } catch (error) {
    console.error("Login OTP Verification error:", error);
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .eq("role", role)
      .single();

    if (error || !user)
      return res.status(404).json({ error: "User not found" });

    const otp = generateOTP();
    await supabase
      .from("otps")
      .insert([
        {
          user_id: user.id,
          otp_code: otp,
          type: "forgot_password",
          expires_at: new Date(Date.now() + 15 * 60000),
        },
      ]);

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is ${otp}`,
    });

    res
      .status(200)
      .json({ message: "Password reset OTP sent to email", userId: user.id });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const { data: otpData, error: otpError } = await supabase
      .from("otps")
      .select("*")
      .eq("user_id", userId)
      .eq("otp_code", otp)
      .eq("type", "forgot_password")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (otpError || !otpData)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    const password_hash = await hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash })
      .eq("id", userId);

    if (updateError) throw updateError;

    await supabase.from("otps").delete().eq("user_id", userId);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signup,
  verifyOTP,
  login,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
};
