import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/constants';

// Session expiry time (7 days in milliseconds)
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000;

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      userType: null, // 'user' or 'admin'
      sessionExpiry: null,

      login: (userData, token, userType) => {
        const expiry = Date.now() + SESSION_EXPIRY;
        
        // Store in localStorage with expiry
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiry.toString());
        
        set({
          user: userData,
          token,
          isAuthenticated: true,
          userType,
          sessionExpiry: expiry,
        });
      },

      logout: () => {
        // Clear all auth data from localStorage
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
        localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          userType: null,
          sessionExpiry: null,
        });
      },

      updateProfile: (updates) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        set({ user: updatedUser });
      },

      // Check if session is valid and not expired
      checkAuth: () => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const userString = localStorage.getItem(STORAGE_KEYS.USER);
        const expiryString = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);
        
        if (token && userString) {
          try {
            // Check session expiry
            if (expiryString) {
              const expiry = parseInt(expiryString, 10);
              if (Date.now() > expiry) {
                // Session expired, logout
                get().logout();
                return false;
              }
            }
            
            const user = JSON.parse(userString);
            set({
              user,
              token,
              isAuthenticated: true,
              userType: user.role === 'admin' || user.role === 'librarian' ? 'admin' : 'user',
              sessionExpiry: expiryString ? parseInt(expiryString, 10) : null,
            });
            return true;
          } catch (error) {
            get().logout();
            return false;
          }
        }
        return false;
      },

      // Extend session (call on user activity)
      extendSession: () => {
        const newExpiry = Date.now() + SESSION_EXPIRY;
        localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, newExpiry.toString());
        set({ sessionExpiry: newExpiry });
      },

      // Check if user is admin or librarian
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin' || user?.role === 'librarian';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        userType: state.userType,
        sessionExpiry: state.sessionExpiry,
      }),
    }
  )
);

export default useAuthStore;
