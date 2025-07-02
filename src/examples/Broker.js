import { Box, Grid, Typography } from "@mui/material";
import { memo, useRef, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";

import Form from "../components/Form.js";
import { useSnackbar } from "../utils/index.js";
import Spinner from "../components/Spinner.js";
import { HighlightBackgroundButton } from "../components/Buttons.js";
import {
	connect,
	connectToBroker,
	disconnect,
	disconnectFromBroker,
	subscribeToQueue,
	unsubscribeFromQueue,
	publishToQueue,
} from "../utils/websocket.js";

const useStyles = makeStyles(() => ({
	statusBox: {
		width: "30px",
		height: "30px",
		borderRadius: "30px",
	},
}));

const BrokerExample = () => {
	const { success, info, error } = useSnackbar();
	const classes = useStyles();
	const [isLoading, setIsLoading] = useState(false);
	const [connected, setConnected] = useState(false);
	const [connection, setConnection] = useState(null);
	const connectionRef = useRef();
	connectionRef.current = connection;
	const [values, setValues] = useState({
		url: "",
		username: "",
		vhost: "",
		protocol: "",
	});
	const valuesRef = useRef();
	valuesRef.current = values;
	const [incomingMessage, setIncomingMessage] = useState("");

	const onMessage = (msg) => {
		switch (msg.type) {
			case "connectedToBroker": {
				setIsLoading(false);
				setConnected(true);
				success("Connected to broker");
				break;
			}

			case "errorConnectingToBroker": {
				setIsLoading(false);
				error("There was an error trying to connect to broker. Please check the credentials.");
				break;
			}

			case "disconnectedFromBroker": {
				setIsLoading(false);
				setConnected(false);
				info("Disconnected from broker");
				disconnect({
					connection: connectionRef.current,
					onDisconnect: () => info("Disconnected from websocket"),
				});
				setConnected(false);
				break;
			}

			case "errorDisconnectingFromBroker": {
				setIsLoading(false);
				error("There was an error trying to disconnect from broker");
				break;
			}

			case "disconnectedFromQueue": {
				setIsLoading(false);
				disconnectFromBroker({ ...valuesRef.current, connection: connectionRef.current });
				break;
			}

			case "errorDisconnectingFromQueue": {
				setIsLoading(false);
				error("There was an error trying to disconnect from queue");
				break;
			}

			case "brokerMessage": {
				setIncomingMessage(msg.message);
				break;
			}

			default: {
				setIsLoading(false);
				info("Unknown message type");
			}
		}
	};

	const submit = async (submitValues) => {
		const { url, username, password, vhost, protocol } = submitValues;
		if (url && username && password && vhost && protocol) {
			setValues({ url, username, vhost, protocol });
			setIsLoading(true);
			const conn = await connect({
				onConnect: () => { success("Connected to websocket"); },
				onMessage: (msg) => { onMessage(msg); },
				onError: () => { error("There was an error trying to connect to websocket"); },
			});
			setConnection(conn);
			connectToBroker({
				url,
				username,
				password,
				vhost,
				protocol,
				connection: conn,
			});
		} else {
			error("Fill all the credentials");
		}
	};

	const disconnectBroker = () => {
		setIncomingMessage("");
		unsubscribeFromQueue("message", values, connection);
	};

	const sendMessage = (formValues) => {
		const { message } = formValues;
		if (connected) {
			publishToQueue(message, "message", values, connection);
		}
	};

	const formContent = [
		{
			customType: "input",
			id: "url",
			type: "text",
			placeholder: "URL",
		},
		{
			customType: "input",
			id: "username",
			type: "text",
			placeholder: "Username",
		},
		{
			customType: "input",
			id: "password",
			type: "password",
			placeholder: "Password",
		},
		{
			customType: "input",
			id: "vhost",
			type: "text",
			placeholder: "Vhost",
		},
		{
			customType: "dropdown",
			id: "protocol",
			items: [
				{ value: "AMQP", text: "AMQP" },
				{ value: "AMQPS", text: "AMQPS" },
			],
			defaultValue: "AMQPS",
			label: "Protocol",
		},
		{
			customType: "button",
			id: "submit",
			type: "submit",
			text: "Submit",
		},
	];

	const messageContent = [
		{
			customType: "input",
			id: "message",
			type: "text",
			placeholder: "Message",
		},
		{
			customType: "button",
			id: "send",
			type: "submit",
			text: "Send",
		},
	];

	useEffect(() => {
		if (connected) {
			subscribeToQueue("message", values, connection);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connected]);

	return (
		<>
			<Spinner open={isLoading} />
			<Grid container display="flex" justifyContent="center" alignItems="center">
				<Grid item width="500px">
					<Form disabled={connected} content={formContent} toResetForm={false} onSubmit={submit} />
				</Grid>
				<Grid item width="500px" display="flex" flexDirection="column" alignItems="center" m={2}>
					<Grid item display="flex" alignItems="center">
						<Box className={classes.statusBox} backgroundColor={connected ? "success.main" : "error.main"} />
						<Typography fontSize="medium" color="white.main" ml={2} mr={3}>{connected ? "Connected" : "Not connected"}</Typography>
						<HighlightBackgroundButton title="Disconnect" disabled={!connected} onClick={disconnectBroker} />
					</Grid>
					{connected
					&& (
						<Grid item display="flex" alignItems="center" mt={5}>
							<Form disabled={!connected} content={messageContent} onSubmit={sendMessage} />
							<Grid item display="flex" alignItems="center" flexDirection="column" ml={2}>
								<Typography fontSize="medium" color="white.main" textAlign="center">{"Incoming Message:"}</Typography>
								<Typography fontSize="medium" color={incomingMessage ? "third.main" : "error.main"} textAlign="center" sx={{ wordBreak: "break-word" }}>{incomingMessage || "No message"}</Typography>
							</Grid>
						</Grid>
					)}
				</Grid>
			</Grid>
		</>
	);
};

export default memo(BrokerExample);
