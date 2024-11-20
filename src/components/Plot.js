import Plotly from "react-plotly.js";

import colors from "../_colors.scss";

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
	xaxis = {},
	yaxis = {},
}) => (
	<Plotly
		useResizeHandler // Enable resize handler
		data={data.map((d) => ({
			x: d.x,
			y: d.y,
			z: d.z,
			type: d.type,
			name: d.title,
			text: d.texts,
			mode: d.mode,
			marker: { color: colors?.[d?.color] || d?.color },
			values: d.values,
			value: d.value,
			r: d.r,
			theta: d.theta,
			fill: d.fill,
			number: { suffix: d.suffix, font: { color: colors?.[d?.textColor] || d?.textColor || "black" } },
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

export default Plot;
