import { Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

import { PrimaryBackgroundButton } from "../components/Buttons.js";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";

const AgroLab = () => {
	const navigate = useNavigate();

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around">
            <Grid item width={400}>
                <Card title="Anual Crop Yield" justifyContent="center" alignItems="center">
                    <Typography variant="h4" component="div">{"This an example of crop yield."}</Typography>
                </Card>
            </Grid>
            <Grid item width={400}>
                <Card title="Monthly Irrigation">
                    <Typography variant="body" component="p">{"This an example of this months irrigation."}</Typography>
                </Card>
            </Grid>
            <Grid item width={400}>
                <Card title="Average Crop Yield per Field">
                    <Typography variant="body" component="p">{"This an example of crop yield per field."}</Typography>
                </Card>
            </Grid>
            <Grid item width={400} m={2}>
                <Card title="Card Example" footer="Random footer update">
                    <Plot
                        scrollZoom
                        data={[
                            {
                                x: [1, 2, 3],
                                y: [2, 6, 5],
                                texts: ["One", "Two", "Three"], // Text for each data point
                                type: "scatter", // One of: scatter, bar, pie
                                title: "scatter",
                                mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
                                color: "secondary",
                            },
                            {
                                x: [1, 2, 3],
                                y: [2, 6, 5],
                                type: "bar",
                                title: "bar",
                                color: "third",
                            },
                        ]}
                        title="First Plot"
                        showLegend={false}
                        displayBar={false}
                    />
                </Card>
            </Grid>
            <Grid item width={400} m={2}>
                <Card title="Card Example" footer="Random footer update">
                    <Plot
                        scrollZoom
                        data={[
                            {
                                x: [1, 2, 3],
                                y: [2, 6, 5],
                                texts: ["One", "Two", "Three"], // Text for each data point
                                type: "scatter", // One of: scatter, bar, pie
                                title: "scatter",
                                mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
                                color: "secondary",
                            },
                            {
                                x: [1, 2, 3],
                                y: [2, 6, 5],
                                type: "bar",
                                title: "bar",
                                color: "third",
                            },
                        ]}
                        title="First Plot"
                        showLegend={false}
                        displayBar={false}
                    />
                </Card>
            </Grid>
            <Grid item width={400} m={2}>
                <Card title="Card Example 3" footer="Random footer update">
                    <Plot
                        scrollZoom
                        data={[
                            {
                                x: [1, 2, 3],
                                y: [2, 6, 5],
                                texts: ["One", "Two", "Three"], // Text for each data point
                                type: "scatter", // One of: scatter, bar, pie
                                title: "scatter",
                                mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
                                color: "secondary",
                            },
                            {
                                x: [1, 2, 3],
                                y: [2, 6, 5],
                                type: "bar",
                                title: "bar",
                                color: "third",
                            },
                        ]}
                        title="First Plot"
                        showLegend={false}
                        displayBar={false}
                        
                    />
                </Card>
            </Grid>
        </Grid>
    );
};

export default memo(AgroLab);
