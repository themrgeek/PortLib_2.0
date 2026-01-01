import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  Avatar,
  ActivityIndicator,
  Chip,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";
import adminService from "../../services/admin.service";
import { COLORS } from "../../utils/constants";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

const WARNING_TYPE_COLORS = {
  overdue: "#ff9800",
  nuisance: "#2196f3",
  harassment: "#f44336",
  hate_speech: "#f44336",
  other: "#757575",
};

function AdminDashboard({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentWarnings, setRecentWarnings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data.stats);
      setRecentWarnings(data.recentWarnings || []);
      setRecentUsers(data.recentUsers || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const statCards = [
    {
      title: "Total Books",
      value: stats?.totalBooks || 0,
      icon: "book-multiple",
      color: "#2196f3",
      onPress: () => navigation.navigate("BooksManagement"),
    },
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      icon: "account-group",
      color: "#4caf50",
      onPress: () => navigation.navigate("UsersManagement"),
    },
    {
      title: "Warnings",
      value: stats?.pendingWarnings || 0,
      icon: "alert-circle",
      color: "#ff9800",
      onPress: () => navigation.navigate("Warnings"),
    },
    {
      title: "Suspended",
      value: stats?.suspendedUsers || 0,
      icon: "account-off",
      color: "#f44336",
      onPress: () =>
        navigation.navigate("UsersManagement", { status: "suspended" }),
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Banner */}
        <LinearGradient
          colors={[COLORS.gradient1, COLORS.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeBanner}
        >
          <View style={styles.welcomeContent}>
            <Avatar.Text
              size={56}
              label={user?.email?.charAt(0).toUpperCase() || "A"}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>Welcome back, Admin!</Text>
              <Text style={styles.welcomeSubtitle}>
                Here's what's happening today
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {statCards.map((stat, index) => (
              <TouchableOpacity
                key={index}
                style={styles.statCard}
                onPress={stat.onPress}
                activeOpacity={0.7}
              >
                <Card style={styles.cardInner}>
                  <Card.Content style={styles.statContent}>
                    <Avatar.Icon
                      size={48}
                      icon={stat.icon}
                      style={{ backgroundColor: stat.color }}
                    />
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statTitle}>{stat.title}</Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Warnings */}
        <View style={styles.section}>
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Warnings</Text>
                <Chip
                  mode="outlined"
                  onPress={() => navigation.navigate("Warnings")}
                  compact
                >
                  View All
                </Chip>
              </View>
              {recentWarnings.length === 0 ? (
                <Text style={styles.emptyText}>No recent warnings</Text>
              ) : (
                recentWarnings.map((warning, index) => (
                  <View key={warning.id || index} style={styles.listItem}>
                    <Avatar.Icon
                      size={40}
                      icon="alert"
                      style={{
                        backgroundColor:
                          WARNING_TYPE_COLORS[warning.type] || "#ff9800",
                      }}
                    />
                    <View style={styles.listItemText}>
                      <Text style={styles.listItemTitle}>
                        {warning.user?.email || "Unknown User"}
                      </Text>
                      <View style={styles.listItemMeta}>
                        <Chip mode="flat" compact style={styles.typeChip}>
                          {warning.type}
                        </Chip>
                        <Text style={styles.listItemDate}>
                          {new Date(warning.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Recent Users */}
        <View style={styles.section}>
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>New Users</Text>
                <Chip
                  mode="outlined"
                  onPress={() => navigation.navigate("UsersManagement")}
                  compact
                >
                  View All
                </Chip>
              </View>
              {recentUsers.length === 0 ? (
                <Text style={styles.emptyText}>No recent users</Text>
              ) : (
                recentUsers.map((recentUser, index) => (
                  <View key={recentUser.id || index} style={styles.listItem}>
                    <Avatar.Icon
                      size={40}
                      icon="account-plus"
                      style={{ backgroundColor: "#4caf50" }}
                    />
                    <View style={styles.listItemText}>
                      <Text style={styles.listItemTitle}>
                        {recentUser.email}
                      </Text>
                      <View style={styles.listItemMeta}>
                        <Chip mode="flat" compact style={styles.roleChip}>
                          {recentUser.role}
                        </Chip>
                        <Text style={styles.listItemDate}>
                          {new Date(recentUser.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>
        </View>

        {/* User Breakdown */}
        <View style={styles.section}>
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>User Breakdown</Text>
              <View style={styles.breakdownGrid}>
                <View style={styles.breakdownItem}>
                  <Text
                    style={[styles.breakdownValue, { color: COLORS.primary }]}
                  >
                    {stats?.students || 0}
                  </Text>
                  <Text style={styles.breakdownLabel}>Students</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text
                    style={[styles.breakdownValue, { color: COLORS.secondary }]}
                  >
                    {stats?.librarians || 0}
                  </Text>
                  <Text style={styles.breakdownLabel}>Librarians</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownValue, { color: "#ff9800" }]}>
                    {stats?.warningsThisMonth || 0}
                  </Text>
                  <Text style={styles.breakdownLabel}>This Month</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeBanner: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  welcomeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#fff",
  },
  avatarLabel: {
    color: COLORS.primary,
    fontSize: 20,
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: cardWidth,
    marginBottom: 12,
  },
  cardInner: {
    borderRadius: 12,
  },
  statContent: {
    alignItems: "center",
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionCard: {
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    paddingVertical: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  listItemText: {
    flex: 1,
    marginLeft: 12,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  listItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  listItemDate: {
    fontSize: 12,
    color: "#999",
  },
  typeChip: {
    height: 24,
  },
  roleChip: {
    height: 24,
  },
  breakdownGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  breakdownItem: {
    alignItems: "center",
  },
  breakdownValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  breakdownLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});

export default AdminDashboard;
