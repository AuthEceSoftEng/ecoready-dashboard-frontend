// src/api/api-config.js
import ky from "ky";

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
						globalThis.location.href = "/";
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
					globalThis.location.href = "/";
				}

				return res;
			},
		],
	},
});

export default rootApi;
