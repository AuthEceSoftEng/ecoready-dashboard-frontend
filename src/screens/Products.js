import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import { productsConfigs, organization } from "../config/ProductConfig.js";
import { getCustomDateTime, calculateDates, calculateDifferenceBetweenDates, debounce, findKeyByText, isValidArray } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { monthNames, europeanCountries, products } from "../utils/useful-constants.js";
// import { fetchCollections } from "../api/fetch-data.js";

// const metrics = fetchCollections(organization, "rice");
// console.log(metrics);
const unit = "t";
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
		() => (dateMetrics.isValidDateRange && keys.product
			? productsConfigs(keys.country, keys.product, startDate, endDate, customDate, dateMetrics.differenceInDays) : null),
		[dateMetrics.isValidDateRange, dateMetrics.differenceInDays, keys.product, keys.country, startDate, endDate],
	);
	console.log(keys.country);

	const { state, dispatch } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	console.log(dataSets);

	const ricePrice = useMemo(() => dataSets?.pricesTimeline || [], [dataSets]);
	const isValidPrice = useMemo(() => ricePrice.length > 0, [ricePrice]);
	console.log(isValidPrice);
	const riceProduction1 = useMemo(() => dataSets?.riceProd1 || [], [dataSets]);
	const riceProduction2 = useMemo(() => dataSets?.riceProd2 || [], [dataSets]);

	const production = useMemo(() => riceProduction1.map((milledEntry) => {
		// Find matching husk entry
		const huskEntry = riceProduction2.find((h) => h.key === milledEntry.key);

		return {
			key: milledEntry.key,
			timestamp: milledEntry.interval_start,
			total_production: (
				milledEntry.sum_milled_rice_equivalent_quantity
								+ (huskEntry?.sum_rice_husk_quantity || 0)
			),
		};
	}), [riceProduction1, riceProduction2]);

	// const unit = useMemo(() => ricePrice[0]?.unit || "", [ricePrice]);
	const dropdownContent = useMemo(() => ([
		{
			id: "country",
			items: europeanCountries,
			onChange: (event) => {
				dispatch({ type: "FETCH_START" }); // Add loading state
				setFilters((prev) => ({ ...prev, country: event.target.value }));
			},
		},
		{
			id: "product",
			items: products,
			onChange: (event) => {
				dispatch({ type: "FETCH_START" }); // Add loading state
				setFilters((prev) => ({ ...prev, product: event.target.value }));
			},
		},
	].map((item) => ({
		...item,
		size: "small",
		width: "170px",
		height: "40px",
		color: "primary",
	}))), [dispatch]);

	const timelineOverview = useMemo(() => [
		{
			title: `${filters.product}'s Price Timeline`,
			data: [
				{
					x: isValidPrice ? ricePrice.map((item) => item.interval_start) : [],
					y: isValidPrice ? ricePrice.map((item) => item.avg_price) : [],
					type: "scatter",
					mode: "lines",
					color: "secondary",
					title: `€/${unit}`,
				},
			],
			xaxis: { title: "Date" },
			yaxis: { title: `Average Price per ${unit}` },
		},
	], [filters.product, isValidPrice, ricePrice]);

	const europeOverview = useMemo(() => [
		{
			data: {
				value: production.find(
					(country) => country.key === "EU",
				)?.total_production ?? null,
				subtitle: "EU's Annual Production",
			},
			color: "third",
			suffix: ` ${unit}s`,
			shape: "bullet",
		},
		{
			data: isValidArray(production)
				? [
					{
						labels: production.filter(
							(item) => item.key !== "EU",
						).map((item) => {
							const countryName = europeanCountries.find((country) => country.value === item.key);
							return countryName ? countryName.text : item.key;
						}),
						values: production.filter(
							(item) => item.key !== "EU",
						).map((item) => item.total_production),
						type: "pie",
					},
				] : [{ labels: [], values: [], type: "pie" }],
		},
	], [production]);

	const countryOverview = useMemo(() => [
		{
			data: {
				value: production.find(
					(stat) => stat.key === keys.country,
				)?.total_production ?? null,
				subtitle: "Annual Production",
			},
			range: [0, 1_000_000],
			color: "primary",
			suffix: ` ${unit}s`,
			shape: "angular",
		},
		{
			data: {
				value: dataSets?.periodPrices?.[0]?.avg_price ?? null,
				subtitle: "Specified Period's Average Price",
			},
			color: "third",
			suffix: `€/${unit}`,
			shape: "angular",
		},
		{
			data: {
				value: dataSets?.monthlyPrices?.[0]?.avg_price ?? null,
				subtitle: `${monthNames[month].text}'s Average Price`,
			},
			color: "third",
			suffix: `€/${unit}`,
			shape: "angular",
		},
	], [dataSets?.monthlyPrices, dataSets?.periodPrices, keys.country, production]);

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
						<Card title="EU's Annual Overview" footer={cardFooter({ minutesAgo })}>
							{isLoading ? (
								<LoadingIndicator />
							) : (
								<Grid container display="flex" direction="column" justifyContent="space-evenly" padding={0} spacing={1}>
									<Grid
										item
										xs={12}
										sm={12}
										md={europeOverview[0].shape === "bullet" ? 6 : 4}
										justifyContent="center"
										alignItems="center"
									>
										{europeOverview[0].data.value ? (
											<Plot
												showLegend
												scrollZoom
												height={europeOverview[0].shape === "bullet" ? "120px" : "200px"}
												data={[
													{
														type: "indicator",
														mode: "gauge+number",
														value: europeOverview[0].data.value,
														range: europeOverview[0].range ?? [0, 5_000_000],
														color: europeOverview[0].color,
														shape: europeOverview[0].shape,
														indicator: "primary",
														textColor: "primary",
														suffix: europeOverview[0].suffix,
													},
												]}
												displayBar={false}
												title={europeOverview[0].data?.subtitle}
											/>
										) : (<DataWarning />)}
									</Grid>
									<Grid
										item
										xs={12}
										sm={12}
										md={4}
										justifyContent="center"
										alignItems="center"
									>
										{europeOverview[1].data.values ? (
											<Plot
												showLegend
												scrollZoom
												height="400px"
												data={europeOverview[1].data}
												displayBar={false}
												title="Annual Production by Country"
											/>
										) : (<DataWarning />)}
									</Grid>
								</Grid>
							)}
						</Card>
					</Grid>
					<Grid item xs={12} md={12} alignItems="center" flexDirection="column">
						<Card title={`${filters.product} in ${filters.country}`} footer={cardFooter({ minutesAgo })}>
							{isLoading ? (
								<LoadingIndicator />
							) : (
								<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
									{countryOverview.map((plotData, index) => (
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
													title={plotData.data?.subtitle}
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
