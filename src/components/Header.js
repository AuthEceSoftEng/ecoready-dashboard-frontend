import { useState, memo } from "react";
import { styled } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Menu, MenuItem, IconButton, Button, Paper, Breadcrumbs, Box } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
	ExpandMore,
	MoreVert as MoreIcon,
} from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { Image } from "mui-image";

import { jwt, capitalize } from "../utils/index.js";
import Search from "./Search.js";
import { isFuzzyMatch } from "../utils/index.js";
import logo from "../assets/images/logo.png";
import inspectionIcon from "../assets/icons/inspection.png";
import servicesIcon from "../assets/icons/services.png";
import logoutIcon from "../assets/icons/logout.png";

const useStyles = makeStyles((theme) => ({
	grow: {
		flexGrow: 1,
		flexBasis: "auto",
		background: "white",
		zIndex: 1200,
		height: "70px",
	},
	root: {
		height: "30px",
		padding: theme.spacing(0.5),
		borderRadius: "0px",
		background: theme.palette.greyDark.main,
	},
	icon: {
		marginRight: 0.5,
		width: 20,
		height: 20,
	},
	expanded: {
		background: "transparent",
	},
	innerSmallAvatar: {
		color: theme.palette.common.black,
		fontSize: "inherit",
	},
	anchorOriginBottomRightCircular: {
		".MuiBadge-anchorOriginBottomRightCircular": {
			right: 0,
			bottom: 0,
		},
	},
	avatar: {
		width: "30px",
		height: "30px",
		background: "white",
	},
	iconButton: {
		padding: "3px 6px",
	},
	menuItemButton: {
		width: "100%",
		bgcolor: "grey.light",
		"&:hover": {
			bgcolor: "grey.dark",
		},
	},
	grey: {
		color: "grey.500",
	},
}));

const ButtonWithText = ({ text, icon, more, handler }) => (
	<Button sx={{ height: "100%", display: "flex", flexDirection: "column", p: 1, mx: 1 }} onClick={(event) => handler(event)}>
		<Image src={icon} alt={text} fit="contain" sx={{ p: 0, my: 0, height: "100%", maxWidth: "200px" }} />
		<Typography align="center" color="primary.main" fontSize="small" fontWeight="bold" display="flex" alignItems="center" sx={{ textTransform: "capitalize" }}>
			{text}
			{more && <ExpandMore />}
		</Typography>
	</Button>
);

const Header = ({ isAuthenticated }) => {
	const classes = useStyles();

	const location = useLocation();
	const navigate = useNavigate();
	const [anchorElServices, setAnchorElServices] = useState(null);
	const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
	const [searchFilter, setSearchFilter] = useState("");

	const isMenuOpenServices = Boolean(anchorElServices);
	const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

	const handleServicesMenuOpen = (event) => setAnchorElServices(event.currentTarget);
	const handleMobileMenuClose = () => setMobileMoreAnchorEl(null);
	const handleServicesMenuClose = () => { setAnchorElServices(null); handleMobileMenuClose(); };
	const handleMobileMenuOpen = (event) => setMobileMoreAnchorEl(event.currentTarget);
	const closeAll = () => {
		handleServicesMenuClose();
		handleMobileMenuClose();
	};
	const handleSearchChange = (event) => {
        setSearchFilter(event.target.value);
    };

	const CrumpLink = styled(Link)(({ theme }) => ({ display: "flex", color: theme.palette.primary.main }));

	const buttons = [
		// {
		// 	icon: inspectionIcon,
		// 	text: "Inspection",
		// 	handler: () => {
		// 		closeAll();
		// 		navigate("/inspection");
		// 	},
		// },
		// {
		// 	icon: servicesIcon,
		// 	text: "Services",
		// 	handler: (event) => {
		// 		closeAll();
		// 		handleServicesMenuOpen(event);
		// 	},
		// 	more: [
		// 		{ title: "Users", path: "/users", icon: servicesIcon },
		// 		{ title: "Services", path: "/services", icon: servicesIcon },
		// 		{ title: "Hacking", path: "/hacking", icon: servicesIcon },
		// 	],
		// },
		{
			icon: logoutIcon,
			text: "Logout",
			handler: () => {
				closeAll();
				jwt.destroyToken();
				navigate("/");
			},
		},
	];

	const renderMobileMenu = (
		<Menu
			keepMounted
			anchorEl={mobileMoreAnchorEl}
			anchorOrigin={{ vertical: "top", horizontal: "right" }}
			transformOrigin={{ vertical: "top", horizontal: "right" }}
			open={isMobileMenuOpen}
			onClose={handleMobileMenuClose}
		>
			{buttons.map((button) => (
				<MenuItem key={button.text} onClick={button.handler}>
					<Image src={button.icon} width="20px" />
					<p style={{ marginLeft: "5px" }}>{button.text}</p>
					{button.more && <ExpandMore />}
				</MenuItem>
			))}
		</Menu>
	);

	// const renderServicesMenu = (
	// 	<Menu
	// 		keepMounted
	// 		anchorEl={anchorElServices}
	// 		anchorOrigin={{ vertical: "top", horizontal: "right" }}
	// 		transformOrigin={{ vertical: "top", horizontal: "right" }}
	// 		open={isMenuOpenServices}
	// 		onClose={handleServicesMenuClose}
	// 	>
	// 		{buttons.find((button) => button.text === "Services").more.map((moreButton) => (
	// 			<MenuItem key={moreButton.title} onClick={() => { closeAll(); navigate(moreButton.path); }}>
	// 				<Image src={moreButton.icon} width="20px" />
	// 				<p style={{ marginLeft: "5px" }}>{moreButton.title}</p>
	// 			</MenuItem>
	// 		))}
	// 	</Menu>
	// );

	const pathnames = location.pathname.split("/").filter(Boolean);
	const crumps = [];
	crumps.push(
		<CrumpLink to="/">
			{"Home"}
		</CrumpLink>,
	);

	for (const [ind, path] of pathnames.entries()) {
		let text = capitalize(path);
		// eslint-disable-next-line no-continue
		if (path === "home") continue;
		switch (path) {
			case "file-upload": {
				text = "File Upload";
				break;
			}

			default:
		}

		crumps.push(<CrumpLink to={`/${pathnames.slice(0, ind + 1).join("/")}`}>{text}</CrumpLink>);
	}

	return (
		<>
			<AppBar id="header" position="static" className={classes.grow}>
				<Toolbar className="header-container">
					<Box component={Link} to="/">
						<Image src={logo} alt="Logo" sx={{ p: 0, my: 0, height: "100%", maxWidth: "130px" }} />
					</Box>
					<Box className={classes.grow} style={{ height: "100%" }} />
					{isAuthenticated
					&& (
						<>
							<Box sx={{ display: { xs: "none", sm: "flex", md: "flex" }, alignItems: "center", ml: 2 }}>
                                <Search value={searchFilter} onChange={handleSearchChange} />
                            </Box>
							<Box sx={{ display: { xs: "none", sm: "none", md: "flex" }, height: "100%", py: 1 }}>
								{buttons.map((button) => (
									<ButtonWithText
										key={button.text}
										icon={button.icon}
										text={button.text}
										handler={button.handler}
										more={button.more}
									/>
								))}
							</Box>
							<Box sx={{ display: { xs: "flex", sm: "flex", md: "none" } }}>
								<IconButton color="primary" onClick={handleMobileMenuOpen}><MoreIcon /></IconButton>
							</Box>
						</>
					)}
				</Toolbar>
			</AppBar>
			{isAuthenticated
			&& (
				<Paper elevation={0} className={classes.root}>
					<Breadcrumbs className="header-container">{crumps.map((e, ind) => <div key={`crump_${ind}`}>{e}</div>)}</Breadcrumbs>
				</Paper>
			)}
			{isAuthenticated
			&& (
				<>
					{renderMobileMenu}
					{/* {renderServicesMenu} */}
				</>
			)}
		</>
	);
};

export default memo(Header);
