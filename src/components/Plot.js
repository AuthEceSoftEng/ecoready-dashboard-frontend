import Plotly from "react-plotly.js";

import { DataWarning } from "../utils/rendering-items.js";
import colors from "../_colors.scss";

const agriColors = [
	colors.ag1, colors.ag2, colors.ag3, colors.ag4, colors.ag5,
	colors.ag6, colors.ag7, colors.ag8, colors.ag9, colors.ag10,
	colors.ag11, colors.ag12, colors.ag13, colors.ag14, colors.ag15,
	colors.ag16, colors.ag17, colors.ag18, colors.ag19, colors.ag20,
];

const validatePieData = (data) => {
	let errorMessage = "";

	const hasError = data.some((d) => {
		if (!d.values || !Array.isArray(d.values) || d.values.length === 0) {
			errorMessage = "No Data Available for the Specified Time Period...";
			return true;
		}

		if (d.values.reduce((sum, val) => sum + val, 0) === 0) {
			errorMessage = "Pie chart Values Sum to Zero";
			return true;
		}

		return false;
	});

	return { hasError, errorMessage };
};

const Plot = ({
	data, // An array of objects. Each one describes a specific subplot
	title = "", // Plot title
	titleColor = "primary", // Plot title color (from the list of colors e.g. secondary or global e.g. red)
	titleFontSize, // Plot title font size (optional)
	showLegend = true, // Show plot legend or not
	legendFontSize, // Plot legend font size (optional)
	scrollZoom = false, // Enable or disable zoom in/out on scrolling
	editable = false, // Enable or disable user edit on plot (e.g. plot title)
	// eslint-disable-next-line unicorn/no-useless-undefined
	displayBar = undefined, // Enable or disable mode bar with actions for user
	// (true for always display, false for never display, undefined for display on hover)
	width = "100%",
	height = "100%",
	background = "white",
	polarRange = [0, 100],
	barmode = null,
	xaxis = {},
	yaxis = {},
}) => {
	const hasPieChart = data.some((d) => d.type === "pie");

	if (hasPieChart) {
		const { hasError, errorMessage } = validatePieData(data);
		if (hasError) {
			return <DataWarning message={errorMessage} />;
		}
	}

	return (
		<Plotly
			useResizeHandler // Enable resize handler
			data={data.map((d, index) => ({
				x: d.x,
				y: d.y,
				z: d.z,
				type: d.type,
				name: d.title,
				text: d.texts,
				mode: d.mode,
				marker: d.type === "pie"
					? { colors: d.color || agriColors }
					: {
						color: d.color
							? (colors?.[d.color] || d.color)
							: agriColors[index % agriColors.length],
					},
				values: d.values,
				value: d.value,
				r: d.r,
				theta: d.theta,
				fill: d.fill,
				number: {
					suffix: d.suffix,
					font: { color: colors?.[d?.textColor] || d?.textColor || "black" },
				},
				sort: d.sort ?? true,
				gauge: {
					axis: { range: d.range },
					bar: { color: colors?.[d?.color] || d?.color, thickness: 1 },
					shape: d.shape,
					...(d.indicator && {
						threshold: {
							line: { color: colors?.[d?.indicator] || d?.indicator, width: 3 },
							thickness: 1,
							value: d.value,
						},
					}),
				},
				domain: { x: [0, 1], y: [0, 1] },
				labels: d.labels,
				textFont: { color: "white" },
			}))}
			layout={{
				title: {
					text: title,
					font: { color: colors?.[titleColor] || titleColor, size: titleFontSize },
				},
				showlegend: showLegend,
				legend: {
					font: { color: colors?.[titleColor] || titleColor, size: legendFontSize },
				},
				xaxis: {
					...xaxis,
				},
				yaxis: {
					...yaxis,
				},
				barmode,
				paper_bgcolor: colors?.[background] || background,
				plot_bgcolor: colors?.[background] || background,
				margin: { t: title ? 60 : 40, l: 40, b: 40, ...(!showLegend && { r: 40 }) },
				autosize: true,
				polar: {
					radialaxis: {
						visible: data.some((d) => d.type === "scatterpolar"),
						range: polarRange,
					},
				},
			}}
			config={{
				scrollZoom,
				displayModeBar: displayBar,
				editable,
				...(displayBar !== undefined && { displayModeBar: displayBar }),
				displaylogo: false,
			}}
			style={{ width, height }}
		/>
	);
};

export default Plot;
