import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../utils/constants";
import useAuthStore from "../../store/authStore";

function SplashScreen({ navigation }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Animate logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Check auth and navigate
    const initApp = async () => {
      await checkAuth();
      setTimeout(() => {
        if (isAuthenticated) {
          navigation.replace("Dashboard");
        } else {
          navigation.replace("Login");
        }
      }, 2000);
    };

    initApp();
  }, []);

  return (
    <LinearGradient
      colors={[COLORS.gradient1, COLORS.gradient2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons
            name="book-open-page-variant"
            size={64}
            color="#fff"
          />
        </View>
        <Text style={styles.title}>PortLib</Text>
        <Text style={styles.subtitle}>Smart Library Management System</Text>
      </Animated.View>

      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 100,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
  },
  footer: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#fff",
  },
});

export default SplashScreen;
