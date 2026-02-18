import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext.jsx";
import PulseLoader from "../Animations/PulseLoader.jsx";

const PrivateRoute = ({ children, role }) => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log(
    "PrivateRoute - user:",
    user,
    "loading:",
    loading,
    "isAuthenticated:",
    isAuthenticated,
  ); // Debug log

  if (loading) {
    return <PulseLoader size="lg" color="primary" />;
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    console.log(
      `Role mismatch: expected ${role}, got ${user?.role}, redirecting to ${user?.role}/dashboard`,
    );
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  }

  return children;
};

export default PrivateRoute;
