// src/api/index.js
import queryString from "query-string";

import rootApi from "./api-config.js";

const api = {
	get: (path, searchParams) => rootApi.get(path, { searchParams: queryString.stringify(searchParams) }).json(),
	post: (path, json) => rootApi.post(path, { json }).json(),
	put: (path, json) => rootApi.put(path, { json }).json(),
	patch: (path, json) => rootApi.patch(path, { json }).json(),
	delete: (path, json) => rootApi.delete(path, { json }).json(),
};

export default api;

export const authenticate = (username, password) => api.post("authenticate", { username, password });
export const authenticateGoogle = (token) => api.post("authenticateGoogle", { token });
export const forgotPassword = (username) => api.post("forgotPassword", { username });
export const mycall = (organization, project, collection, accessKey) => api.post("mycall", { organization, project, collection, accessKey });
export const resetPassword = (password, token) => api.post("resetPassword", { password, token });
export const signUp = (username, email, password) => api.post("createUser", { username, email, password });
export const invitedSignUp = (username, email, password, token) => api.post("createUserInvited", { username, email, password, token });
export const uploadFile = (body) => rootApi.post("file/", { body }).json();
export const reUploadFile = (body) => rootApi.put("file/", { body }).json();
export const deleteFile = (info) => api.post("file/delete/", info);
export const inviteUser = (email) => api.post("user", { email });
export const removeUser = (id) => api.post("user/delete", { id });
export const getUsersData = () => api.get("user");

// EcoReadyServices
export const getCollectionData = (organization, project, collection, params) => api.get("eco-ready-services/getdata", { organization, project, collection, params });
export const getCollectionDataStatistics = (organization, project, collection, params) => api.get("eco-ready-services/getdatastatistics", { organization, project, collection, params });
