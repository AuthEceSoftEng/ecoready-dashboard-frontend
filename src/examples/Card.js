import { Grid, Typography } from "@mui/material";
import { memo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";

const CardsExample = () => (
	<Grid container display="flex" direction="column" justifyContent="center" alignItems="center">
		<Grid item width={400}>
			<Card title="Card Example">
				<Typography variant="body" component="p">{"This an example of crop yield."}</Typography>
			</Card>
		</Grid>
		<Grid item width={700} mt={2}>
			<Card title="Card Example 2">
				<Plot
					scrollZoom
					showLegend
					data={[
						{
							x: [1, 2, 3],
							y: [2, 6, 3],
							texts: ["One", "Two", "Three"], // Text for each data point
							type: "scatter", // One of: scatter, bar, pie
							title: "scatter",
							mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
							color: "primary",
						},
						{
							x: [1, 2, 3],
							y: [2, 6, 3],
							type: "bar",
							title: "bar",
							color: "third",
						},
					]}
					title="First Plot"
					displayBar={false}
					width="100%"
					height={null}
				/>
			</Card>
		</Grid>
		<Grid item width={700} mt={2}>
			<Card title="Card Example 3" footer="updated 4 min ago" footerBackgroundColor="white" footerColor="primary">
				<Plot
					showLegend
					scrollZoom
					data={[
						{
							labels: ["One", "Two", "Three"],
							values: [1, 2, 3],
							type: "pie",
							title: "pie",
						},
					]}
					title="Second Plot"
					displayBar={false}
				/>
			</Card>
		</Grid>
		<Grid item width={700} mt={2}>
			<Card
				title="Card Example 4"
				footer={(
					<Grid sx={{ width: "100%", borderTop: "1px solid gray" }}>
						<Typography variant="body" component="p" sx={{ marginTop: "10px" }}>{"🕗 updated 4 min ago"}</Typography>
					</Grid>
				)}
				footerBackgroundColor="white"
				footerColor="gray"
			>
				<Plot
					showLegend
					scrollZoom
					data={[
						{
							labels: ["One", "Two", "Three"],
							values: [1, 2, 3],
							type: "pie",
							title: "pie",
						},
					]}
					title="Second Plot"
					displayBar={false}
				/>
			</Card>
		</Grid>
	</Grid>
);

export default memo(CardsExample);
