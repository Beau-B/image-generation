import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Generate from './pages/Generate';
import Edit from './pages/Edit';
import Gallery from './pages/Gallery';
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import Solutions from './pages/Solutions';
import LoadingScreen from './components/common/LoadingScreen';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return !user ? <>{children}</> : <Navigate to="/gallery" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<Home />} />
          <Route path="solutions" element={<Solutions />} />
          <Route path="pricing" element={<Pricing />} />
          <Route
            path="login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="generate"
            element={
              <PrivateRoute>
                <Generate />
              </PrivateRoute>
            }
          />
          <Route
            path="edit"
            element={
              <PrivateRoute>
                <Edit />
              </PrivateRoute>
            }
          />
          <Route
            path="gallery"
            element={
              <PrivateRoute>
                <Gallery />
              </PrivateRoute>
            }
          />
          <Route
            path="account"
            element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            }
          />

          {/* Redirect /dashboard to /gallery */}
          <Route path="dashboard" element={<Navigate to="/gallery" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;