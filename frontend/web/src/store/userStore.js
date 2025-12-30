import { create } from 'zustand';

const useUserStore = create((set) => ({
  profile: null,
  loading: false,
  error: null,

  setProfile: (profile) => set({ profile }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  updateProfileField: (field, value) => set((state) => ({
    profile: { ...state.profile, [field]: value },
  })),
  
  clearProfile: () => set({ profile: null, error: null }),
}));

export default useUserStore;

