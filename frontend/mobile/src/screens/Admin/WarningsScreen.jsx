import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ScrollView,
} from "react-native";
import {
  Text,
  Card,
  Avatar,
  ActivityIndicator,
  FAB,
  Chip,
  Dialog,
  Portal,
  Button,
  TextInput,
  List,
  Menu,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import adminService from "../../services/admin.service";
import { COLORS, WARNING_TYPES } from "../../utils/constants";

const WARNING_TYPE_LABELS = {
  overdue: "Overdue Book Return",
  nuisance: "Nuisance Behavior",
  harassment: "Harassment",
  hate_speech: "Hate Speech",
  other: "Other Violation",
};

const WARNING_TYPE_COLORS = {
  overdue: "#ff9800",
  nuisance: "#2196f3",
  harassment: "#f44336",
  hate_speech: "#f44336",
  other: "#757575",
};

function WarningsScreen({ navigation }) {
  const [warnings, setWarnings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    type: "",
    description: "",
  });
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [userMenuVisible, setUserMenuVisible] = useState(false);

  useEffect(() => {
    fetchWarnings();
    fetchUsers();
  }, [typeFilter]);

  const fetchWarnings = async (loadMore = false) => {
    try {
      if (!loadMore) setLoading(true);
      const currentPage = loadMore ? page + 1 : 1;

      const data = await adminService.getWarnings({
        page: currentPage,
        limit: 20,
        type: typeFilter || undefined,
      });

      if (loadMore) {
        setWarnings((prev) => [...prev, ...(data.warnings || [])]);
      } else {
        setWarnings(data.warnings || []);
      }

      setPage(currentPage);
      setHasMore(currentPage < (data.pagination?.totalPages || 1));
    } catch (err) {
      console.error("Fetch warnings error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers({ limit: 100 });
      setUsers(data.users || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchWarnings();
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchWarnings(true);
    }
  };

  const handleSendWarning = async () => {
    if (!formData.user_id || !formData.type || !formData.description) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      const response = await adminService.sendWarning(formData);
      Alert.alert("Success", "Warning sent successfully");

      if (response.userSuspended) {
        Alert.alert("Notice", "User has been auto-suspended after 3 warnings");
      }

      setDialogOpen(false);
      setFormData({ user_id: "", type: "", description: "" });
      setSelectedUserEmail("");
      fetchWarnings();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Failed to send warning");
    }
  };

  const selectUser = (user) => {
    setFormData((prev) => ({ ...prev, user_id: user.id }));
    setSelectedUserEmail(user.email);
    setUserMenuVisible(false);
  };

  const renderWarning = ({ item }) => (
    <Card style={styles.warningCard}>
      <Card.Content>
        <View style={styles.warningRow}>
          <Avatar.Icon
            size={48}
            icon="alert"
            style={{
              backgroundColor: WARNING_TYPE_COLORS[item.type] || "#ff9800",
            }}
          />
          <View style={styles.warningInfo}>
            <Text style={styles.warningUser} numberOfLines={1}>
              {item.user?.email || "Unknown User"}
            </Text>
            <Chip
              compact
              style={[
                styles.typeChip,
                { backgroundColor: WARNING_TYPE_COLORS[item.type] || "#ff9800" },
              ]}
              textStyle={{ color: "#fff", fontSize: 10 }}
            >
              {WARNING_TYPE_LABELS[item.type] || item.type}
            </Chip>
            <Text style={styles.warningDesc} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.warningDate}>
              {new Date(item.created_at).toLocaleDateString()} • By{" "}
              {item.admin?.email || "System"}
            </Text>
          </View>
          <Chip
            compact
            mode="flat"
            style={item.is_read ? styles.readChip : styles.unreadChip}
          >
            {item.is_read ? "Read" : "Unread"}
          </Chip>
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
        <Text style={styles.headerTitle}>Warnings</Text>
        <Text style={styles.headerSubtitle}>Manage user warnings</Text>
      </LinearGradient>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setFilterMenuVisible(true)}
              icon="filter"
            >
              {typeFilter ? WARNING_TYPE_LABELS[typeFilter] : "All Types"}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setTypeFilter("");
              setFilterMenuVisible(false);
            }}
            title="All Types"
          />
          {Object.entries(WARNING_TYPE_LABELS).map(([key, label]) => (
            <Menu.Item
              key={key}
              onPress={() => {
                setTypeFilter(key);
                setFilterMenuVisible(false);
              }}
              title={label}
            />
          ))}
        </Menu>
      </View>

      {/* Warnings List */}
      {loading && warnings.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={warnings}
          renderItem={renderWarning}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No warnings found</Text>
          }
          ListFooterComponent={
            loading && warnings.length > 0 ? (
              <ActivityIndicator style={{ padding: 20 }} />
            ) : null
          }
        />
      )}

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogOpen(true)}
        color="#fff"
      />

      {/* Send Warning Dialog */}
      <Portal>
        <Dialog
          visible={dialogOpen}
          onDismiss={() => setDialogOpen(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Send Warning</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {/* User Selection */}
              <Text style={styles.fieldLabel}>Select User *</Text>
              <Menu
                visible={userMenuVisible}
                onDismiss={() => setUserMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setUserMenuVisible(true)}
                    style={styles.userSelector}
                  >
                    {selectedUserEmail || "Choose a user"}
                  </Button>
                }
                style={styles.userMenu}
              >
                <ScrollView style={{ maxHeight: 200 }}>
                  {users.map((user) => (
                    <Menu.Item
                      key={user.id}
                      onPress={() => selectUser(user)}
                      title={`${user.email} (${user.role})`}
                      description={`Warnings: ${user.warning_count || 0}`}
                    />
                  ))}
                </ScrollView>
              </Menu>

              {/* Warning Type */}
              <Text style={styles.fieldLabel}>Warning Type *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <Picker.Item label="Select type..." value="" />
                  {Object.entries(WARNING_TYPE_LABELS).map(([key, label]) => (
                    <Picker.Item key={key} label={label} value={key} />
                  ))}
                </Picker>
              </View>

              {/* Description */}
              <Text style={styles.fieldLabel}>Description *</Text>
              <TextInput
                mode="outlined"
                placeholder="Describe the violation..."
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                multiline
                numberOfLines={4}
                style={styles.descriptionInput}
              />

              {/* Warning Alert */}
              {selectedUserEmail && (
                <View style={styles.alertBox}>
                  {users.find((u) => u.id === formData.user_id)?.warning_count >= 2 && (
                    <Text style={styles.alertText}>
                      ⚠️ This user already has {users.find((u) => u.id === formData.user_id)?.warning_count} warning(s).
                      Sending this warning will result in automatic suspension.
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleSendWarning}
              buttonColor="#ff9800"
            >
              Send Warning
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
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  filterContainer: {
    padding: 16,
    paddingBottom: 8,
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
  warningCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  warningInfo: {
    flex: 1,
    marginLeft: 12,
  },
  warningUser: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  typeChip: {
    alignSelf: "flex-start",
    height: 22,
    marginBottom: 8,
  },
  warningDesc: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  warningDate: {
    fontSize: 11,
    color: "#999",
  },
  readChip: {
    height: 24,
    backgroundColor: "#e0e0e0",
  },
  unreadChip: {
    height: 24,
    backgroundColor: "#fff3e0",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    padding: 40,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#ff9800",
  },
  dialog: {
    maxHeight: "85%",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  userSelector: {
    width: "100%",
  },
  userMenu: {
    width: "100%",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  descriptionInput: {
    backgroundColor: "#fff",
  },
  alertBox: {
    backgroundColor: "#fff3e0",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  alertText: {
    color: "#e65100",
    fontSize: 13,
  },
});

export default WarningsScreen;

