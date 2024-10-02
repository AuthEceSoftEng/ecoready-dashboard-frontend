import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

import { PrimaryBackgroundButton } from "../components/Buttons.js";
import Plot from "../components/Plot.js";

const AgroLab = () => {
	const navigate = useNavigate();

	return (
		<Grid container display="flex" direction="row" justifyContent="center" alignItems="center">
            <Grid item width="500px">
                <Plot
                    scrollZoom
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
                    showLegend={false}
                    displayBar={false}
                />
            </Grid>
            <Grid item m={2} width="500px">
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
            </Grid>
        </Grid>
    );
};

export default memo(AgroLab);
