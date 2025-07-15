import axios from "axios";

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});

const isAuthPage = () => {
  const path = window.location.pathname;
  return path === "/login" || path === "/register";
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const nonRefreshablePaths = ["/login/", "/token/refresh/", "/register/"];

    const isNonRefreshable = nonRefreshablePaths.some((path) =>
      originalRequest.url.includes(path)
    );

    // Try refresh if 401 error
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isNonRefreshable &&
      !isAuthPage()
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/token/refresh/`,
          null,
          { withCredentials: true }
        );

        if (refreshResponse.status === 200) {
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);

        const hadSession = document.cookie.includes('access_token');

        if (hadSession) {
          window.dispatchEvent(new Event("force-logout"));
        }

        return Promise.reject(refreshError);
      }
    }

    // If cannot retry, just reject
    return Promise.reject(error);
  }
);

export default apiClient;
