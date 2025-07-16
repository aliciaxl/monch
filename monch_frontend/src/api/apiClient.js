import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// --- Token utilities ---

export function loadTokens() {
  // Could preload tokens if needed, here no-op since localStorage is accessible anywhere
  return {
    access: localStorage.getItem(ACCESS_TOKEN_KEY),
    refresh: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// --- Axios interceptors ---

// Attach latest access token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const nonRefreshablePaths = ["/login", "/register", "/token/refresh"];

function isNonRefreshable(url) {
  return nonRefreshablePaths.some((path) => url.includes(path));
}

// Handle 401 and refresh token automatically
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) return Promise.reject(error);

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isNonRefreshable(originalRequest.url)
    ) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        window.dispatchEvent(new Event("force-logout"));
        return Promise.reject(error);
      }

      try {
        const response = await apiClient.post("/token/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh || refreshToken;

        setTokens({ access: newAccessToken, refresh: newRefreshToken });

        // Update original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.dispatchEvent(new Event("force-logout"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;


// import axios from "axios";

// const apiClient = axios.create({
//   baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
//   withCredentials: true,
// });

// const isAuthPage = () => {
//   const path = window.location.pathname;
//   return path === "/login" || path === "/register";
// };

// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config; 

//     const nonRefreshablePaths = ["/login/", "/token/refresh/", "/register/"];

//     const isNonRefreshable = nonRefreshablePaths.some((path) =>
//       originalRequest.url.includes(path)
//     );

//     // Try refresh if 401 error
//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !isNonRefreshable &&
//       !isAuthPage()
//     ) {
//       originalRequest._retry = true;

//       try {
//         const refreshResponse = await axios.post(
//           `${import.meta.env.VITE_BACKEND_URL}/api/token/refresh/`,
//           null,
//           { withCredentials: true }
//         );

//         if (refreshResponse.status === 200) {
//           return apiClient(originalRequest);
//         }
//       } catch (refreshError) {
//         console.error("Token refresh failed", refreshError);

//         const hadSession = document.cookie.includes('access_token');

//         if (hadSession) {
//           window.dispatchEvent(new Event("force-logout"));
//         }

//         return Promise.reject(refreshError);
//       }
//     }

//     // If cannot retry, just reject
//     return Promise.reject(error);
//   }
// );

// export default apiClient;
