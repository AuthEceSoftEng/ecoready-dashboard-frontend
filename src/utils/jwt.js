import decode from "jwt-decode";

import cookie from "./cookie.js";

const jwt = {
	getToken: () => cookie.get("_mycookie"),
	setToken: (token) => token && cookie.set("_mycookie", token),
	destroyToken: () => {
		cookie.remove("_mycookie");
	},
	isAuthenticated: () => {
		const token = cookie.get("_mycookie");
		return token && token !== "undefined";
	},
	decode: () => {
		const token = cookie.get("_mycookie");
		if (token) return decode(token);
		cookie.remove("_mycookie");
		window.location.href = "/";
		return null;
	},
};

export default jwt;
