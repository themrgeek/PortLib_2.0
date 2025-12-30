const supabase = require("../../../shared/db/supabase");

// Get all users (students and librarians)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("users")
      .select("id, email, phone, role, status, student_id, employee_id, warning_count, is_suspended, suspended_until, created_at", { count: "exact" })
      .in("role", ["student", "librarian"])
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    // Search filter
    if (search) {
      query = query.or(
        `email.ilike.%${search}%,phone.ilike.%${search}%,student_id.ilike.%${search}%,employee_id.ilike.%${search}%`
      );
    }

    // Role filter
    if (role) {
      query = query.eq("role", role);
    }

    // Status filter
    if (status === "suspended") {
      query = query.eq("is_suspended", true);
    } else if (status === "active") {
      query = query.eq("is_suspended", false).eq("status", "active");
    }

    const { data: users, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, phone, role, status, student_id, employee_id, warning_count, is_suspended, suspended_until, suspended_reason, created_at")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's warnings
    const { data: warnings } = await supabase
      .from("warnings")
      .select("id, type, description, created_at, is_read")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    res.status(200).json({
      ...user,
      warnings: warnings || [],
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists and is not an admin
    const { data: user, error: checkError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", id)
      .single();

    if (checkError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ error: "Cannot delete admin users" });
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Suspend user
const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, duration_days = 30 } = req.body;

    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + parseInt(duration_days));

    const { data: user, error } = await supabase
      .from("users")
      .update({
        is_suspended: true,
        suspended_until: suspendedUntil.toISOString(),
        suspended_reason: reason || "Suspended by admin",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User suspended successfully",
      suspended_until: suspendedUntil,
    });
  } catch (error) {
    console.error("Suspend user error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Unsuspend user
const unsuspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from("users")
      .update({
        is_suspended: false,
        suspended_until: null,
        suspended_reason: null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User suspension lifted successfully",
    });
  } catch (error) {
    console.error("Unsuspend user error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  suspendUser,
  unsuspendUser,
};

