import { useState, useMemo, memo } from "react";
import { styled } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Menu, MenuItem, IconButton, Button, Paper, Breadcrumbs, Box } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
	ExpandMore,
	MoreVert as MoreIcon,
} from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { Image } from "mui-image";

import { jwt, capitalize } from "../utils/index.js"; // , isFuzzyMatch
import { products, labs } from "../utils/useful-constants.js";
import logo from "../assets/images/logo.png";
// import inspectionIcon from "../assets/icons/inspection.png";
// import servicesIcon from "../assets/icons/services.png";
import logoutIcon from "../assets/icons/logout.png";

import Search from "./Search.js";

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
	// const [anchorElServices, setAnchorElServices] = useState(null);
	const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
	const [searchFilter, setSearchFilter] = useState("");
	const [searchResults, setSearchResults] = useState([]);

	const searchData = useMemo(() => {
		// Standard product entries (existing)
		const productEntries = products.map((product) => ({
			type: "product",
			name: product.text,
			link: `/products?selected=${product.value}`,
			product, // Store the full product object for searching
		}));

		const productionEntries = products.flatMap((product) => {
			// Check if this product has production products listed
			if (product.production && Array.isArray(product.production.products)) {
				// For each specific product, create a production entry
				return product.production.products.map((subProduct) => ({
					type: "product",
					name: `${subProduct} (${product.text})`,
					link: `/products?selected=${product.value}`,
					product, // Store the parent product object
					value: product.value,
				}));
			}

			return []; // Return empty array if no production products exist
		});

		const priceEntries = products.flatMap((product) => {
			// Check if this product has prices with specific products listed
			if (product.prices && Array.isArray(product.prices.products)) {
				// For each specific product, create a price entry
				return product.prices.products.map((subProduct) => ({
					type: "product",
					name: `${subProduct} (${product.text})`,
					link: `/products?selected=${product.value}`,
					product, // Store the parent product object
					value: product.value,
				}));
			}

			return []; // Return empty array if no prices.products exist
		});

		// Map entries - include ALL products, not just top-level ones
		const mapEntries = products
			.filter((product) => !product.subheader) // Skip subheader entries
			.map((product) => ({
				type: "map",
				name: `${product.text} Map`,
				link: `/map?selected=${product.value}`,
				product, // Store the full product object for searching
				value: product.value, // Add value for proper navigation
			}));

		// NEW: Map entries for specific subproducts (like abricots under Fruits & Vegetables)
		const subProductMapEntries = products.flatMap((product) => {
			// Check if this product has prices with specific products listed
			if (product.prices && Array.isArray(product.prices.products)) {
				// For each specific product, create a map entry
				return product.prices.products.map((subProduct) => ({
					type: "map",
					name: `${subProduct} (${product.text}) Map`,
					link: `/map?selected=${product.value}`,
					product, // Store the parent product object
					value: product.value,
				}));
			}

			return []; // Return empty array if no prices.products exists
		});

		// Lab entries (existing)
		const labEntries = labs.flatMap((lab) => lab.products.map((product) => ({
			type: "lab",
			name: `${lab.title} (Relevant: ${product})`,
			link: lab.path,
			lab, // Store the full lab object
			productName: product, // Store the product name
		})));

		return [...productEntries, ...productionEntries, ...priceEntries, ...mapEntries, ...subProductMapEntries, ...labEntries];
	}, []); // Memoize to avoid unnecessary recalculations

	// const isMenuOpenServices = Boolean(anchorElServices);
	const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

	// const handleServicesMenuOpen = (event) => setAnchorElServices(event.currentTarget);
	const handleMobileMenuClose = () => setMobileMoreAnchorEl(null);
	// const handleServicesMenuClose = () => { setAnchorElServices(null); handleMobileMenuClose(); };
	const handleMobileMenuOpen = (event) => setMobileMoreAnchorEl(event.currentTarget);
	const closeAll = () => {
		// handleServicesMenuClose();
		handleMobileMenuClose();
	};

	const handleSearchChange = (event) => {
		const query = event.target.value.toLowerCase().trim();
		setSearchFilter(query);

		if (query.length === 0) {
			setSearchResults([]);
			return;
		}

		// Prioritize direct name matches
		const nameMatches = searchData.filter((item) => item.name.toLowerCase().includes(query));

		// If we have direct name matches, only show those
		if (nameMatches.length > 0) {
			setSearchResults(nameMatches);
			return;
		}

		// Enhanced filtering logic to search across multiple fields
		const filteredResults = searchData.filter((item) => {
			// Always check the name field
			if (item.name.toLowerCase().includes(query)) return true;

			// Check product-specific fields
			if (item.product) {
				const product = item.product;

				// Check description
				if (product.description && product.description.toLowerCase().includes(query)) return true;

				// Check collections and their products
				if (product.collections) {
					// Check if any collection name matches
					if (Array.isArray(product.collections)) {
						const collectionMatch = product.collections.some((col) => (typeof col === "string" && col.toLowerCase().includes(query))
							|| (col.text && col.text.toLowerCase().includes(query)));
						if (collectionMatch) return true;
					}

					// Check prices products
					if (product.prices && product.prices.products) {
						const pricesMatch = product.prices.products.some((p) => p.toLowerCase().includes(query));
						if (pricesMatch) return true;
					}

					// Check production products
					if (product.production && product.production.products) {
						const productionMatch = product.production.products.some((p) => p.toLowerCase().includes(query));
						if (productionMatch) return true;
					}
				}
			}

			// Check lab-specific fields
			if (item.lab) {
				const lab = item.lab;
				if (lab.description && lab.description.toLowerCase().includes(query)) return true;
				if (lab.region && lab.region.toLowerCase().includes(query)) return true;
			}

			return false;
		});

		setSearchResults(filteredResults);
	};

	const CrumpLink = styled(Link)(({ theme }) => ({ display: "flex", color: theme.palette.primary.main }));

	const buttons = [
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
								<Box
									sx={{
										display: { xs: "flex", sm: "flex", md: "flex" },
										alignItems: "center",
										ml: 2,
										width: { xs: "108px", sm: "200px", md: "300px" },
									}}
								>
									<Search value={searchFilter} results={searchResults} onChange={handleSearchChange} />
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
									<IconButton onClick={handleMobileMenuOpen}>
										<MoreIcon sx={{ color: "primary.main" }} />
									</IconButton>
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
