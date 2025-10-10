import { Grid } from "@mui/material";

import colors from "../_colors.scss";

import Dropdown from "./Dropdown.js";
import Form from "./Form.js";

const StickyBand = ({
	sticky = true,
	borderRadius = "16px",
	dropdownContent = [],
	formRef,
	formContent,
	toggleContent,
	togglePlacing,
	downloadContent,

}) => (
	<Grid
		container
		display="flex"
		direction="row"
		justifyContent="flex-end"
		alignItems="flex-end"
		mt={1}
		sx={{
			position: sticky ? "sticky" : "relative",
			top: -5,
			backgroundColor: sticky ? colors.grey : "inherit",
			zIndex: sticky ? 10_000 : "auto",
			minWidth: "100%",
			padding: "0.3rem",
			gap: "0.3rem",
			margin: 0,
		}}
	>
		{downloadContent && (
			<Grid item sx={{ display: "flex", alignItems: "stretch", minWidth: "fit-content", flexShrink: 0, marginRight: "5.5rem" }} xs={6} sm={2} md={2}>
				{downloadContent}
			</Grid>
		)}
		{toggleContent && (
			<Grid item sx={{ display: "flex", justifyContent: togglePlacing ?? "flex-end", alignItems: "center", minWidth: "fit-content", flexShrink: 0 }} xs={12} sm={5} md={6}>
				{toggleContent}
			</Grid>
		)}
		{dropdownContent.map((dropdown, index) => (
			<Grid key={index} item sx={{ display: "flex", justifyContent: "flex-end", minWidth: "fit-content", flexShrink: 0 }} xs={6} sm={2} md={1}>
				<Dropdown
					id={dropdown.id}
					value={dropdown.value}
					placeholder={dropdown.label}
					items={dropdown.items}
					size={dropdown.size}
					width={dropdown.width || "170px"}
					height={dropdown.height || "40px"}
					borderRadius={borderRadius || "16px"}
					background={dropdown.color ?? "primary"}
					subheader={dropdown.subheader}
					multiple={dropdown.multiple}
					onChange={dropdown.onChange}
				/>
			</Grid>
		))}
		{formContent && (
			<Grid item sx={{ display: "flex", justifyContent: "flex-start", minWidth: "fit-content", flexShrink: 0 }} xs={6} sm={2} md={formContent.customType === "date-range" ? 2 : 1}>
				<Form ref={formRef} content={formContent} borderRadius={borderRadius} />
			</Grid>
		)}
	</Grid>
);

export default StickyBand;
