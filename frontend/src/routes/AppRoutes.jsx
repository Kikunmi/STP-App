import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { Loading } from '../components/ui';
import ProtectedRoute from './ProtectedRoute';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Trips = lazy(() => import('../pages/Trips'));
const TripDetails = lazy(() => import('../pages/TripDetails'));
const TripForm = lazy(() => import('../pages/TripForm'));
const Itinerary = lazy(() => import('../pages/Itinerary'));
const Expenses = lazy(() => import('../pages/Expenses'));
const Favorites = lazy(() => import('../pages/Favorites'));
const Recommendations = lazy(() => import('../pages/Recommendations'));
const ShareTrip = lazy(() => import('../pages/ShareTrip'));
const SharedView = lazy(() => import('../pages/SharedView'));
const NotFound = lazy(() => import('../pages/NotFound'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading message="Loading page..." />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/share/:shareId" element={<SharedView />} />

        {/* Protected routes wrapped by the app shell */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/new" element={<TripForm />} />
          <Route path="/trips/:tripId" element={<TripDetails />} />
          <Route path="/trips/:tripId/edit" element={<TripForm />} />
          <Route path="/trips/:tripId/itinerary" element={<Itinerary />} />
          <Route path="/trips/:tripId/expenses" element={<Expenses />} />
          <Route path="/trips/:tripId/share" element={<ShareTrip />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
