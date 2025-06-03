import { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import { Button, Grid, Menu, MenuItem, Typography } from "@mui/material";
import Image from "mui-image";
import {
	ExpandMoreRounded, MapRounded, HomeRounded,
	AgricultureRounded, SpaRounded,
	Diversity3Rounded,
	CrisisAlertRounded,
} from "@mui/icons-material";

import { labs } from "../utils/useful-constants.js";

import Accordion from "./Accordion.js";

const useStyles = makeStyles((theme) => ({
	sidebar: {
		height: "100%",
		position: "absolute",
		backgroundColor: theme.palette.primary.main,
		color: "white",
		overflow: "auto",
		transition: "all 0.5s ease-in-out",
		zIndex: 1000,
	},
	toggleButton: {
		position: "absolute",
		top: "0",
		right: "0",
		zIndex: 1000,
		color: "white",
		padding: "4px",
		minWidth: "30px",
		minHeight: "30px",
		transition: "transform 0.3s ease-in-out",
	},
}));

const IconRenderer = ({ icon, text, size = "25px" }) => (
	typeof icon === "string"
		? <Image src={icon} alt={text} fit="contain" width={size} />
		: <span style={{ fontSize: size, display: "flex", alignItems: "center", color: "white" }}>{icon}</span>
);

const LogoRenderer = ({ logo, title, size = "20px", borderRadius = "8px" }) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius,
			overflow: "hidden",
			marginRight: "8px",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
		}}
	>
		<Image src={logo} alt={title} fit="contain" width={size} height={size} />
	</div>
);

const ButtonWithText = ({ text, icon, more, handler }) => (
	<span key={text}>
		{!more
			&& (
				<Button
					key={text}
					sx={{
						width: "100%",
						display: "flex",
						flexDirection: "row",
						justifyContent: "flex-start",
						padding: "8px 40px 8px 16px",
						"&:hover": {
							backgroundColor: "rgba(255, 255, 255, 0.1)", // subtle white overlay on hover
							transition: "background-color 0.3s ease",
						},
					}}
					onClick={(event) => handler(event)}
				>
					{icon && <IconRenderer icon={icon} text={text} />}
					<Typography
						align="center"
						color="white.main"
						fontSize="medium"
						ml={1}
						display="flex"
						alignItems="center"
						sx={{ textTransform: "capitalize" }}
					>
						{text}
						{more && <ExpandMoreRounded />}
					</Typography>
				</Button>
			)}
		{more && (
			<Accordion
				key={text}
				title={(
					<Grid item sx={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-start" }}>
						{icon && <IconRenderer icon={icon} text={text} />}
						<Typography
							align="center"
							color="white.main"
							fontSize="medium"
							ml={1}
							display="flex"
							alignItems="center"
							sx={{ textTransform: "capitalize" }}
						>
							{text}
						</Typography>
					</Grid>
				)}
				content={(
					<Grid container flexDirection="column" width="100%">
						{more.map((el) => (
							<Button
								key={el.title}
								color="white"
								sx={{
									justifyContent: "flex-start",
									marginLeft: "20px",
									"&:hover": {
										backgroundColor: "rgba(255, 255, 255, 0.1)",
										transition: "background-color 0.3s ease",
									},
								}}
								onClick={el.handler}
							>
								{el.logo && <LogoRenderer logo={el.logo} title={el.title} />}
								<Typography sx={{ textTransform: "capitalize", textAlign: "left" }}>{el.title}</Typography>
							</Button>
						))}
					</Grid>
				)}
				alwaysExpanded={false}
				titleBackground="transparent"
				expandIconColor="white"
			/>
		)}
	</span>
);

const ButtonSimple = ({ text, icon, handler, ind }) => (
	<Button
		key={text}
		sx={{
			minWidth: "30px!important",
			padding: "8px",
			position: "absolute",
			top: `${ind * 40}px`, // Fixed position based on index (adjust the multiplier as needed)
			left: "50%",
			transform: "translateX(-50%)",
			transition: "top 0.5s ease-in-out, background-color 0.3s ease",
			"&:hover": {
				backgroundColor: "rgba(255, 255, 255, 0.1)",
				transition: "background-color 0.3s ease",
			},
		}}
		onClick={(event) => handler(event)}
	>
		{icon && (typeof icon === "string"
			? <Image src={icon} alt={text} fit="contain" width="30px" />
			: <span style={{ fontSize: "30px", display: "flex", alignItems: "center", color: "white" }}>{icon}</span>)}
	</Button>
);

const Sidebar = ({ isSmall: sidebarIsSmall, onToggleSidebar }) => {
	const [isSmall, setIsSmall] = useState(false);
	const [anchorElServices, setAnchorElServices] = useState(null);
	const navigate = useNavigate();
	const classes = useStyles();

	const isMenuOpenServices = Boolean(anchorElServices);
	const handleServicesMenuOpen = (event) => setAnchorElServices(event.currentTarget);
	const handleServicesMenuClose = () => { setAnchorElServices(null); };

	useEffect(() => setIsSmall(sidebarIsSmall), [sidebarIsSmall]);

	const buttons = [
		{
			icon: <HomeRounded />,
			text: "Overview",
			handler: () => {
				handleServicesMenuClose();
				navigate("/home");
			},
		},
		{
			icon: <AgricultureRounded />,
			text: "Products",
			handler: () => {
				handleServicesMenuClose();
				navigate("/products");
			},
		},
		{
			icon: <CrisisAlertRounded />,
			text: "Contaminants",
			handler: () => {
				handleServicesMenuClose();
				navigate("/contaminants");
			},
		},
		{
			icon: <Diversity3Rounded />,
			text: "Social Impact",
			handler: () => {
				handleServicesMenuClose();
				navigate("/lcamag");
			},
		},
		{
			icon: <MapRounded />,
			text: "Map",
			handler: () => {
				handleServicesMenuClose();
				navigate("/Map");
			},
		},
		{
			icon: <SpaRounded />,
			text: "Living Labs",
			handler: (event) => {
				handleServicesMenuClose();
				handleServicesMenuOpen(event);
			},
			more: labs.map((lab) => ({
				logo: lab.logo,
				title: lab.title,
				handler: () => navigate(lab.path),
			})),
		},
		//		{
		//			// icon: inspectionIcon,
		//			text: "Data View",
		//			handler: () => {
		//				handleServicesMenuClose();
		//				navigate("/dataview");
		//			},
		//		},
	];

	const renderServicesMenu = (
		<Menu
			keepMounted
			anchorEl={anchorElServices}
			anchorOrigin={{ vertical: "top", horizontal: "right" }}
			transformOrigin={{ vertical: "top", horizontal: "right" }}
			open={isMenuOpenServices}
			onClose={handleServicesMenuClose}
		>
			{buttons.find((button) => button.text === "Living Labs").more.map((moreButton) => (
				<MenuItem key={moreButton.title} onClick={() => { handleServicesMenuClose(); moreButton.handler(); }}>
					{moreButton.logo && <LogoRenderer logo={moreButton.logo} title={moreButton.title} />}
					<Typography sx={{ marginLeft: "5px" }}>
						{moreButton.title}
					</Typography>
				</MenuItem>
			))}
		</Menu>
	);

	const toggleSidebar = () => {
		if (window.innerWidth >= 900) {
			const newIsSmall = !isSmall;
			setIsSmall(newIsSmall);
			onToggleSidebar(newIsSmall);
		}
	};

	return (
		<div className={classes.sidebar} style={{ width: isSmall ? "50px" : "200px", padding: isSmall ? "20px 5px" : "20px 5px", textAlign: "center", transition: "width 0.5s ease-in-out, padding 0.5s ease-in-out" }}>
			<Button
				className={classes.toggleButton}
				sx={{
					transform: isSmall ? "rotate(-90deg)" : "rotate(90deg)",
				}}
				onClick={toggleSidebar}
			>
				<ExpandMoreRounded fontSize="small" />
			</Button>
			{!isSmall && buttons.map((button) => (
				<ButtonWithText
					key={button.text}
					icon={button.icon}
					text={button.text}
					handler={button.handler}
					more={button.more}
				/>
			))}
			{isSmall && (
				<div style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					position: "relative",
					height: `${buttons.length * 40}px`, // Make the container tall enough
					width: "100%",
					transition: "all 0.5s ease-in-out",
				}}
				>
					{buttons.map((button, ind) => (
						<ButtonSimple
							key={button.text}
							icon={button.icon}
							text={button.text}
							handler={button.handler}
							more={button.more}
							ind={ind}
						/>
					))}
				</div>
			)}
			{renderServicesMenu}
		</div>
	);
};

export default Sidebar;
