import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Text, Card, Avatar, IconButton } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";
import { COLORS, USER_ROLES } from "../../utils/constants";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

function DashboardScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const isAdmin =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.LIBRARIAN;

  const getInitials = (text) => {
    if (!text) return "U";
    return text
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const stats = [
    {
      title: "Total Books",
      value: "1,234",
      icon: "book-multiple",
      color: "#2196f3",
    },
    {
      title: "Active Users",
      value: "567",
      icon: "account-group",
      color: "#4caf50",
      showForAdmin: true,
    },
    {
      title: "Books Issued",
      value: "89",
      icon: "book-check",
      color: "#ff9800",
      showForAdmin: true,
    },
    {
      title: "Popularity",
      value: "+12%",
      icon: "trending-up",
      color: "#f44336",
    },
  ].filter((stat) => !stat.showForAdmin || isAdmin);

  const quickActions = [
    {
      title: "Browse Books",
      description: "Search and explore available books",
      icon: "book-search",
      color: "#2196f3",
    },
    ...(isAdmin
      ? [
          {
            title: "Manage Users",
            description: "View and manage library users",
            icon: "account-cog",
            color: "#4caf50",
          },
          {
            title: "View Reports",
            description: "Generate and view reports",
            icon: "chart-bar",
            color: "#ff9800",
          },
        ]
      : []),
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <LinearGradient
          colors={[COLORS.gradient1, COLORS.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeBanner}
        >
          <View style={styles.welcomeContent}>
            <Avatar.Text
              size={64}
              label={getInitials(user?.name || user?.email)}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>
                Welcome back, {user?.name || user?.email}!
              </Text>
              <Text style={styles.welcomeSubtitle}>
                {user?.role?.toUpperCase()} Dashboard
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Card key={index} style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <View style={styles.statRow}>
                    <Avatar.Icon
                      size={56}
                      icon={stat.icon}
                      style={{ backgroundColor: stat.color }}
                    />
                    <View style={styles.statInfo}>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statTitle}>{stat.title}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              {quickActions.map((action, index) => (
                <View key={index}>
                  <View style={styles.actionItem}>
                    <MaterialCommunityIcons
                      name={action.icon}
                      size={40}
                      color={action.color}
                    />
                    <View style={styles.actionText}>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <Text style={styles.actionDescription}>
                        {action.description}
                      </Text>
                    </View>
                    <IconButton
                      icon="chevron-right"
                      size={24}
                      iconColor="#999"
                    />
                  </View>
                  {index < quickActions.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
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
  welcomeBanner: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 24,
    marginBottom: 16,
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
    fontSize: 24,
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
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
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: cardWidth,
    marginBottom: 12,
    borderRadius: 12,
  },
  statContent: {
    paddingVertical: 12,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionCard: {
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionText: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  actionDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
});

export default DashboardScreen;
