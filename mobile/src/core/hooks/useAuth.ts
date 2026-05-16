import { useAuthStore } from '../../features/auth/store';

export function useAuth() {
  const { user, token, loading, login, register, logout } = useAuthStore();
  return { user, token, loading, isAuthenticated: !!token, login, register, logout };
}
