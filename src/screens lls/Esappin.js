import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Dropdown from "../components/Dropdown.js";
import useInit from "../utils/screen-init.js";
import DatePicker from "../components/DatePicker.js";
import esappinConfigs, { organization } from "../config/EsappinConfig.js";
import { getCustomDateTime } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter } from "../utils/card-footer.js";

const Esappin = () => {
	const customDate = useMemo(() => getCustomDateTime(2024, 11), []);

	const [month, setMonth] = useState(customDate.getMonth());

	const handleMonthChange = useCallback((newValue) => {
		setMonth(newValue.$M); // Select only the month from the resulting object
	}, []);

	const year = customDate.getFullYear();

	const [product, setProduct] = useState("Rapsfeld B1");
	const fetchConfigs = useMemo(
		() => esappinConfigs(product, monthNames[month].no),
		[product, month],
	);

	const dropdownContent = useMemo(() => [
		{
			id: "product",
			size: "small",
			width: "200px",
			height: "40px",
			color: "primary",
			label: "Product",
			items: [
				{ value: "Rapsfeld B1", text: "Rapsfeld B1" },
				{ value: "Rapsfeld B2", text: "Rapsfeld B2" },
				{ value: "Rapsfeld H1", text: "Rapsfeld H1" },
				{ value: "Rapsfeld H2", text: "Rapsfeld H2" },
				{ value: "Erdbeeren", text: "Erdbeeren" },
				{ value: "Gerstefeld G1", text: "Gerstefeld G1" },
			],
			defaultValue: "Rapsfeld B1",
			onChange: (event) => {
				setProduct(event.target.value);
			},

		},
	], []);

	const { state } = useInit(organization, fetchConfigs);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid container display="flex" direction="row" justifyContent="flex-end" alignItems="center" spacing={2} mt={2}>
				<Grid item sx={{ display: "flex", justifyContent: "flex-end" }} xs={6} md={2}>
					<Dropdown
						id={dropdownContent[0].id}
						value={product}
						placeholder={dropdownContent[0].label}
						items={dropdownContent[0].items}
						size={dropdownContent[0].size}
						width={dropdownContent[0].width}
						height={dropdownContent[0].height}
						background={dropdownContent[0].color}
						onChange={dropdownContent[0].onChange}
					/>
				</Grid>
				<Grid item sx={{ display: "flex", justifyContent: "flex-end" }} xs={6} md={2}>
					{/* Select only the month */}
					<DatePicker
						type="desktop"
						label="Month Picker"
						width="180px"
						views={["month"]}
						value={`${monthNames[month].text} ${year}`}
						onChange={handleMonthChange}
					/>
				</Grid>
			</Grid>
			{[
				{
					title: "Temperature Evolution Per Day",
					data: [
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.max_temperature) : [],
							type: "scatter",
							mode: "lines+markers",
							title: "Max",
							color: "primary",
						},
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.min_temperature) : [],
							type: "scatter",
							mode: "lines+markers",
							title: "Min",
							color: "third",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Temperature (°C)" },
				},
				{
					title: "Daily Precipitation Sum",
					data: [
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.precipitation_sum) : [],
							type: "bar",
							color: "third",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Precipitation (mm)" },
				},
				{
					title: "Shortwave Radiation Sum",
					data: [
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.shortwave_radiation_sum) : [],
							type: "bar",
							color: "goldenrod",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Radiation Metric" },
				},
			].map((card, index) => (
				<Grid key={index} item xs={12} sm={12} md={6}>
					<Card title={card.title} footer={cardFooter({ minutesAgo: state.minutesAgo })}>
						<Plot
							scrollZoom
							data={card.data}
							title={`${monthNames[month].text} ${year}`}
							showLegend={index === 0}
							height="300px"
							xaxis={card.xaxis}
							yaxis={card.yaxis}
						/>
					</Card>
				</Grid>
			))}
		</Grid>
	);
};

export default memo(Esappin);
