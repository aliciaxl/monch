import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  withCredentials: true,
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Do NOT try to refresh token for these endpoints
    const nonRefreshablePaths = [
      '/login/',
      '/token/refresh/',
      '/register/',
      // add other endpoints you don't want to retry
    ];

    const isNonRefreshable = nonRefreshablePaths.some(path =>
      originalRequest.url.includes(path)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isNonRefreshable) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          'http://127.0.0.1:8000/api/token/refresh/',
          {},
          { withCredentials: true }
        );

        if (refreshResponse.status === 200) {
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        return Promise.reject(refreshError);
      }
    }
  }
);

export default apiClient;
