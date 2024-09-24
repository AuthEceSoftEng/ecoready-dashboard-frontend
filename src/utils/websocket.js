import jwt from "./jwt.js";

const { REACT_APP_WEBSOCKET_URL } = process.env;

export const connect = async ({ onConnect, onMessage, onError }) => {
	try {
		const connection = new WebSocket(`${REACT_APP_WEBSOCKET_URL}?token=${jwt.getToken()}`);
		connection.addEventListener("open", onConnect);
		connection.addEventListener("message", (msg) => onMessage(JSON.parse(msg.data)));
		connection.addEventListener("error", onError);

		while (connection.readyState !== 1) {
			await new Promise((resolve) => { setTimeout(resolve, 1000); });
		}

		return connection;
	} catch {
		return null;
	}
};

export const disconnect = ({ connection, onDisconnect }) => {
	connection.close();
	if (onDisconnect) {
		onDisconnect();
	}
};

export const connectToBroker = ({ url, username, password, vhost, protocol, connection }) => connection.send(JSON.stringify({
	type: "connectToBroker",
	url,
	username,
	password,
	vhost,
	protocol,
}));

export const disconnectFromBroker = ({ url, username, vhost, protocol, connection }) => connection.send(JSON.stringify({
	type: "disconnectFromBroker",
	url,
	username,
	vhost,
	protocol,
}));

export const subscribeToQueue = (queue, values, connection) => connection.send(JSON.stringify({
	type: "connectToQueue",
	queue,
	...values,
}));

export const unsubscribeFromQueue = (queue, values, connection) => connection.send(JSON.stringify({
	type: "disconnectFromQueue",
	queue,
	...values,
}));

export const publishToQueue = (message, queue, values, connection) => connection.send(JSON.stringify({
	type: "sendToQueue",
	message,
	queue,
	...values,
}));
