// Auth context and hooks
export { AuthProvider } from './AuthContext';
export { useAuth } from './useAuth';

// Auth guards and route protection
export { AuthGuard, ProtectedRoute, PublicRoute } from './AuthGuard';

// Auth components
export { SignInForm, SignUpForm, ResetPasswordForm } from './components';

// Auth types
export type {
  AuthUser,
  AuthState,
  AuthContextType,
  SignInFormData,
  SignUpFormData,
  ResetPasswordFormData,
  UpdatePasswordFormData,
  AuthError,
} from '../../types/auth';

// Auth store
export {
  useAuthStore,
  useAuthUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
} from '../../store/authStore';

// Auth service
export { AuthService } from '../../lib/auth';
