import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Text,
  Card,
  Avatar,
  ActivityIndicator,
  Searchbar,
  Chip,
  IconButton,
  SegmentedButtons,
  Dialog,
  Portal,
  Button,
  TextInput,
  List,
  Divider,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import adminService from "../../services/admin.service";
import { COLORS } from "../../utils/constants";

const WARNING_TYPE_LABELS = {
  overdue: "Overdue",
  nuisance: "Nuisance",
  harassment: "Harassment",
  hate_speech: "Hate Speech",
  other: "Other",
};

function UsersManagement({ navigation, route }) {
  const initialStatus = route.params?.status || "active";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(initialStatus === "suspended" ? "suspended" : "all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDays, setSuspendDays] = useState("30");

  useEffect(() => {
    fetchUsers();
  }, [search, tab]);

  const getRoleFilter = () => {
    if (tab === "students") return "student";
    return undefined;
  };

  const getStatusFilter = () => {
    if (tab === "suspended") return "suspended";
    return "active";
  };

  const fetchUsers = async (loadMore = false) => {
    try {
      if (!loadMore) setLoading(true);
      const currentPage = loadMore ? page + 1 : 1;

      const data = await adminService.getUsers({
        page: currentPage,
        limit: 20,
        search: search || undefined,
        role: getRoleFilter(),
        status: getStatusFilter(),
      });

      if (loadMore) {
        setUsers((prev) => [...prev, ...(data.users || [])]);
      } else {
        setUsers(data.users || []);
      }

      setPage(currentPage);
      setHasMore(currentPage < (data.pagination?.totalPages || 1));
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchUsers();
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchUsers(true);
    }
  };

  const handleViewUser = async (user) => {
    try {
      const userData = await adminService.getUserById(user.id);
      setSelectedUser(userData);
      setViewDialogOpen(true);
    } catch (err) {
      Alert.alert("Error", "Failed to load user details");
    }
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.email}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await adminService.deleteUser(user.id);
              Alert.alert("Success", "User deleted successfully");
              fetchUsers();
            } catch (err) {
              Alert.alert("Error", err.response?.data?.error || "Failed to delete");
            }
          },
        },
      ]
    );
  };

  const handleSuspendUser = async () => {
    try {
      await adminService.suspendUser(selectedUser.id, {
        reason: suspendReason,
        duration_days: parseInt(suspendDays),
      });
      Alert.alert("Success", "User suspended successfully");
      setSuspendDialogOpen(false);
      setSuspendReason("");
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Failed to suspend");
    }
  };

  const handleUnsuspendUser = async (user) => {
    Alert.alert(
      "Unsuspend User",
      `Are you sure you want to unsuspend ${user.email}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unsuspend",
          onPress: async () => {
            try {
              await adminService.unsuspendUser(user.id);
              Alert.alert("Success", "User suspension lifted");
              fetchUsers();
            } catch (err) {
              Alert.alert("Error", err.response?.data?.error || "Failed");
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }) => (
    <Card style={styles.userCard}>
      <Card.Content>
        <View style={styles.userRow}>
          <Avatar.Icon
            size={48}
            icon="account"
            style={{
              backgroundColor: item.is_suspended ? "#f44336" : COLORS.primary,
            }}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email}
            </Text>
            <View style={styles.userMeta}>
              <Chip compact mode="flat" style={styles.roleChip}>
                {item.role}
              </Chip>
              <Chip
                compact
                mode="flat"
                icon="alert"
                style={[
                  styles.warningChip,
                  item.warning_count >= 3 && { backgroundColor: "#ffebee" },
                ]}
              >
                {item.warning_count || 0}
              </Chip>
              {item.is_suspended && (
                <Chip compact style={styles.suspendedChip} textStyle={{ color: "#fff" }}>
                  Suspended
                </Chip>
              )}
            </View>
          </View>
          <View style={styles.userActions}>
            <IconButton
              icon="eye"
              size={20}
              onPress={() => handleViewUser(item)}
            />
            {item.is_suspended ? (
              <IconButton
                icon="account-check"
                size={20}
                iconColor="#4caf50"
                onPress={() => handleUnsuspendUser(item)}
              />
            ) : (
              <IconButton
                icon="account-off"
                size={20}
                iconColor="#ff9800"
                onPress={() => {
                  setSelectedUser(item);
                  setSuspendDialogOpen(true);
                }}
              />
            )}
            <IconButton
              icon="delete"
              size={20}
              iconColor="#f44336"
              onPress={() => handleDeleteUser(item)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.gradient1, COLORS.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Users Management</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <SegmentedButtons
          value={tab}
          onValueChange={(val) => {
            setTab(val);
            setPage(1);
          }}
          buttons={[
            { value: "all", label: "All" },
            { value: "students", label: "Students" },
            { value: "suspended", label: "Suspended" },
          ]}
        />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search users..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
        />
      </View>

      {/* Users List */}
      {loading && users.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users found</Text>
          }
          ListFooterComponent={
            loading && users.length > 0 ? (
              <ActivityIndicator style={{ padding: 20 }} />
            ) : null
          }
        />
      )}

      {/* View User Dialog */}
      <Portal>
        <Dialog
          visible={viewDialogOpen}
          onDismiss={() => setViewDialogOpen(false)}
          style={styles.dialog}
        >
          <Dialog.Title>User Details</Dialog.Title>
          <Dialog.ScrollArea>
            {selectedUser && (
              <View style={styles.userDetails}>
                <List.Item
                  title="Email"
                  description={selectedUser.email}
                  left={() => <List.Icon icon="email" />}
                />
                <List.Item
                  title="Phone"
                  description={selectedUser.phone || "N/A"}
                  left={() => <List.Icon icon="phone" />}
                />
                <List.Item
                  title="Role"
                  description={selectedUser.role}
                  left={() => <List.Icon icon="account" />}
                />
                <List.Item
                  title="ID"
                  description={selectedUser.student_id || selectedUser.employee_id || "N/A"}
                  left={() => <List.Icon icon="badge-account" />}
                />
                <List.Item
                  title="Warnings"
                  description={`${selectedUser.warning_count || 0} warnings`}
                  left={() => <List.Icon icon="alert" />}
                />
                <List.Item
                  title="Status"
                  description={selectedUser.is_suspended ? "Suspended" : "Active"}
                  left={() => <List.Icon icon={selectedUser.is_suspended ? "account-off" : "account-check"} />}
                />

                {selectedUser.warnings && selectedUser.warnings.length > 0 && (
                  <>
                    <Divider style={{ marginVertical: 16 }} />
                    <Text style={styles.warningHistoryTitle}>Warning History</Text>
                    {selectedUser.warnings.map((warning, index) => (
                      <View key={warning.id || index} style={styles.warningItem}>
                        <Chip compact style={styles.warningTypeChip}>
                          {WARNING_TYPE_LABELS[warning.type] || warning.type}
                        </Chip>
                        <Text style={styles.warningDesc} numberOfLines={2}>
                          {warning.description}
                        </Text>
                        <Text style={styles.warningDate}>
                          {new Date(warning.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            )}
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setViewDialogOpen(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Suspend Dialog */}
      <Portal>
        <Dialog
          visible={suspendDialogOpen}
          onDismiss={() => setSuspendDialogOpen(false)}
        >
          <Dialog.Title>Suspend User</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 16 }}>
              Are you sure you want to suspend {selectedUser?.email}?
            </Text>
            <TextInput
              mode="outlined"
              label="Reason"
              value={suspendReason}
              onChangeText={setSuspendReason}
              multiline
              numberOfLines={2}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Duration (days)"
              value={suspendDays}
              onChangeText={setSuspendDays}
              keyboardType="numeric"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSuspendDialogOpen(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleSuspendUser}
              buttonColor="#ff9800"
            >
              Suspend
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  tabsContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  userCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  roleChip: {
    height: 24,
  },
  warningChip: {
    height: 24,
  },
  suspendedChip: {
    height: 24,
    backgroundColor: "#f44336",
  },
  userActions: {
    flexDirection: "row",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    padding: 40,
  },
  dialog: {
    maxHeight: "80%",
  },
  userDetails: {
    paddingHorizontal: 8,
  },
  warningHistoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  warningItem: {
    backgroundColor: "#fff8e1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningTypeChip: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  warningDesc: {
    fontSize: 14,
    color: "#333",
  },
  warningDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
});

export default UsersManagement;

