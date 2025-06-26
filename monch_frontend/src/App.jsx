import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from "./pages/Login.jsx";
import Layout from "./layouts/Layout.jsx";
import Home from "./pages/Home.jsx";
import UserProfile from "./components/UserProfile.jsx";


function PrivateRoute({ element }) {
  const { user, loading } = useAuth();

  if (loading) return null; // or loading spinner

  return user ? element : <Navigate to="/login" />;
}

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={<PrivateRoute element={<Layout />} />}
        >
          <Route path="home" element={<Home />} />
          <Route path="user/:username" element={<UserProfile />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? "/home" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;