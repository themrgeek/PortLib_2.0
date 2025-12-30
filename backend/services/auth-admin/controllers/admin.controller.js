const supabase = require("../../../shared/db/supabase");
const {
  hashPassword,
  comparePassword,
  generateToken,
  generateOTP,
} = require("../../../shared/services/auth.utils");
const { sendEmail } = require("../../../shared/services/email.service");
const { sendSMS } = require("../../../shared/services/sms.service");

const signup = async (req, res) => {
  try {
    const { admin_key, email, phone, password, confirm_password } = req.body;

    if (password !== confirm_password) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from("users")
      .select("id, status, email, phone")
      .or(`email.eq.${email},phone.eq.${phone}`)
      .eq("role", "admin")
      .maybeSingle();

    if (existingAdmin) {
      if (existingAdmin.status === "active" || existingAdmin.status === "pending_approval") {
        const field = existingAdmin.email === email ? "Email" : "Phone";
        return res.status(400).json({ error: `Admin with this ${field} already exists` });
      } else {
        // Delete old pending record
        await supabase.from("users").delete().eq("id", existingAdmin.id);
      }
    }

    // Verify admin_key
    const { data: keyData, error: keyError } = await supabase
      .from("admin_keys")
      .select("*")
      .eq("key_value", admin_key)
      .eq("is_used", false)
      .single();

    if (keyError || !keyData) {
      return res
        .status(400)
        .json({ error: "Invalid or already used admin key" });
    }

    // Check if it's the first admin
    const { count: adminCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    const isFirstAdmin = adminCount === 0;
    const status = isFirstAdmin ? "active" : "pending_approval";

    // Hash password
    const password_hash = await hashPassword(password);

    // Create admin user
    const { data: admin, error: adminError } = await supabase
      .from("users")
      .insert([
        {
          role: "admin",
          email,
          phone,
          password_hash,
          status,
          is_first_admin: isFirstAdmin,
          admin_access_key: admin_key, // Plan mentioned login using admin access key
        },
      ])
      .select()
      .single();

    if (adminError) throw adminError;

    // Mark key as used
    await supabase
      .from("admin_keys")
      .update({ is_used: true })
      .eq("id", keyData.id);

    // Generate and store OTPs
    const emailOTP = generateOTP();
    const smsOTP = generateOTP();

    await supabase.from("otps").insert([
      {
        user_id: admin.id,
        otp_code: emailOTP,
        type: "email",
        expires_at: new Date(Date.now() + 10 * 60000),
      },
      {
        user_id: admin.id,
        otp_code: smsOTP,
        type: "sms",
        expires_at: new Date(Date.now() + 10 * 60000),
      },
    ]);

    // Send OTPs
    await sendEmail({
      to: email,
      subject: "Admin Signup OTP",
      text: `Your OTP is ${emailOTP}`,
    });
    await sendSMS({ to: phone, body: `Your OTP is ${smsOTP}` });

    res.status(201).json({
      message: isFirstAdmin
        ? "First admin created. Please verify OTP."
        : "Admin signup successful. Awaiting approval from First Admin.",
      adminId: admin.id,
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    res.status(500).json({ error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  // Logic same as user service verifyOTP
  try {
    const { adminId, emailOTP, smsOTP } = req.body;

    const { data: emailData, error: emailError } = await supabase
      .from("otps")
      .select("*")
      .eq("user_id", adminId)
      .eq("otp_code", emailOTP)
      .eq("type", "email")
      .gt("expires_at", new Date().toISOString())
      .single();

    const { data: smsData, error: smsError } = await supabase
      .from("otps")
      .select("*")
      .eq("user_id", adminId)
      .eq("otp_code", smsOTP)
      .eq("type", "sms")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (emailError || !emailData || smsError || !smsData) {
      return res.status(400).json({ error: "Invalid or expired OTPs" });
    }

    // For first admin, already active. For others, status remains pending_approval.
    await supabase.from("otps").delete().eq("user_id", adminId);

    res.status(200).json({ message: "OTPs verified successfully" });
  } catch (error) {
    console.error("Admin OTP verification error:", error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { admin_access_key, email } = req.body;

    const { data: admin, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("admin_access_key", admin_access_key)
      .eq("role", "admin")
      .single();

    if (error || !admin)
      return res.status(401).json({ error: "Invalid admin credentials" });
    if (admin.status !== "active")
      return res
        .status(403)
        .json({ error: "Admin access is blocked or pending approval" });

    // Admin login email authentication (as per plan)
    const emailOTP = generateOTP();
    await supabase
      .from("otps")
      .insert([
        {
          user_id: admin.id,
          otp_code: emailOTP,
          type: "email",
          expires_at: new Date(Date.now() + 10 * 60000),
        },
      ]);

    await sendEmail({
      to: admin.email,
      subject: "Admin Login OTP",
      text: `Your login OTP is ${emailOTP}`,
    });

    res
      .status(200)
      .json({ message: "OTP sent for login verification", adminId: admin.id });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: error.message });
  }
};

const verifyLoginOTP = async (req, res) => {
  try {
    const { adminId, emailOTP } = req.body;

    const { data: emailData, error: emailError } = await supabase
      .from("otps")
      .select("*")
      .eq("user_id", adminId)
      .eq("otp_code", emailOTP)
      .eq("type", "email")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (emailError || !emailData)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    const { data: admin } = await supabase
      .from("users")
      .select("*")
      .eq("id", adminId)
      .single();
    const token = generateToken({ id: admin.id, role: "admin" });

    await supabase.from("otps").delete().eq("user_id", adminId);

    res
      .status(200)
      .json({
        message: "Admin login successful",
        token,
        admin: { id: admin.id, email: admin.email },
      });
  } catch (error) {
    console.error("Admin login verification error:", error);
    res.status(500).json({ error: error.message });
  }
};

const approveAdmin = async (req, res) => {
  try {
    const { requesterId, targetAdminId } = req.body;

    // Check if requester is first admin
    const { data: requester, error: reqError } = await supabase
      .from("users")
      .select("*")
      .eq("id", requesterId)
      .single();

    if (reqError || !requester.is_first_admin) {
      return res
        .status(403)
        .json({ error: "Only the First Admin can approve other admins" });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ status: "active" })
      .eq("id", targetAdminId);

    if (updateError) throw updateError;

    res.status(200).json({ message: "Admin approved successfully" });
  } catch (error) {
    console.error("Admin approval error:", error);
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const { data: admin, error } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .eq("role", "admin")
      .single();

    if (error || !admin)
      return res.status(404).json({ error: "Admin not found" });

    const otp = generateOTP();
    await supabase
      .from("otps")
      .insert([
        {
          user_id: admin.id,
          otp_code: otp,
          type: "forgot_password",
          expires_at: new Date(Date.now() + 15 * 60000),
        },
      ]);

    await sendEmail({
      to: admin.email,
      subject: "Admin Password Reset OTP",
      text: `Your password reset OTP is ${otp}`,
    });

    res
      .status(200)
      .json({ message: "Password reset OTP sent to email", adminId: admin.id });
  } catch (error) {
    console.error("Admin forgot password error:", error);
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { adminId, otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const { data: otpData, error: otpError } = await supabase
      .from("otps")
      .select("*")
      .eq("user_id", adminId)
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
      .eq("id", adminId);

    if (updateError) throw updateError;

    await supabase.from("otps").delete().eq("user_id", adminId);

    res.status(200).json({ message: "Admin password reset successful" });
  } catch (error) {
    console.error("Admin reset password error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signup,
  verifyOTP,
  login,
  verifyLoginOTP,
  approveAdmin,
  forgotPassword,
  resetPassword,
};
