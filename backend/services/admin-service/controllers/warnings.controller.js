const supabase = require("../../../shared/db/supabase");
const { sendEmail } = require("../../../shared/services/email.service");

const WARNING_TYPE_LABELS = {
  overdue: "Overdue Book Return",
  nuisance: "Nuisance Behavior",
  harassment: "Harassment",
  hate_speech: "Hate Speech",
  other: "Other Violation",
};

// Get all warnings
const getAllWarnings = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("warnings")
      .select(`
        id, type, description, is_read, created_at,
        user:user_id (id, email, role, student_id, employee_id),
        admin:admin_id (id, email)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (type) {
      query = query.eq("type", type);
    }

    const { data: warnings, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      warnings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get warnings error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get warnings for a specific user
const getUserWarnings = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: warnings, error } = await supabase
      .from("warnings")
      .select(`
        id, type, description, is_read, created_at,
        admin:admin_id (id, email)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get user's warning count
    const { data: user } = await supabase
      .from("users")
      .select("warning_count, is_suspended")
      .eq("id", userId)
      .single();

    res.status(200).json({
      warnings,
      warningCount: user?.warning_count || 0,
      isSuspended: user?.is_suspended || false,
    });
  } catch (error) {
    console.error("Get user warnings error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Send a warning
const sendWarning = async (req, res) => {
  try {
    const { user_id, type, description } = req.body;
    const admin_id = req.user.id;

    if (!user_id || !type || !description) {
      return res.status(400).json({ error: "user_id, type, and description are required" });
    }

    // Validate warning type
    if (!["overdue", "nuisance", "harassment", "hate_speech", "other"].includes(type)) {
      return res.status(400).json({ error: "Invalid warning type" });
    }

    // Get user details for email notification
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, warning_count")
      .eq("id", user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create warning (trigger will auto-increment warning_count and check for auto-suspension)
    const { data: warning, error: warningError } = await supabase
      .from("warnings")
      .insert([
        {
          user_id,
          admin_id,
          type,
          description,
        },
      ])
      .select()
      .single();

    if (warningError) throw warningError;

    // Send email notification
    const warningNumber = (user.warning_count || 0) + 1;
    const suspensionNotice = warningNumber >= 3 
      ? "\n\nIMPORTANT: This is your 3rd warning. Your account has been automatically suspended for 30 days."
      : warningNumber === 2 
        ? "\n\nWARNING: This is your 2nd warning. One more warning will result in automatic account suspension."
        : "";

    try {
      await sendEmail({
        to: user.email,
        subject: `Library Warning: ${WARNING_TYPE_LABELS[type]}`,
        text: `Dear User,\n\nYou have received a warning for: ${WARNING_TYPE_LABELS[type]}\n\nDetails: ${description}\n\nThis is warning #${warningNumber} on your account.${suspensionNotice}\n\nPlease take this seriously and ensure compliance with library rules.\n\nBest regards,\nPortLib Library Management`,
      });
    } catch (emailError) {
      console.error("Failed to send warning email:", emailError);
    }

    // Check if user got auto-suspended
    const { data: updatedUser } = await supabase
      .from("users")
      .select("is_suspended, warning_count")
      .eq("id", user_id)
      .single();

    res.status(201).json({
      message: "Warning sent successfully",
      warning,
      userWarningCount: updatedUser?.warning_count || warningNumber,
      userSuspended: updatedUser?.is_suspended || false,
    });
  } catch (error) {
    console.error("Send warning error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mark warning as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: warning, error } = await supabase
      .from("warnings")
      .update({ is_read: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!warning) {
      return res.status(404).json({ error: "Warning not found" });
    }

    res.status(200).json({
      message: "Warning marked as read",
    });
  } catch (error) {
    console.error("Mark warning as read error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllWarnings,
  getUserWarnings,
  sendWarning,
  markAsRead,
};

