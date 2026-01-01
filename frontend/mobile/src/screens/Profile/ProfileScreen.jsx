import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  Avatar,
  TextInput,
  Button,
  Divider,
  Dialog,
  Portal,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFormik } from "formik";
import * as Yup from "yup";
import useAuthStore from "../../store/authStore";
import { COLORS } from "../../utils/constants";

function ProfileScreen({ navigation }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const getInitials = (text) => {
    if (!text) return "U";
    return text
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await updateProfile(values);
        setIsEditing(false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleLogout = async () => {
    await logout();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header with Gradient */}
        <LinearGradient
          colors={[COLORS.gradient1, COLORS.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Avatar.Text
            size={100}
            label={getInitials(user?.name || user?.email)}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <Text style={styles.userName}>{user?.name || user?.email}</Text>
          <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
          <Text style={styles.userId}>
            {user?.student_id || user?.employee_id || user?.email}
          </Text>
        </LinearGradient>

        {/* Profile Information */}
        <View style={styles.contentContainer}>
          <Card style={styles.card}>
            <Card.Title
              title="Personal Information"
              titleStyle={styles.cardTitle}
              right={(props) =>
                !isEditing && (
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={styles.editButton}
                  >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={24}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                )
              }
            />
            <Card.Content>
              {isEditing ? (
                <View>
                  <TextInput
                    mode="outlined"
                    label="Full Name"
                    value={formik.values.name}
                    onChangeText={formik.handleChange("name")}
                    onBlur={formik.handleBlur("name")}
                    error={formik.touched.name && formik.errors.name}
                    style={styles.input}
                    left={<TextInput.Icon icon="account" />}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <Text style={styles.errorText}>{formik.errors.name}</Text>
                  )}

                  <TextInput
                    mode="outlined"
                    label="Email"
                    value={formik.values.email}
                    onChangeText={formik.handleChange("email")}
                    onBlur={formik.handleBlur("email")}
                    error={formik.touched.email && formik.errors.email}
                    style={styles.input}
                    left={<TextInput.Icon icon="email" />}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <Text style={styles.errorText}>{formik.errors.email}</Text>
                  )}

                  <TextInput
                    mode="outlined"
                    label="Phone"
                    value={formik.values.phone}
                    onChangeText={formik.handleChange("phone")}
                    onBlur={formik.handleBlur("phone")}
                    error={formik.touched.phone && formik.errors.phone}
                    keyboardType="phone-pad"
                    style={styles.input}
                    left={<TextInput.Icon icon="phone" />}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <Text style={styles.errorText}>{formik.errors.phone}</Text>
                  )}

                  <View style={styles.buttonRow}>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setIsEditing(false);
                        formik.resetForm();
                      }}
                      style={[styles.button, { flex: 1 }]}
                    >
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={formik.handleSubmit}
                      loading={loading}
                      style={[styles.button, { flex: 1 }]}
                      buttonColor={COLORS.primary}
                    >
                      Save
                    </Button>
                  </View>
                </View>
              ) : (
                <View>
                  <InfoRow
                    label="Name"
                    value={user?.name || "N/A"}
                    icon="account"
                  />
                  <InfoRow label="Email" value={user?.email} icon="email" />
                  <InfoRow
                    label="Phone"
                    value={user?.phone || "N/A"}
                    icon="phone"
                  />
                  <InfoRow
                    label="Role"
                    value={user?.role?.toUpperCase()}
                    icon="shield-account"
                  />
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Actions */}
          <Card style={styles.card}>
            <Card.Content>
              <TouchableOpacity style={styles.actionRow}>
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.actionText}>Change Password</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
              <Divider style={styles.divider} />
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => setLogoutDialogVisible(true)}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={24}
                  color={COLORS.error}
                />
                <Text style={[styles.actionText, { color: COLORS.error }]}>
                  Logout
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={logoutDialogVisible}
          onDismiss={() => setLogoutDialogVisible(false)}
        >
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLogout} textColor={COLORS.error}>
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerGradient: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: "#fff",
  },
  avatarLabel: {
    color: COLORS.primary,
    fontSize: 36,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    color: "#fff",
  },
  userRole: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  userId: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  editButton: {
    marginRight: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  button: {
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    marginVertical: 8,
  },
});

export default ProfileScreen;
