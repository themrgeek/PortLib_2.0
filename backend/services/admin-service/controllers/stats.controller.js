const supabase = require("../../../shared/db/supabase");

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Total books
    const { count: totalBooks } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true });

    // Total active users (students + librarians)
    const { count: activeUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .in("role", ["student", "librarian"])
      .eq("status", "active")
      .eq("is_suspended", false);

    // Suspended users
    const { count: suspendedUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_suspended", true);

    // Pending warnings (unread)
    const { count: pendingWarnings } = await supabase
      .from("warnings")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    // Total warnings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: warningsThisMonth } = await supabase
      .from("warnings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    // Users by role
    const { data: usersByRole } = await supabase
      .from("users")
      .select("role")
      .in("role", ["student", "librarian"]);

    const studentCount = usersByRole?.filter(u => u.role === "student").length || 0;
    const librarianCount = usersByRole?.filter(u => u.role === "librarian").length || 0;

    // Recent warnings
    const { data: recentWarnings } = await supabase
      .from("warnings")
      .select(`
        id, type, created_at,
        user:user_id (email, role)
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    // Recent users
    const { data: recentUsers } = await supabase
      .from("users")
      .select("id, email, role, created_at")
      .in("role", ["student", "librarian"])
      .order("created_at", { ascending: false })
      .limit(5);

    res.status(200).json({
      stats: {
        totalBooks: totalBooks || 0,
        activeUsers: activeUsers || 0,
        suspendedUsers: suspendedUsers || 0,
        pendingWarnings: pendingWarnings || 0,
        warningsThisMonth: warningsThisMonth || 0,
        students: studentCount,
        librarians: librarianCount,
      },
      recentWarnings: recentWarnings || [],
      recentUsers: recentUsers || [],
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardStats,
};

