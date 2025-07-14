import axios from 'axios';

console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);

const apiClient = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    const nonRefreshablePaths = [
      '/login/',
      '/token/refresh/',
      '/register/',
    ];

    const isNonRefreshable = nonRefreshablePaths.some(path =>
      originalRequest.url.includes(path)
    );

    // Try refresh if 401 error
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isNonRefreshable
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/token/refresh/`,
          null,
          { withCredentials: true }
        );

        if (refreshResponse.status === 200) {
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);

        // Dispatch a logout event to your AuthContext
        window.dispatchEvent(new Event("force-logout"));

        return Promise.reject(refreshError);
      }
    }

    // If cannot retry, just reject
    return Promise.reject(error);
  }
);

export default apiClient;
