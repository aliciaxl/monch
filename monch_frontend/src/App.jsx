import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import apiClient from "./api/apiClient.js"
import Login from "./pages/Login.jsx";
import Layout from "./layouts/Layout.jsx";
import Home from "./pages/Home.jsx";
import UserProfile from "./components/UserProfile.jsx";


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const checkAuth = async () => {
    // Don't bother calling /whoami if no cookies set
    const hasTokens =
      document.cookie.includes("access_token") ||
      document.cookie.includes("refresh_token");

    if (!hasTokens) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get('/whoami/');
      setUser(res.data.username);
    } catch (error) {
      console.error("Not authenticated", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* public route: login */}
        <Route
          path="/login"
          element={<Login user={user} setUser={setUser} />
          }
        />

        {/* Protected layout with sidebar */}
        {user ? (
          <Route path="/" element={<Layout />}>
            <Route path="home" element={<Home />} />
            <Route path="user/:username" element={<UserProfile />} />
          </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}

        {/* Redirect any other paths */}
        <Route
          path="*"
          element={
            user
              ? <Navigate to="/home" />
              : window.location.pathname === "/login"
                ? null
                : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
