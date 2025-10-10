import Plotly from "react-plotly.js";

import { DataWarning } from "../utils/rendering-items.js";
import colors from "../_colors.scss";

const agriColors = Array.from({ length: 20 }, (_, i) => colors[`ag${i + 1}`]);

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

const pieDataThreshold = (data, thres = 0.03) => {
	const total = data.reduce((a, b) => a + b, 0);
	const text = data.map((val) => {
		const pct = val / total;
		return pct >= thres ? `${((pct) * 100).toFixed(1)}%` : "";
	});
	return text;
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
	shapes = [],
	xaxis = {},
	yaxis = {},
	layout = {},
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
			data={data.map((d, index) => {
				const baseProps = {
					x: d.x,
					y: d.y,
					z: d.z,
					xaxis: d.xaxis,
					yaxis: d.yaxis,
					type: d.type,
					name: d.name || d.title,
					text: d.texts,
					mode: d.mode,
					values: d.values,
					value: d.value,
					r: d.r,
					theta: d.theta,
					boxpoints: d.boxpoints,
					jitter: d.jitter,
					pointpos: d.pointpos,
					fill: d.fill,
					showlegend: d.showlegend ?? true,
					number: {
						suffix: d.suffix,
						font: {
							color: colors?.[d?.textColor] || d?.textColor || "black",
							size: d.shape === "bullet" ? d?.textFontSize || 20 : "auto",
						},
					},
					hovertemplate: d.hovertemplate,
					customdata: d.customdata,
					sort: d.sort ?? true,
					orientation: d.orientation || "v",
				};

				// Add pie-specific properties
				if (d.type === "pie") {
					return {
						...baseProps,
						marker: { colors: d.color || agriColors },
						labels: d.labels,
						textposition: "inside",
						text: pieDataThreshold(d.values, 0.03),
						textinfo: "text",
						hoverinfo: "label+percent+value",
						insidetextorientation: "radial",
						domain: { x: [0, 1], y: [0, 1] },
						textfont: { color: "white", size: 12 },
					};
				}

				// Non-pie chart properties
				return {
					...baseProps,
					marker: {
						color: d.color
							? (colors?.[d.color] || d.color)
							: agriColors[index % agriColors.length],
					},
					gauge: d.type === "indicator" ? {
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
					} : undefined,
					domain: { x: [0, 1], y: [0, 1] },
					labels: d.labels,
					textfont: { color: "white" },
				};
			})}
			layout={{
				title: {
					text: title,
					font: { color: colors?.[titleColor] || titleColor, size: titleFontSize },
				},
				showlegend: showLegend,
				legend: {
					font: { color: colors?.[titleColor] || titleColor, size: legendFontSize },
				},
				shapes: shapes.map((shape) => ({ ...shape })),
				xaxis: { automargin: true, ...(xaxis.primary || xaxis) },
				...(xaxis.secondary && { xaxis2: { automargin: true, ...xaxis.secondary } }),
				yaxis: { automargin: true, ...(yaxis.primary || yaxis) },
				...(yaxis.secondary && { yaxis2: { automargin: true, ...yaxis.secondary } }),
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
				...layout,
			}}
			config={{
				scrollZoom,
				editable,
				...(displayBar !== undefined && { displayModeBar: displayBar }),
				displaylogo: false,
			}}
			style={{ width, height }}
		/>
	);
};

export default Plot;
