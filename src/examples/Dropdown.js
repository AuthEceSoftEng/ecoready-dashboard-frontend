import { Grid } from "@mui/material";
import { memo, useState } from "react";

import Dropdown from "../components/Dropdown.js";

const DropdownExample = () => {
	const [value, setValue] = useState("");

	const items = [
		{
			value: 10,
			text: "Ten",
		},
		{
			value: 20,
			text: "Twenty",
		},
		{
			value: 30,
			text: "Thirty",
		},
	];

	const onChange = (event) => setValue(event.target.value);

	return (
		<Grid container display="flex" direction="column" justifyContent="center" alignItems="center">
			<Grid item>
				<Dropdown
					id="example-dropdown"
					items={items}
					value={value}
					size="medium"
					width="200px"
					filled={false}
					background="primary"
					onChange={onChange}
				/>
			</Grid>
			<Grid item mt={2}>
				<Dropdown
					filled
					id="example-dropdown"
					items={items}
					value={value}
					size="medium"
					width="200px"
					background="primary"
					onChange={onChange}
				/>
			</Grid>
			<Grid item mt={2}>
				<Dropdown
					id="example-dropdown"
					items={items}
					value={value}
					size="medium"
					width="200px"
					filled={false}
					background="secondary"
					onChange={onChange}
				/>
			</Grid>
			<Grid item mt={2}>
				<Dropdown
					filled
					id="example-dropdown"
					items={items}
					value={value}
					size="medium"
					width="200px"
					background="secondary"
					onChange={onChange}
				/>
			</Grid>
			<Grid item mt={2}>
				<Dropdown
					id="example-dropdown"
					items={items}
					value={value}
					size="medium"
					width="200px"
					filled={false}
					background="third"
					onChange={onChange}
				/>
			</Grid>
			<Grid item mt={2}>
				<Dropdown
					filled
					id="example-dropdown"
					items={items}
					value={value}
					size="medium"
					width="200px"
					background="third"
					onChange={onChange}
				/>
			</Grid>
		</Grid>
	);
};

export default memo(DropdownExample);
