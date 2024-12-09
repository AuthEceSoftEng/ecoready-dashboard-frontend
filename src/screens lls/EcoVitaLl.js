import { Grid } from "@mui/material";
import { memo, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
// import Form from "../components/Form.js";
import { ecoVitallConfigs, randomDataRadial, organization } from "../config/EcoVitallConfig.js";
import { calculateDates, getCustomDateTime } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter, LoadingIndicator } from "../utils/rendering-items.js";

const EcoVItaLl = () => {
	const customDate = useMemo(() => getCustomDateTime(2024, 9), []);

	// Memoize the date calculations and fetchConfigs to reduce re-calculations
	const { month, currentDate, formattedBeginningOfMonth, formattedBeginningOfHour } = useMemo(
		() => calculateDates(customDate),
		[customDate],
	);

	const fetchConfigs = useMemo(
		() => ecoVitallConfigs(currentDate, formattedBeginningOfMonth, formattedBeginningOfHour),
		[currentDate, formattedBeginningOfMonth, formattedBeginningOfHour],
	);
	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2} sx={{ flexGrow: 1, flexBasis: "100%", flexShrink: 0 }}>
			{[
				{
					title: "Tank Monitoring",
					data: [
						{
							subtitle: "Tank Level",
							min: 0,
							max: 100,
							value: dataSets.gauges && dataSets.gauges.length > 0
								? dataSets.gauges.at(-1).nutrienttanklevel
								: null,
							symbol: "%",
						},
						{
							subtitle: "Pump Pressure",
							min: 0,
							max: 1.5,
							value: dataSets.gauges && dataSets.gauges.length > 0
								? dataSets.gauges.at(-1).pumppressure
								: null,
							symbol: "psi",
						},
					],
					color: "third",
				},
				{
					title: "Nutrient Monitoring",
					data: [
						{
							min: 0,
							max: 3.5,
							value: dataSets.gauges && dataSets.gauges.length > 0 ? dataSets.gauges.at(-1).ec : null,
							symbol: "mS",
							subtitle: "EC",
						},
						{
							min: 0,
							max: 10,
							value: dataSets.gauges && dataSets.gauges.length > 0 ? dataSets.gauges.at(-1).ph : null,
							symbol: "",
							subtitle: "Ph",
						},
					],
					color: "secondary",
				},
			].map((card, index) => (
				<Grid key={index} item xs={12} md={6} alignItems="center" flexDirection="column" mt={2} padding={0}>
					<Card title={card.title} footer={cardFooter({ minutesAgo })}>
						{isLoading ? (<LoadingIndicator />
						) : (
							<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
								{card.data.map((plotData, plotIndex) => (
									<Grid key={plotIndex} item xs={12} sm={12} md={6} justifyContent="flex-end" alignItems="center" sx={{ height: "200px" }}>

										<Plot
											showLegend
											scrollZoom
											// width="220px"
											data={[
												{
													type: "indicator",
													mode: "gauge+number",
													value: plotData.value,
													range: [plotData.min, plotData.max], // Gauge range
													color: card.color, // Color of gauge bar
													shape: "angular", // "angular" or "bullet"
													indicator: "primary", // Color of gauge indicator/value-line
													textColor: "primary", // Color of gauge value
													suffix: plotData.symbol, // Suffix of gauge value
												},
											]}
											displayBar={false}
											title={plotData.subtitle}
										/>
									</Grid>
								))}
							</Grid>
						)}
					</Card>
				</Grid>
			))}
			{[
				{
					title: "Temperature Evolution Per Day",
					data: [
						{
							x: dataSets.temperature
								? dataSets.temperature.map((item) => item.interval_start)
								: [],
							y: dataSets.temperature
								? dataSets.temperature
									.map((item) => item.avg_envtemp) : [],
							type: "bar",
							title: "Temperature",
							color: "secondary",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Temperature (°C)" },
				},
				{
					title: "Humidity Range Per Day",
					data: [
						{
							x: dataSets.humidity_max
								? dataSets.humidity_max.map((item) => item.interval_start)
								: [],
							y: dataSets.humidity_max
								? dataSets.humidity_max
									.map((item) => item.max_humidity) : [],
							type: "line",
							title: "Max",
							color: "primary",
						},
						{
							x: dataSets.humidity_min
								? dataSets.humidity_min.map((item) => item.interval_start)
								: [],
							y: dataSets.humidity_min
								? dataSets.humidity_min
									.map((item) => item.min_humidity) : [],
							type: "line",
							title: "Min",
							color: "third",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Humidity (%)" },
				},
			].map((card, index) => (
				<Grid key={index} item xs={12} sm={12} md={6} mt={2}>
					<Card title={card.title} footer={cardFooter({ minutesAgo })}>
						{isLoading ? (<LoadingIndicator />
						) : (
							<Plot
								scrollZoom
								height="250px"
								data={card.data}
								title={monthNames[month].text}
								showLegend={index === 1}
								xaxis={card.xaxis}
								yaxis={card.yaxis}
							/>
						)}
					</Card>
				</Grid>
			))}
			<Grid item xs={12} md={12} mt={2}>
				<Card
					title={`${monthNames[month].text}'s Targets`}
					footer={cardFooter({ minutesAgo })}
				>
					{isLoading ? (<LoadingIndicator />
					) : (
						[
							{
								min: 0,
								max: 14,
								value: dataSets.ph_avg && dataSets.ph_avg.length > 0 ? dataSets.ph_avg[0].avg_ph : null,
								symbol: "",
								title: "pH",
							},
							{
								min: 0,
								max: 5,
								value: dataSets.ec_avg && dataSets.ec_avg.length > 0 ? dataSets.ec_avg[0].avg_ec : null,
								symbol: "",
								title: "EC",
							},
						].map((plot, index) => (
							<Grid key={index} item xs={12} sm={12} md={12} justifyContent="flex-end" alignItems="center" sx={{ height: "200px" }}>
								<Plot
									showLegend
									scrollZoom
									// width="113%"
									height="120px"
									data={[
										{
											type: "indicator",
											mode: "gauge+number",
											value: plot.value,
											range: [plot.min, plot.max], // Gauge range
											color: "third", // Color of gauge bar
											shape: "bullet", // "angular" or "bullet"
											indicator: "primary", // Color of gauge indicator/value-line
											textColor: "primary", // Color of gauge value
											suffix: plot.symbol, // Suffix of gauge value
										},
									]}
									displayBar={false}
									title={plot.title}
									margin={{ r: 0 }}
								/>
							</Grid>
						))
					)}
				</Card>
			</Grid>
			<Grid item xs={12} md={12} mt={2}>
				<Card
					title="Sensory Analysis of Leafy Greens"
					footer={cardFooter({ minutesAgo })}
				>
					{isLoading ? (<LoadingIndicator />
					) : (
						<Plot
							showLegend
							scrollZoom
							data={Object.keys(randomDataRadial).map((key, ind) => ({
								type: "scatterpolar",
								r: Object.values(randomDataRadial[key]),
								theta: Object.keys(randomDataRadial[key]),
								fill: "toself",
								color: ["primary", "secondary", "third"][ind],
								title: key,
							}))}
							polarRange={[0, 1]}
							displayBar={false}
						/>
					)}
				</Card>
			</Grid>
		</Grid>
	);
};

export default memo(EcoVItaLl);
