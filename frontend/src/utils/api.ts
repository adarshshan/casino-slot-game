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

    let token = localStorage.getItem("accessToken")
    if (localStorage.getItem("userRole") === 'admin') {
      token = localStorage.getItem("adminToken")
    }

    const originalRequest = err.config;

    if (err.response) {
      const { status } = err.response;

      if (status === 401 && !originalRequest._retry) {
        // Prevent infinite retry loop
        originalRequest._retry = true;

        if (isRefreshing) {
          // Wait for token refresh to complete
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({ resolve, reject });
          })
            .then(() => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          await renewToken();

          // Retry failed requests in the queue
          failedRequestsQueue.forEach((req) => {
            const newToken = originalRequest.url?.includes('/admin') ? localStorage.getItem("adminToken") : localStorage.getItem("accessToken");
            req.resolve(newToken);
          });
          failedRequestsQueue = [];

          // Update the original request with the new token
          const newToken = originalRequest.url?.includes('/admin') ? localStorage.getItem("adminToken") : localStorage.getItem("accessToken");
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          failedRequestsQueue.forEach((req) => req.reject(refreshError));
          failedRequestsQueue = [];

          // Handle token refresh failure (e.g., log out user)
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("adminToken"); // Clear admin token as well

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Other error handling
      if (status === 500) {
        console.log("Internal server error!")
      } else if (status === 403) {
        window.location.href = "/login";
        console.log("Forbidden access")
      } else if (err.response?.data?.message) {
        console.log(err.response?.data?.message)
      }
    }

    return Promise.reject(err);
  },
);

export default api;

const renewToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const { data } = await axios.post(
      `${import.meta.env.VITE_BASEURL}/api/refresh`
      , { token: refreshToken }
    );

    if (data && data.success === true) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    } else {
      throw new Error("Failed to refresh token");
    }
  } catch (error) {
    console.log("Token refresh failed", error);
    throw error;
  }
};