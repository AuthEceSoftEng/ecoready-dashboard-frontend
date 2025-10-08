import { Grid } from "@mui/material";
import { memo, useMemo, useRef, useState, useCallback } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import StickyBand from "../components/StickyBand.js";
import { ecoVitallConfigs, randomDataRadial, organization } from "../config/EcoVitallConfig.js";
import { calculateDates, getCustomDateTime, debounce, isValidArray } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter, LoadingIndicator } from "../utils/rendering-items.js";

const PRODUCTS = [
	{ value: "microgreens", text: "Microgreens" },
	{ value: "babyleaf", text: "Baby Leaf" },
	{ value: "lettucehead", text: "Lettuce Head" },
];

const EcoVItaLl = () => {
	const [dateRange, setDateRange] = useState(() => getCustomDateTime(2024, 9), []);

	const { month, currentDate, formattedBeginningOfMonth, formattedBeginningOfHour } = useMemo(
		() => calculateDates(dateRange),
		[dateRange],
	);

	const debouncedSetMonth = useMemo(
		() => debounce((date, setter) => {
			setter(date);
		}, 100),
		[],
	);

	const handleMonthChange = useCallback((newValue) => {
		if (!newValue?.$d) return;

		const newMonth = newValue.$d.getMonth();

		debouncedSetMonth(newMonth, setDateRange);
	}, [debouncedSetMonth]);

	const formRefDate = useRef();
	const formContentDate = useMemo(() => [
		{
			customType: "date-picker",
			id: "monthPicker",
			type: "desktop",
			sublabel: "Select Month",
			views: ["month", "year"],
			minDate: new Date(2024, 8, 1),
			maxDate: new Date(2024, 8, 30),
			value: "2024-09-01",
			labelSize: 12,
			onChange: handleMonthChange,
		},
	], [handleMonthChange]);

	const fetchConfigs = useMemo(
		() => ecoVitallConfigs(currentDate, formattedBeginningOfMonth, formattedBeginningOfHour),
		[currentDate, formattedBeginningOfMonth, formattedBeginningOfHour],
	);
	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;

	const gaugeData = useMemo(() => [
		{
			title: "Tank Monitoring",
			data: [
				{
					subtitle: "Tank Level",
					min: 0,
					max: 100,
					value: dataSets.gauges?.at(-1)?.nutrienttanklevel ?? null,
					symbol: "%",
				},
				{
					subtitle: "Pump Pressure",
					min: 0,
					max: 1.5,
					value: dataSets.gauges?.at(-1)?.pumppressure ?? null,
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
					value: dataSets.gauges?.at(-1)?.ec ?? null,
					symbol: "mS",
					subtitle: "EC",
				},
				{
					min: 0,
					max: 10,
					value: dataSets.gauges?.at(-1)?.ph ?? null,
					symbol: "",
					subtitle: "Ph",
				},
			],
			color: "secondary",
		},
	], [dataSets.gauges]);

	const dailyData = useMemo(() => [
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
			yaxis: { title: "Humidity (%)" },
		},
	], [dataSets.temperature, dataSets.humidity_max, dataSets.humidity_min]);

	const bulletData = useMemo(() => [
		{
			min: 0,
			max: 14,
			value: isValidArray(dataSets.ph_avg) ? dataSets.ph_avg[0].avg_ph : null,
			symbol: "",
			title: "pH",
		},
		{
			min: 0,
			max: 5,
			value: isValidArray(dataSets.ec_avg) ? dataSets.ec_avg[0].avg_ec : null,
			symbol: "",
			title: "EC",
		},
	], [dataSets.ph_avg, dataSets.ec_avg]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2} sx={{ flexGrow: 1, flexBasis: "100%", flexShrink: 0 }}>
			<StickyBand formRef={formRefDate} formContent={formContentDate} />
			{gaugeData.map((card, index) => (
				<Grid key={index} item xs={12} md={6} alignItems="center" flexDirection="column">
					<Card title={card.title} footer={cardFooter({ minutesAgo })}>
						{isLoading ? (<LoadingIndicator />
						) : (
							<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
								{card.data.map((plotData, plotIndex) => (
									<Grid key={plotIndex} item xs={12} sm={12} md={6} justifyContent="flex-end" alignItems="center" sx={{ height: "200px" }}>
										<Plot
											showLegend
											scrollZoom
											data={[
												{
													type: "indicator",
													mode: "gauge+number",
													value: plotData.value,
													range: [plotData.min, plotData.max],
													color: card.color,
													shape: "angular",
													indicator: "primary",
													textColor: "primary",
													suffix: plotData.symbol,
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
			{dailyData.map((card, index) => (
				<Grid key={index} item xs={12} sm={12} md={6} mb={index === dailyData.length - 1 ? 1 : 0}>
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
			<Grid item xs={12} md={12}>
				<Card
					title={`${monthNames[month].text}'s Targets`}
					footer={cardFooter({ minutesAgo })}
				>
					{isLoading ? (<LoadingIndicator />
					) : (
						bulletData.map((plot, index) => (
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
											range: [plot.min, plot.max],
											color: "third",
											shape: "bullet",
											indicator: "primary",
											textColor: "primary",
											suffix: plot.symbol,
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
			<Grid item xs={12} md={12} mb={1}>
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
