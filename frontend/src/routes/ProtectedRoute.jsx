import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/ui';

/**
 * Guards authenticated routes. Allows access while the profile is still
 * loading (as long as a token exists) to avoid redirect races after login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, token } = useAuth();
  const location = useLocation();

  if (loading && token) return <Loading message="Loading..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};
