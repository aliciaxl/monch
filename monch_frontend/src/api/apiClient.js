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

    // Only try refresh if it's a 401 and it's not a login/register route
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
          return apiClient(originalRequest); // Retry the original request
        }
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);

        // Optional toast for user feedback
        toast.error("Session expired. Please log in again.");

        // Dispatch a logout event to your AuthContext
        window.dispatchEvent(new Event("force-logout"));

        return Promise.reject(refreshError); // Let components handle the error
      }
    }

    // If it's not eligible for retry or fails, just reject
    return Promise.reject(error);
  }
);

export default apiClient;
