import React from "react";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/SignUp";
import ResetPassword from "./pages/auth/ResetPassword";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import AddSpot from "./pages/AddSpot"; // Importing AddSpot page
import Profile from "./pages/Profile";
import AddProfile from "./pages/AddProfile";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/NotFound" element={<NotFound />} />
          {/* Protected Routes */}
          <Route
            path="/AddSpot"
            element={
              <ProtectedRoute>
                <AddSpot />
              </ProtectedRoute>
            }
          />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/AddProfile" element={<AddProfile/>} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
