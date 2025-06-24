import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import Login from "./pages/Login.jsx";
import Layout from "./layouts/Layout.jsx";
import Home from "./pages/Home.jsx";
import UserProfile from "./components/UserProfile.jsx";


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/whoami/', {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.username); // set user from backend
        }
      } catch (error) {
        console.error("Not authenticated");
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
        {user && (
          <Route path="/" element={<Layout />}>
            <Route path="home" element={<Home />} />
            <Route path="user/:username" element={<UserProfile />} />
          </Route>
        )}

        <Route path="/user/:username" element={<UserProfile />} />

        {/* Redirect any other paths */}
        <Route
          path="*"
          element={<Navigate to={user ? "/home" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
