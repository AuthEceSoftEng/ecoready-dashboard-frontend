import { Grid, Typography, Link as MaterialLink, Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { Edit, Archive, Delete } from "@mui/icons-material";
import { memo, useMemo, useState } from "react";
import { dateOldToNew, stringAToZInsensitive } from "@iamnapo/sort";

import Table from "../components/Table.js";
import { isFuzzyMatch, dayjs } from "../utils/index.js";

const dummyData = [
	{
		id: "test",
		name: "Test",
		status: "active",
		createdAt: new Date(),
	},
	{
		id: "test2",
		name: "Test2",
		status: "inactive",
		createdAt: new Date(),
	},
	{
		id: "test2",
		name: "Test2",
		status: "inactive",
		createdAt: new Date(),
	},
	{
		id: "test2",
		name: "Test2",
		status: "inactive",
		createdAt: new Date(),
	},
	{
		id: "test2",
		name: "Test2",
		status: "inactive",
		createdAt: new Date(),
	},
	{
		id: "test2",
		name: "Test2",
		status: "inactive",
		createdAt: new Date(),
	},
	{
		id: "test2",
		name: "Test2",
		status: "inactive",
		createdAt: new Date(),
	},
];

const TableExample = () => {
	// eslint-disable-next-line no-unused-vars
	const [isLoading, setIsLoading] = useState(false);

	const tableColumns = useMemo(() => [
		{
			Header: <Typography id="name_header" variant="h6">{"Name"}</Typography>,
			accessor: "name",
			id: "name",
			filterable: true,
			minWidth: 200,
			sortMethod: (value1, value2) => stringAToZInsensitive()(value1, value2),
			filterMethod: ({ id, value }, row) => isFuzzyMatch(row[id], value),
			Cell: ({ value }) => (
				<Box sx={{ display: "flex", ml: 1, alignItems: "center" }}>
					<MaterialLink
						underline="none"
						color="third"
						onClick={() => console.log(value)}
					>
						{value}
					</MaterialLink>
				</Box>
			),
		},
		{
			Header: <Typography variant="h6">{"Status"}</Typography>,
			accessor: "status",
			id: "status",
			filterable: true,
			minWidth: 250,
			maxWidth: 380,
			style: { overflow: "visible" },
			sortMethod: (value1, value2) => stringAToZInsensitive()(value1, value2),
			filterMethod: ({ id, value }, row) => isFuzzyMatch(row[id], value),
			Cell: ({ value }) => (
				<Box sx={{ display: "flex", ml: 1, alignItems: "center", justifyContent: "center" }}>
					<Typography color={value.toLowerCase() === "active" ? "success.main" : (value.toLowerCase() === "inactive" ? "error.main" : "black")}>{value}</Typography>
				</Box>
			),
		},
		{
			Header: <Typography variant="h6">{"Created"}</Typography>,
			accessor: "createdAt",
			id: "createdAt",
			minWidth: 250,
			maxWidth: 380,
			style: { overflow: "visible" },
			sortMethod: (value1, value2) => dateOldToNew((v) => new Date(v))(value1, value2),
			Cell: ({ value }) => (
				<Box sx={{ display: "flex", ml: 1, alignItems: "center", justifyContent: "center" }}>
					<Typography>{dayjs(value).format("L")}</Typography>
				</Box>
			),
		},
		{
			Header: <Typography variant="h6">{"Actions"}</Typography>,
			accessor: "name",
			filterable: false,
			sortable: false,
			width: 180,
			Cell: ({ value }) => (
				<ToggleButtonGroup exclusive size="small" aria-label="actions">
					<ToggleButton
						value="view"
						title="view"
						aria-label="view"
						sx={{ borderColor: "primary.main" }}
						onClick={() => console.log(value)}
					>
						<Edit color="primary" />
					</ToggleButton>
					<ToggleButton
						value="archive"
						title="archive"
						aria-label="archive"
						sx={{ borderColor: "primary.main" }}
						onClick={() => console.log(value)}
					>
						<Archive color="primary" />
					</ToggleButton>
					<ToggleButton
						value="delete"
						title="delete"
						aria-label="delete"
						sx={{ borderColor: "primary.main" }}
						onClick={() => console.log(value)}
					>
						<Delete color="error" />
					</ToggleButton>
				</ToggleButtonGroup>
			),
		},
	], []);

	return (
		<Grid container display="flex" direction="column" justifyContent="center" alignItems="center">
			<Grid item>
				<Table
					data={dummyData}
					noDataText={isLoading ? "Fetching data..." : "No data available!"}
					columns={tableColumns}
					defaultSorted={[{ id: "name", desc: true }]}
				/>
			</Grid>
		</Grid>
	);
};

export default memo(TableExample);
