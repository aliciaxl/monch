import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import {
  loadTokens,
  clearTokens,
  getRefreshToken,
  setTokens,
} from "../api/apiClient";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasForcedLogout = useRef(false);

  // Handle forced logout event (e.g., refresh token expired)
  useEffect(() => {
    const handleForceLogout = () => {
      if (!hasForcedLogout.current && location.pathname !== "/login") {
        hasForcedLogout.current = true;
        toast.error("Session expired. Please log in again.");
      }
      clearTokens();
      setUser(null);
      setLoading(false);
      navigate("/login");
    };

    window.addEventListener("force-logout", handleForceLogout);
    return () => window.removeEventListener("force-logout", handleForceLogout);
  }, [location.pathname, navigate]);

  // Check if user is authenticated on route change
  useEffect(() => {
    loadTokens();

    const isPublicRoute = ["/", "/login", "/register"].includes(
      location.pathname
    );
    if (isPublicRoute) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await apiClient.get("/whoami/");
        setUser(res.data);
      } catch (error) {
        if (error.response?.status === 401) {
          try {
            await refreshAccessToken();
            const res = await apiClient.get("/whoami/");
            setUser(res.data);
          } catch (refreshError) {
            window.dispatchEvent(new Event("force-logout"));
          }
        } else {
          window.dispatchEvent(new Event("force-logout"));
        }
      } finally {
        setLoading(false); 
      }
    };

    checkAuth();
  }, [location.pathname]);

  const refreshAccessToken = async () => {
    try {
      const refresh = getRefreshToken();

      const refreshResponse = await apiClient.post("/token/refresh/", {
        refresh,
      });
      const newAccessToken = refreshResponse.data.access;
      const newRefreshToken = refreshResponse.data.refresh || refresh;

      // Save the new tokens
      setTokens({ access: newAccessToken, refresh: newRefreshToken });

      apiClient.defaults.headers["Authorization"] = `Bearer ${newAccessToken}`;
    } catch (error) {
      // If refresh token is invalid, force logout
      window.dispatchEvent(new Event("force-logout"));
    }
  };

  // Log in
  const login = async (username, password) => {
    setLoading(true);
    try {
      console.log("Attempting login for:", username);
      const res = await apiClient.post("/login/", { username, password }, { withCredentials: true });
      console.log("Login response:", res.data);

     
      setTokens({ access: res.data.access, refresh: res.data.refresh });
      console.log("Tokens set:", { access: res.data.access, refresh: res.data.refresh });

      // Fetch and set user info
      const userRes = await apiClient.get("/whoami/");
      console.log("User info fetched:", userRes.data);

      setUser(userRes.data);

      navigate("/"); // Redirect after login
    } catch (error) {
      clearTokens();
      setUser(null);
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  // Logout method: clear tokens, call logout endpoint if needed
  const logout = async () => {
    setLoading(true);
    try {
      const refresh = getRefreshToken();

      // Send refresh token in request body so backend can blacklist it
      await apiClient.post("/logout/", { refresh }, { withCredentials: true });

      clearTokens();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// // src/context/AuthContext.jsx
// import { createContext, useContext, useEffect, useState, useRef } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import apiClient from "../api/apiClient";
// import toast from "react-hot-toast";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const hasForcedLogout = useRef(false);

//   useEffect(() => {
//     const handleForceLogout = () => {
//       if (!hasForcedLogout.current && location.pathname !== "/login") {
//         hasForcedLogout.current = true;
//         toast.error("Session expired. Please log in again.");
//       }

//       setUser(null);
//       setLoading(false);
//       navigate("/login");
//     };

//     window.addEventListener("force-logout", handleForceLogout);

//     return () => {
//       window.removeEventListener("force-logout", handleForceLogout);
//     };
//   }, []);

// useEffect(() => {

//   const isPublicRoute = ["/", "/login", "/register"].includes(location.pathname);

//   if (isPublicRoute) {
//     setLoading(false);
//     return;
//   }

//   const checkAuth = async () => {
//     try {
//       const res = await apiClient.get("/whoami/", { withCredentials: true });
//       setUser(res.data);
//     } catch (error) {
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   checkAuth();
// }, [location.pathname]);

//   const login = async (username, password) => {
//     await apiClient.post(
//       "/login/",
//       { username, password },
//       { withCredentials: true }
//     );
//     const res = await apiClient.get("/whoami/", { withCredentials: true });
//     setUser(res.data);
//   };

//   const logout = async () => {
//     await apiClient.post("/logout/", {}, { withCredentials: true });
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
