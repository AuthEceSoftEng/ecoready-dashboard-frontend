import ky from "ky";
import queryString from "query-string";

import { jwt } from "../utils/index.js";

const { REACT_APP_MAIN_SERVER_URL } = process.env;

const rootApi = ky.extend({
	timeout: false,
	prefixUrl: `${REACT_APP_MAIN_SERVER_URL}/api`,
	retry: {
		statusCodes: [401, 408, 413, 429, 502, 503, 504],
		limit: 2,
		methods: ["get", "post", "put", "head", "delete", "options", "trace"],
	},
	hooks: {
		beforeRequest: [({ headers }) => {
			headers.set("x-access-token", jwt.getToken());
		}],
		beforeRetry: [
			async ({ request: { method }, error }) => {
				if (error?.response?.status === 401) {
					const res = await rootApi.extend({ throwHttpErrors: false, retry: 0 }).get("api/refresh");
					if (res.status === 401) {
						jwt.destroyToken();
						window.location.href = "/";
					} else {
						const { token } = await res.json();
						jwt.setToken(token);
					}
				} else if (method === "POST") {
					throw error;
				}
			},
		],
		afterResponse: [
			(_req, _opts, res) => {
				const { status } = res;
				if (status === 500) {
					return new Response(JSON.stringify({ success: false }), { status: 200 });
				}

				if (status === 404) {
					window.location.href = "/";
				}

				return res;
			},
		],
	},
});

const api = {
	get: (path, searchParams) => {console.log('params',searchParams); return rootApi.get(path, { searchParams: queryString.stringify(searchParams) }).json()},
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
export const getCollectionData = (organization, project, collection, accessKey, params) => 
	api.get("eco-ready-services/getdata", { organization, project, collection, accessKey, params});
export const getCollectionDataStatistics = (organization, project, collection, accessKey, params) => 
	api.get("eco-ready-services/getdatastatistics", { organization, project, collection, accessKey, params });
