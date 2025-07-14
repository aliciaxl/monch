import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
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
          'http://127.0.0.1:8000/api/token/refresh/',
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
