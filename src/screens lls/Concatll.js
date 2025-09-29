import { Grid, Typography } from "@mui/material";
import { memo, useRef, useMemo, useState, useCallback } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import Footer from "../components/Footer.js";
import { organization, sites, getTimelineConfigs, getLocationProductionConfigs, getVarCodeGroupedConfigs } from "../config/ConcatConfig.js";
import { debounce, calculateDates } from "../utils/data-handling-functions.js";
import { cardFooter, StickyBand, LoadingIndicator, DataWarning } from "../utils/rendering-items.js";

const currentYear = new Date().getFullYear();
const weatherMetricList = {
	Temperature: { attribute: ["t_max", "t_avg", "t_min"], yaxis: "Temperature (°C)" },
	Precipitation: { attribute: "p", yaxis: "Precipitation (mm)" },
	"Solar Radiation": { attribute: "sr", yaxis: "Solar Radiation (W/m²)" },
};

const wheatMetricList = {
	Yield: { attribute: "yield_value", yaxis: "Yield (kg/ha)", stat: "sum", color: "secondary" },
	Height: { attribute: "height", yaxis: "Height (cm)", stat: "avg", color: "primary" },
	"Hectolitre Weight": { attribute: "hlw", yaxis: "HLW (kg/hl)", stat: "sum", color: "third" },
	"Thousand Kernel Weight": { attribute: "tkw", yaxis: "TKW (g)", stat: "avg", color: "goldenrod" },
	"Grain Number": { attribute: "ng", yaxis: "Grain Number per m²", stat: "avg", color: "success" },
};

const CONCATLL = () => {
	const [location1, setLocation1] = useState("La Tallada");
	const [location2, setLocation2] = useState("La Tallada");
	const [location3, setLocation3] = useState("La Tallada");
	const [weatherMetric, setWeatherMetric] = useState("Temperature");
	const [wheatMetric1, setWheatMetric1] = useState("Yield");
	const [wheatMetric2, setWheatMetric2] = useState("Yield");
	const [year, setYear] = useState(currentYear);
	const [startDate, setStartDate] = useState("2014-01-01");
	const [endDate, setEndDate] = useState("2015-01-01");

	const debouncedSetDate = useMemo(
		() => debounce((date, setter) => {
			const { currentDate } = calculateDates(date);
			setter(currentDate);
		}, 2000),
		[],
	);

	const handleDateChange = useCallback((newValue, setter) => {
		if (!newValue?.$d) return;

		// Immediate visual feedback
		setter(newValue.$d);
		debouncedSetDate(newValue.$d, setter);
	}, [debouncedSetDate]);

	const handleYearChange = useCallback((newValue) => {
		setYear(newValue.$y);
	}, []);

	const dropdownContent1 = useMemo(() => [
		{
			id: "location1",
			size: "small",
			label: "Select Location",
			items: sites,
			value: location1,
			onChange: (event) => setLocation1(event.target.value),
		},
		{
			id: "wheat-metric1",
			size: "small",
			label: "Select Metric",
			items: Object.keys(wheatMetricList).map((key) => ({ value: key, text: key })),
			value: wheatMetric1,
			onChange: (event) => setWheatMetric1(event.target.value),
		},
	], [location1, wheatMetric1]);

	const dropdownContent2 = useMemo(() => [
		{
			id: "location2",
			size: "small",
			label: "Select Location",
			items: sites,
			value: location2,
			onChange: (event) => setLocation2(event.target.value),
		},
		{
			id: "weather",
			size: "small",
			label: "Select Metric",
			items: Object.keys(weatherMetricList).map((key) => ({ value: key, text: key })),
			value: weatherMetric,
			onChange: (event) => setWeatherMetric(event.target.value),
		},
	], [location2, weatherMetric]);

	const dropdownContent3 = useMemo(() => [
		{
			id: "location3",
			size: "small",
			label: "Select Location",
			items: sites,
			value: location3,
			onChange: (event) => setLocation3(event.target.value),
		},
		{
			id: "wheat-metric2",
			size: "small",
			label: "Select Metric",
			items: Object.keys(wheatMetricList).map((key) => ({ value: key, text: key })),
			value: wheatMetric2,
			onChange: (event) => setWheatMetric2(event.target.value),
		},
	], [location3, wheatMetric2]);

	const formRefDateRange = useRef();
	const formContentDateRange = useMemo(() => [
		{
			customType: "date-range",
			startValue: startDate,
			startLabel: "Start date",
			endValue: endDate,
			endLabel: "End date",
			labelSize: 12,
			minDate: new Date("2007-01-01"),
			maxDate: new Date(`${currentYear}-01-01`),
			onStartChange: (newValue) => handleDateChange(newValue, setStartDate),
			onEndChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [startDate, endDate, handleDateChange]);

	const formRefDate = useRef();

	const formContentDate = useMemo(() => [
		{
			customType: "date-picker",
			id: "yearPicker",
			width: "170px",
			sublabel: "Select Year",
			views: ["year"],
			value: year,
			minDate: new Date("2007-01-01"),
			maxDate: new Date(`${year}-12-31`),
			labelSize: 12,
			onChange: handleYearChange,
		},
	], [handleYearChange, year]);

	// Independent fetch configs for each graph
	const fetchLocationProductionConfigs = useMemo(() => (getLocationProductionConfigs(location1)), [location1]);
	const fetchTimelineConfigs = useMemo(() => (getTimelineConfigs(location2, startDate, endDate)), [endDate, location2, startDate]);
	const fetchVarCodeGroupedConfigs = useMemo(() => (getVarCodeGroupedConfigs(location3, year)), [location3, year]);

	// Independent useInit hooks for each graph
	const productionState = useInit(organization, fetchLocationProductionConfigs);
	const weatherState = useInit(organization, fetchTimelineConfigs);
	const varietyState = useInit(organization, fetchVarCodeGroupedConfigs);

	// Extract data from each state
	const { isLoading: isLoadingProduction, dataSets: productionDataSets, minutesAgo: productionMinutesAgo } = productionState.state;
	const { isLoading: isLoadingWeather, dataSets: weatherDataSets, minutesAgo: weatherMinutesAgo } = weatherState.state;
	const { isLoading: isLoadingVariety, dataSets: varietyDataSets, minutesAgo: varietyMinutesAgo } = varietyState.state;

	// Weather data processing (using weatherDataSets instead of dataSets)
	const metrics = useMemo(() => weatherDataSets?.metrics || [], [weatherDataSets]);
	const isValidWeatherData = useMemo(() => metrics.length > 0, [metrics]);

	const weatherData = useMemo(() => {
		if (!isValidWeatherData) return [];

		if (weatherMetric === "Temperature") {
			return [
				{
					title: "Temperature Evolution Per Day",
					data: [
						{
							x: metrics.map((item) => item.timestamp),
							y: metrics.map((item) => item.t_avg),
							type: "scatter",
							mode: "lines",
							name: "Average Temperature",
							color: "secondary",
						},
						{
							x: metrics.map((item) => item.timestamp),
							y: metrics.map((item) => item.t_max),
							type: "scatter",
							mode: "lines",
							name: "Maximum Temperature",
							color: "primary",
						},
						{
							x: metrics.map((item) => item.timestamp),
							y: metrics.map((item) => item.t_min),
							type: "scatter",
							mode: "lines",
							name: "Minimum Temperature",
							color: "third",
						},
					],
					showLegend: false,
					yaxis: { title: weatherMetricList[weatherMetric].yaxis },
				},
			];
		}

		// For other metrics (Precipitation, Solar Radiation)
		const attribute = weatherMetricList[weatherMetric].attribute;
		return [
			{
				title: `${weatherMetric} Evolution Per Day`,
				data: [
					{
						x: metrics.map((item) => item.timestamp),
						y: metrics.map((item) => item[attribute]),
						type: "scatter",
						mode: "lines",
						name: weatherMetric,
						color: weatherMetric === "Precipitation" ? "third" : "goldenrod",
					},
				],
				yaxis: { title: weatherMetricList[weatherMetric].yaxis },
			},
		];
	}, [metrics, weatherMetric, isValidWeatherData]);

	// Production data processing
	const productionMetrics = useMemo(() => productionDataSets || {}, [productionDataSets]);
	const isValidProductionData = useMemo(() => {
		const metric = wheatMetricList[wheatMetric1];
		const dataKey = `${metric.attribute}_${location1}`;
		return productionMetrics[dataKey] && productionMetrics[dataKey].length > 0;
	}, [productionMetrics, wheatMetric1, location1]);

	// Variety data processing
	const varietyMetrics = useMemo(() => varietyDataSets || {}, [varietyDataSets]);
	const isValidVarietyData = useMemo(() => {
		const metric = wheatMetricList[wheatMetric2];
		const dataKey = `${metric.attribute}_per_product_${location3}`;
		return varietyMetrics[dataKey] && varietyMetrics[dataKey].length > 0;
	}, [varietyMetrics, wheatMetric2, location3]);

	const productionData = useMemo(() => {
		if (!isValidProductionData) return [];

		const metric = wheatMetricList[wheatMetric1];
		const dataKey = `${metric.attribute}_${location1}`;
		const data = productionMetrics[dataKey] || [];

		// Extract the stat type for the key name (e.g., "sum_yield_value", "avg_height")
		const statKey = `${metric.stat}_${metric.attribute}`;

		return [
			{
				title: `${wheatMetric1} Per Year - ${location1}`,
				data: [
					{
						x: data.map((item) => {
							// Extract year from interval_start
							const date = new Date(item.interval_start);
							return date.getFullYear();
						}),
						y: data.map((item) => item[statKey] || 0),
						type: "box",
						name: wheatMetric1,
						color: metric.color,
					},
				],
				showLegend: false,
				xaxis: { title: "Year" },
				yaxis: { title: metric.yaxis },
			},
		];
	}, [isValidProductionData, productionMetrics, wheatMetric1, location1]);

	const varietyData = useMemo(() => {
		if (!isValidVarietyData) return [];

		const metric = wheatMetricList[wheatMetric2];
		const dataKey = `${metric.attribute}_per_product_${location3}`;
		const data = varietyMetrics[dataKey] || [];

		// Extract the stat type for the key name
		const statKey = `${metric.stat}_${metric.attribute}`;

		return [
			{
				title: `${wheatMetric2} Per Variety - ${location3}`,
				data: [
					{
						x: data.map((item) => item.var_code || item.variety || "Unknown"),
						y: data.map((item) => item[statKey] || 0),
						type: "bar",
						name: wheatMetric2,
						color: metric.color,
					},
				],
				showLegend: false,
				xaxis: { title: "Variety Code" },
				yaxis: { title: metric.yaxis },
			},
		];
	}, [isValidVarietyData, varietyMetrics, wheatMetric2, location3]);

	// = ============== RENDERING ===============

	return (
		<Grid container spacing={2} justifyContent="center" alignItems="center">
			<Grid item xs={12} sm={12} md={12}>
				<Card title={`${wheatMetric1} Per Year - ${location1}`} footer={cardFooter({ minutesAgo: productionMinutesAgo })}>
					<StickyBand sticky={false} dropdownContent={dropdownContent1} />
					{isLoadingProduction ? (
						<LoadingIndicator />
					) : (
						isValidProductionData ? productionData.map((chart, index) => (
							<Plot
								key={index}
								scrollZoom
								height="400px"
								data={chart.data}
								title={chart.title}
								showLegend={chart.showLegend}
								yaxis={chart.yaxis}
								layout={{ yaxis: { automargin: true } }}
							/>
						)) : (<DataWarning message={`No ${wheatMetric1.toLowerCase()} data available for ${location1}.`} />
						)
					)}
				</Card>
			</Grid>
			<Grid item xs={12} sm={12} md={12}>
				<Card title="Weather Metrics" footer={cardFooter({ minutesAgo: weatherMinutesAgo })}>
					<StickyBand
						sticky={false}
						dropdownContent={dropdownContent2}
						formRef={formRefDateRange}
						formContent={formContentDateRange}
					/>
					{isLoadingWeather ? (
						<LoadingIndicator />
					) : (
						isValidWeatherData ? weatherData.map((chart, index) => (
							<Plot
								key={index}
								scrollZoom
								height="400px"
								data={chart.data}
								title={chart.title}
								showLegend={chart.showLegend}
								yaxis={chart.yaxis}
							/>
						)) : (<DataWarning message="No weather data available for the selected options." />
						)
					)}
				</Card>
			</Grid>
			<Grid item xs={12} sm={12} md={12}>
				<Card title={`${wheatMetric2} Per Variety - ${location3}`} footer={cardFooter({ minutesAgo: varietyMinutesAgo })}>
					<StickyBand
						sticky={false}
						dropdownContent={dropdownContent3}
						formRef={formRefDate}
						formContent={formContentDate}
					/>
					{isLoadingVariety ? (
						<LoadingIndicator />
					) : (
						isValidVarietyData ? varietyData.map((chart, index) => (
							<Plot
								key={index}
								scrollZoom
								height="400px"
								data={chart.data}
								title={chart.title}
								showLegend={chart.showLegend}
								xaxis={chart.xaxis}
								yaxis={chart.yaxis}
							/>
						)) : (<DataWarning message={`No ${wheatMetric2.toLowerCase()} data available for ${location3}.`} />
						)
					)}
				</Card>
			</Grid>
			<Footer
				sticky
				customImages={[
					{
						src: "../ll_images/CONCATLL.png",
						alt: "CONCATLL Logo",
						link: { url: "https://www.irta.cat/en/noticia/concat-ll-project-starts-development-phase/", target: "_blank", rel: "noopener" },
					},
					{
						src: "../ll_images/IRTA.png",
						alt: "IRTA Logo",
						link: { url: "https://www.irta.cat/en/", target: "_blank", rel: "noopener" },
					},

				]}
				customMessage={(
					<>
						<Typography component="span" sx={{ fontWeight: "bold", fontSize: "0.975rem" }}>
							{"Disclaimer:"}
						</Typography>
						{" "}
						{"These materials have been generated using the CONCAT Wheat Production Dataset developed by IRTA. Each wheat variety has been anonymized using a unique numerical identifier. Users requiring the actual variety names may request this information from the dataset authors (marta.dasilva@irta.cat)."}
						<br />
					</>
				)}
				showDefaultCopyright={false}
			/>
		</Grid>
	);
};

export default memo(CONCATLL);
