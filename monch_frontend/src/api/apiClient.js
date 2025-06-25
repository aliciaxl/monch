import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // your API base URL
  withCredentials: true,                 // send cookies with requests
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          'http://127.0.0.1:8000/api/token/refresh/',
          {},
          { withCredentials: true }
        );

        if (refreshResponse.status === 200) {
          // Retry original request after successful token refresh
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed: redirect to login or handle logout here
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
