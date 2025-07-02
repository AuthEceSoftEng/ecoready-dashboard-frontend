import { Grid, Typography } from "@mui/material";
import { memo, useEffect, useState } from "react";

import Search from "../components/Search.js";
import { isFuzzyMatch } from "../utils/index.js";

const items = [
	"One",
	"Two",
	"Three",
	"Four",
	"Five",
	"Six",
	"Seven",
	"Eight",
	"Nine",
	"Ten",
];

const SearchExample = () => {
	const [searchFilter, setSearchFilter] = useState("");
	const [displayItems, setDisplayItems] = useState(items);

	useEffect(() => {
		setDisplayItems(items.filter((it) => isFuzzyMatch(it, searchFilter)));
	}, [searchFilter]);

	return (
		<Grid container direction="column" alignItems="center" justifyContent="center">
			<Grid item width="100%" display="flex" justifyContent="center">
				<Search width="300px" value={searchFilter} onChange={(event) => setSearchFilter(event.target.value)} />
			</Grid>
			<Grid item>
				<Typography color="white.main" mt={5}>{"Search Results:"}</Typography>
			</Grid>
			<Grid item>
				{displayItems.map((d) => (
					<Typography key={d} color="secondary.main" mt={2}>{d}</Typography>
				))}
			</Grid>
		</Grid>
	);
};

export default memo(SearchExample);
