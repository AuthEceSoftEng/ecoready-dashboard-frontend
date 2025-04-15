import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import { Navigate, useLocation } from "react-router-dom";
import queryString from "query-string";

import { jwt } from "../utils/index.js";

import Sidebar from "./Sidebar.js";

const useStyles = makeStyles((theme) => ({
	main: {
		width: "100%",
		height: "calc(100% - 100px)",
		backgroundColor: `${theme.palette.light.main}`,
		position: "fixed",
	},
	mainBox: {
		padding: "5px 10px",
		overflow: "auto",
		position: "absolute",
		display: "flex",
		height: "100%",
		transition: "width 0.6s, margin-left 0.6s",
	},
	sidebar: {
		position: "fixed",
		zIndex: 1000, // High z-index to stay above other elements
		height: "100vh",
		transition: "all 0.3s ease",
	},
}));

const maybeSetToken = (Component) => (props) => {
	const { search } = useLocation();
	const { token } = queryString.parse(search);
	if (token) jwt.setToken(token);
	return <Component {...props} />;
};

const Protected = ({ c }) => {
	const [isSmall, setIsSmall] = useState(window.innerWidth < 900);
	const location = useLocation();
	const classes = useStyles();

	useEffect(() => {
		const onResize = () => setIsSmall(window.innerWidth < 900);
		window.addEventListener("resize", onResize);

		return () => window.removeEventListener("resize", onResize);
	}, []);

	const handleToggleSidebar = (newIsSmall) => {
		setIsSmall(newIsSmall);
	};

	return jwt.isAuthenticated()
		? (
			<div className={classes.main}>
				<div className={classes.sidebar}>
					<Sidebar isSmall={isSmall} onToggleSidebar={handleToggleSidebar} />
				</div>
				<div
					className={classes.mainBox}
					style={{
						width: isSmall ? "calc(100% - 50px)" : "calc(100% - 200px)",
						marginLeft: isSmall ? "50px" : "200px",
					}}
				>
					<div className="content-container">
						{c}
					</div>
				</div>
			</div>
		)
		: <Navigate replace to="/" state={{ from: location }} />;
};

Protected.propTypes = { c: PropTypes.node.isRequired };
Protected.whyDidYouRender = true;

export default maybeSetToken(Protected);

