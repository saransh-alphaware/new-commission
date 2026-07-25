import cbsClient from "./interceptor";

const errorResponse = (error) => {
  return {
    value: false,
    status: error?.response?.status,
    message: error?.response?.data
      ? error?.response?.data?.errorMessage || error?.response?.data?.message
      : error?.message,
  };
};

export const getServerData = async (endpoint, params, config) => {
  try {
    const response = await cbsClient.get(endpoint, { params, ...config });
    let res_data = response.data;
    return { value: true, status: response?.status, data: res_data };
  } catch (error) {
    if (error.code === "ERR_CANCELED") {
      return { cancelled: true };
    }
    return errorResponse(error);
  }
};

export const postServerData = async (endpoint, payload, params, config) => {
  try {
    const response = await cbsClient.post(endpoint, payload, { params, ...config });
    let res_data = response.data;
    return { value: true, status: response?.status, data: res_data };
  } catch (error) {
    if (error.code === "ERR_CANCELED") {
      return { cancelled: true };
    }
    return errorResponse(error);
  }
};

export const putServerData = async (endpoint, payload, params, id, config) => {
  let requestURL = endpoint;
  if (id) {
    requestURL += `/${id}`;
  }
  try {
    const response = await cbsClient.put(requestURL, payload, { params, ...config });
    let res_data = response.data;
    return { value: true, status: response?.status, data: res_data };
  } catch (error) {
    return errorResponse(error);
  }
};

export const deleteServerData = async (endpoint, params, id, config) => {
  let requestURL = endpoint;
  if (id) {
    requestURL += `/${id}`;
  }
  try {
    const response = await cbsClient.delete(requestURL, { params, ...config });
    let res_data = response.data;
    return { value: true, status: response?.status, data: res_data };
  } catch (error) {
    return errorResponse(error);
  }
};

export const patchServerData = async (endpoint, payload, params, id, config) => {
  let requestURL = endpoint;
  if (id) {
    requestURL += `/${id}`;
  }
  try {
    const response = await cbsClient.patch(requestURL, payload, { params, ...config });
    let res_data = response.data;
    return { value: true, status: response?.status, data: res_data };
  } catch (error) {
    return errorResponse(error);
  }
};
