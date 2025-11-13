import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Create context
const AuthContext = createContext();

// Custom hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // State
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedOrg = localStorage.getItem('organization');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const parsedOrg = storedOrg ? JSON.parse(storedOrg) : null;

          // Optional: validate token expiration (if using `iat`/`exp`)
          // Could decode JWT here with `jwt-decode` if needed

          setToken(storedToken);
          setUser(parsedUser);
          setOrganization(parsedOrg);
        }
      } catch (err) {
        console.warn('Failed to initialize auth from storage', err);
        // Still clear potentially corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('organization');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = useCallback((loginData) => {
    const { token: newToken, user: newUser, organization: newOrg } = loginData;

    try {
      // Persist to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      if (newOrg) {
        localStorage.setItem('organization', JSON.stringify(newOrg));
      }

      // Update state
      setToken(newToken);
      setUser(newUser);
      setOrganization(newOrg);
      setError(null);

      return { success: true };
    } catch (err) {
      console.error('Login persistence failed', err);
      setError('Failed to save login data');
      return { success: false, error: 'Persistence error' };
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');

    // Clear state
    setToken(null);
    setUser(null);
    setOrganization(null);
    setError(null);

    // Optional: revoke token on server (if backend supports it)
    // fetch('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });

    // Redirect
    navigate('/login', { replace: true });
  }, [navigate, token]);

  // Authorization helpers
  const isAuthenticated = !!user && !!token;
  const isAdmin = isAuthenticated && user.role === 'ADMIN';
  const isDeveloper = isAuthenticated && user.role === 'DEVELOPER';
  const isSigner = isAuthenticated && user.role === 'SIGNER';

  // Optional: token refresh (stub for future)
  const refreshToken = useCallback(async () => {
    // TODO: Implement silent refresh via /auth/refresh
    // If expired, trigger logout
    console.warn('refreshToken not implemented yet');
    return token;
  }, [token]);

  // Context value
  const value = {
    // State
    user,
    organization,
    token,
    isLoading,
    error,

    // Actions
    login,
    logout,
    refreshToken,

    // Derived
    isAuthenticated,
    isAdmin,
    isDeveloper,
    isSigner,

    // Roles
    roles: {
      ADMIN: 'ADMIN',
      DEVELOPER: 'DEVELOPER',
      SIGNER: 'SIGNER',
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};