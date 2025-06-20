import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";


function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/me/', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then(data => setUser(data.username))
      .catch(() => setUser(null))
      .finally(() => setCheckingAuth(false));
  }, []);

  if (checkingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* public route: login */}
        <Route
          path="/login"
          element={<Login user={user} setUser={setUser} />
          }
        />

        {/* Protected route: home */}
        <Route
          path="/home"
          element={
            user ? <Home /> : <Navigate to="/login" />
          }
        />

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
