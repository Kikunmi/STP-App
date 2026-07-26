import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/services';
import { getStoredToken, setAuthToken } from '../api/client';
import { queryKeys } from '../lib/queryKeys';

const AuthContext = createContext(null);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState(() => getStoredToken());

  const applyToken = (newToken) => {
    setAuthToken(newToken);
    setTokenState(newToken);
  };

  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: authService.getProfile,
    enabled: !!token,
    retry: false,
  });

  const handleAuthSuccess = ({ token: newToken, user: newUser }) => {
    if (newToken) applyToken(newToken);
    if (newUser) {
      queryClient.setQueryData(queryKeys.auth.profile, newUser);
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    }
  };

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: handleAuthSuccess,
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: handleAuthSuccess,
  });

  const logout = () => {
    applyToken(null);
    queryClient.clear();
  };

  const value = {
    user: user || null,
    token,
    isAuthenticated: !!token,
    loading: isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loginState: loginMutation,
    registerState: registerMutation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;