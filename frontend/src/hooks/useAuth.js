import { useAuthContext } from '../context/AuthContext';

/**
 * Convenience hook for accessing auth state and actions.
 * Wraps the AuthContext so components import from `hooks/` consistently.
 */
export const useAuth = useAuthContext;

export default useAuth;
