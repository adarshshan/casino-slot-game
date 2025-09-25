import axios from "axios";

// Track token refresh status and request queue
let isRefreshing = false;
let failedRequestsQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const api = axios.create({});

api.interceptors.request.use((request) => {
  let token = null;
  if (request.url?.includes('/admin')) {
    token = localStorage.getItem("adminToken");
  } else {
    token = localStorage.getItem("accessToken");
  }

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

api.interceptors.response.use(
  (response) => response,
  async (err) => {
    const originalRequest = err.config;
    console.log("Axios interceptor error:", err);
    console.log("Error response:", err.response);

    if (err.response) {
      const { status } = err.response;
      console.log("Error status:", status);

      if (status === 401 && !originalRequest._retry) {
        console.log('hello its here.....');
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const { newAccessToken } = await renewToken(originalRequest);

          failedRequestsQueue.forEach((req) => {
            req.resolve(newAccessToken);
          });
          failedRequestsQueue = [];

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          failedRequestsQueue.forEach((req) => req.reject(refreshError));
          failedRequestsQueue = [];

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("adminToken");

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      if (status === 500) {
        console.log("Internal server error!");
      } else if (status === 403) {
        window.location.href = "/login";
        console.log("Forbidden access");
      } else if (err.response?.data?.message) {
        console.log(err.response?.data?.message);
      }
    }

    return Promise.reject(err);
  },
);

export default api;

const renewToken = async (originalRequest: any) => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const { data } = await axios.post(
      `${import.meta.env.VITE_BASEURL}/api/auth/refresh`,
      { token: refreshToken }
    );

    if (data && data.success === true) {
      const { accessToken, refreshToken: newRefreshToken } = data;

      if (originalRequest.url?.includes('/admin')) {
        localStorage.setItem("adminToken", accessToken);
      } else {
        localStorage.setItem("accessToken", accessToken);
      }
      localStorage.setItem("refreshToken", newRefreshToken);

      return { newAccessToken: accessToken };
    } else {
      throw new Error("Failed to refresh token");
    }
  } catch (error) {
    console.log("Token refresh failed", error);
    throw error;
  }
};