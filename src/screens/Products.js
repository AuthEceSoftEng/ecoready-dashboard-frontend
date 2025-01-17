import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import { productsConfigs, organization } from "../config/ProductConfig.js";
import { getCustomDateTime, calculateDates, calculateDifferenceBetweenDates, debounce, findKeyByText } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { monthNames, europeanCountries, products } from "../utils/useful-constants.js";
// import { fetchCollections } from "../api/fetch-data.js";

// const metrics = fetchCollections(organization, "rice");
// console.log(metrics);
const customDate = getCustomDateTime(2024, 12);
const { year, month } = calculateDates(customDate);
console.log(year, month);

const ProductsScreen = () => {
	const [startDate, setStartDate] = useState("2024-01-01");
	const [endDate, setEndDate] = useState("2024-12-31");
	const [filters, setFilters] = useState({
		country: "Greece",
		product: "Rice",
		metric: "price",
	});

	const debouncedSetDate = useMemo(
		() => debounce((date, setter) => {
			const { currentDate } = calculateDates(date);
			setter(currentDate);
		}, 0),
		[],
	);

	const handleDateChange = useCallback((newValue, setter) => {
		if (!newValue?.$d) return;
		debouncedSetDate(newValue.$d, setter);
	}, [debouncedSetDate]);

	const dropdownContent = useMemo(() => ([
		{
			id: "country",
			items: europeanCountries,
			// multiple: true,
			onChange: (event) => setFilters((prev) => ({ ...prev, country: event.target.value })),
		},
		{
			id: "product",
			items: products,
			onChange: (event) => setFilters((prev) => ({ ...prev, product: event.target.value })),
		},
	].map((item) => ({
		...item,
		size: "small",
		width: "170px",
		height: "40px",
		color: "primary",
	}))), []);

	const dropdownValues = [[filters.country], filters.product];

	const keys = useMemo(() => ({
		country: findKeyByText(europeanCountries, filters.country),
		product: findKeyByText(products, filters.product),
	}), [filters.country, filters.product]);

	const formRefDate = useRef();

	const formContentDate = useMemo(() => [
		{
			customType: "date-range",
			id: "dateRange",
			width: "170px",
			type: "desktop",
			label: "",
			startValue: startDate,
			startLabel: "Start date",
			endValue: endDate,
			endLabel: "End date",
			background: "primary",
			labelSize: 12,
			onStartChange: (newValue) => handleDateChange(newValue, setStartDate),
			onEndChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [endDate, handleDateChange, startDate]);

	const dateMetrics = useMemo(() => {
		const isValid = startDate && endDate && new Date(startDate) <= new Date(endDate);
		return {
			isValidDateRange: isValid,
			...calculateDifferenceBetweenDates(startDate, endDate),
		};
	}, [startDate, endDate]);
	// const { collections } = getProductCollections(countryKey, productKey);
	const fetchConfigs = useMemo(
		() => (dateMetrics.isValidDateRange && filters.product
			? productsConfigs(keys.country, keys.product, startDate, endDate, customDate, dateMetrics.differenceInDays) : null),
		[dateMetrics.isValidDateRange, dateMetrics.differenceInDays, filters.product, keys.country, keys.product, startDate, endDate],
	);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	console.log(dataSets);
	const ricePrice = useMemo(() => dataSets?.metrics_rice_price || [], [dataSets]);
	const riceProduction = useMemo(() => dataSets?.metrics_rice_production || [], [dataSets]);
	const isValidPrice = useMemo(() => ricePrice.length > 0, [ricePrice]);
	const sumProduction = useMemo(() => {
		const milledRice = riceProduction[0]?.milled_rice_equivalent_quantity ?? 0;
		const riceHusk = riceProduction[0]?.rice_husk_quantity ?? 0;
		return milledRice + riceHusk;
	}, [riceProduction]);
	const unit = useMemo(() => ricePrice[0]?.unit || "", [ricePrice]);
	// const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);
	// const isValidData = useMemo(() => metrics.length > 0, [metrics]);

	// // Pre-compute data transformations
	// const chartData = useMemo(() => {
	// 	if (!isValidData) return [];
	// 	const timestamps = metrics.map((item) => item.timestamp);
	// 	return {
	// 		timestamps,
	// 		maxTemp: metrics.map((item) => item.max_temperature),
	// 		meanTemp: metrics.map((item) => item.mean_temperature),
	// 		minTemp: metrics.map((item) => item.min_temperature),
	// 		windSpeed: metrics.map((item) => item.wind_speed),
	// 		rain: metrics.map((item) => item.rain),
	// 	};
	// }, [metrics, isValidData]);

	const timelineOverview = useMemo(() => [
		{
			title: "Rice's Price Evolution",
			data: [
				{
					x: ricePrice.map((item) => item.timestamp) ?? [],
					y: ricePrice.map((item) => item.price) ?? [],
					type: "scatter",
					mode: "lines",
					color: "secondary",
					title: `€/${unit}`,
				},
			],
			xaxis: { title: "Date" },
			yaxis: { title: `Average Price per ${unit}` },
		},
	], [ricePrice, unit]);

	const generalOverview = useMemo(() => [
		{
			data: {
				value: dataSets?.stats_prices_current?.[0]?.avg_price ?? null,
				subtitle: `${monthNames[month].text}'s Average Price`,
			},
			color: "third",
			suffix: `€/${unit}`,
			shape: "angular",
		},
		{
			data: {
				value: dataSets?.stats_prices_historical?.[0]?.avg_price ?? null,
				subtitle: `${year}'s Average Price`,
			},
			color: "third",
			suffix: `€/${unit}`,
			shape: "angular",
		},
		{
			data: {
				value: sumProduction,
				subtitle: "Annual Production",
			},
			range: [0, 1_000_000],
			color: "primary",
			suffix: ` ${unit}s`,
			shape: "angular",
		},
		// {
		// 	data: {
		// 		value: dataSets?.meanSolarRadiation?.[0]?.avg_solar_radiation ?? null,
		// 		subtitle: "Average Solar Radiation",
		// 	},
		// 	range: [0, 20],
		// 	color: "goldenrod",
		// 	suffix: "W/m²",
		// 	shape: "bullet",
		// },
	], [dataSets?.stats_prices_current, dataSets?.stats_prices_historical, sumProduction, unit]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand
				dropdownContent={dropdownContent}
				value={dropdownValues}
				formRef={formRefDate}
				formContent={formContentDate}
			/>
			{dateMetrics.isValidDateRange ? (
				<>
					<Grid item xs={12} md={12} alignItems="center" flexDirection="column">
						<Card title="General Overview" footer={cardFooter({ minutesAgo })}>
							{isLoading ? (
								<LoadingIndicator />
							) : (
								<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
									{generalOverview.map((plotData, index) => (
										<Grid
											key={index}
											item
											xs={12}
											sm={12}
											md={plotData.shape === "bullet" ? 6 : 4}
											justifyContent="center"
											alignItems="center"
										>
											{plotData.data.value ? (
												<Plot
													showLegend
													scrollZoom
													height={plotData.shape === "bullet" ? "120px" : "200px"}
													data={[
														{
															type: "indicator",
															mode: "gauge+number",
															value: plotData.data.value,
															range: plotData.range ?? [0, 2000],
															color: plotData.color,
															shape: plotData.shape,
															indicator: "primary",
															textColor: "primary",
															suffix: plotData.suffix,
														},
													]}
													displayBar={false}
													title={plotData.data.subtitle}
												/>
											) : (<DataWarning />)}
										</Grid>
									))}
								</Grid>
							)}
						</Card>
					</Grid>
					{timelineOverview
						.map((card, index) => (
							<Grid key={index} item xs={12} sm={12} md={12} mb={1}>
								<Card title={card.title} footer={cardFooter({ minutesAgo })}>
									{isValidPrice
										? isLoading ? (<LoadingIndicator />
										) : (
											<Plot
												scrollZoom
												data={card.data}
												// showLegend={index === 0}
												height="300px"
												xaxis={card.xaxis}
												yaxis={card.yaxis}
											/>
										) : (<DataWarning />
										)}
								</Card>
							</Grid>
						))}
				</>
			) : (<DataWarning message="Please Select a Valid Date Range" />
			)}
		</Grid>
	);
};

export default memo(ProductsScreen);
