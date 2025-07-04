import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import Login from "./pages/Login.jsx";
import Layout from "./layouts/Layout.jsx";
import Home from "./pages/Home.jsx";
import UserProfile from "./components/UserProfile.jsx";
import PostDetail from "./components/PostDetail.jsx";
import SearchPage from "./components/SearchPage.jsx";

function PrivateRoute({ element }) {
  const { user, loading } = useAuth();

  if (loading) return null; // or loading spinner

  return user ? element : <Navigate to="/login" />;
}

function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#171717",
            color: "#fff",
            borderRadius: "16px",
            padding: "16px 8px 16px 16px",
            fontSize: '0.875rem',
          },
          success: {
            icon: <FontAwesomeIcon icon={faCheck} className="text-white" style={{ marginRight: 4 }} />,
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute element={<Layout />} />}>
          <Route path="/home/:tab?" element={<Home />} />
          <Route path="/home/search" element={<SearchPage />} />
          <Route path="user/:username" element={<UserProfile />} />
          <Route path="/post/:postId" element={<PostDetail />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? "/home" : "/login"} />} />
      </Routes>
    </>
  );
}

export default App;
