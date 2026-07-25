import axios from "axios";
import { encryptId, decryptId } from "../utils/cryptoHelper";

const cbsClient = axios.create({
  baseURL: `${import.meta.env.VITE_APP_SERVER_API}/api`,
});

// This URL is where your refresh token API lives
const REFRESH_URL = `${
  import.meta.env.VITE_APP_SERVER_API
}/api/agents/refresh-token`;

cbsClient.interceptors.request.use(
  async (request) => {
    const token = sessionStorage?.getItem('token');
    request.headers["Content-Type"] = "application/json";
    if (token && !request.skipToken) {
      request.headers["Authorization"] = `Bearer ${decryptId(token)}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

cbsClient.interceptors.response.use(
  (response) => response, // return only data
  async (error) => {
    if (error?.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }
    const originalRequest = error.config || {};
    
    if (originalRequest?.signal?.aborted) {
      return Promise.reject(error);
    }
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const encryptedRefreshToken = sessionStorage?.getItem('refreshToken');
        if (!encryptedRefreshToken) throw new Error("No refresh token found.");

        const refreshToken = decryptId(encryptedRefreshToken);

        const tokenResponse = await axios.post(
          REFRESH_URL,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const accessToken = tokenResponse?.data?.data?.accessToken;
        if (!accessToken)
          throw new Error("No access token in refresh response");
        sessionStorage.setItem("token", encryptId(accessToken));
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        };
        return cbsClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
        return Promise.reject(refreshError);
      }
    }

    // Handle server errors
    if ([500, 501, 502].includes(error?.response?.status)) {
      localStorage.clear();
      sessionStorage.clear();
    }

    return Promise.reject(error);
  }
);

export default cbsClient;
