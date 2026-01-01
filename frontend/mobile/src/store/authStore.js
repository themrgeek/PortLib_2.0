import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../utils/constants";

// Generate garbage value for secure overwrite
const generateGarbageValue = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  userType: null, // 'user' or 'admin'
  loading: true,

  login: async (userData, token, userType) => {
    // Store JWT token securely
    await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
    // Store user data (non-sensitive, can use SecureStore for consistency)
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(userData));
    set({
      user: userData,
      token,
      isAuthenticated: true,
      userType,
    });
  },

  logout: async () => {
    try {
      // Overwrite with garbage values before deletion for security
      const garbageToken = generateGarbageValue();
      const garbageUser = generateGarbageValue();
      
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, garbageToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, garbageUser);
      
      // Now delete the items
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REMEMBER_ME);
    } catch (error) {
      console.error("Logout cleanup error:", error);
    }
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      userType: null,
    });
  },

  updateProfile: async (updates) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser, ...updates };
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      const userString = await SecureStore.getItemAsync(STORAGE_KEYS.USER);

      if (token && userString) {
        const user = JSON.parse(userString);
        set({
          user,
          token,
          isAuthenticated: true,
          userType:
            user.role === "admin" || user.role === "librarian"
              ? "admin"
              : "user",
          loading: false,
        });
        return true;
      }
      set({ loading: false });
      return false;
    } catch (error) {
      set({ loading: false });
      return false;
    }
  },
}));

export default useAuthStore;
