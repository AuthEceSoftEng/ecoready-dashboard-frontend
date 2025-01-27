import { useLocation } from "react-router-dom";
import { Grid } from "@mui/material";
import React, { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import colors from "../_colors.scss";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import DatePicker from "../components/DatePicker.js";
import useInit from "../utils/screen-init.js";
import { getPriceConfigs, getMonthlyPriceConfigs, getProductionConfigs, organization } from "../config/ProductConfig.js";
import { getCustomDateTime, calculateDates, calculateDifferenceBetweenDates,
	debounce, findKeyByText, isValidArray, generateYearsArray, groupByKey } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { europeanCountries, products } from "../utils/useful-constants.js";
// import { fetchCollections } from "../api/fetch-data.js";

// const metrics = fetchCollections(organization, "rice");
const customDate = getCustomDateTime(2024, 12);
const { year } = calculateDates(customDate);

const agriColors = [
	colors.ag1, colors.ag2, colors.ag3, colors.ag4, colors.ag5,
	colors.ag6, colors.ag7, colors.ag8, colors.ag9, colors.ag10,
	colors.ag11, colors.ag12, colors.ag13, colors.ag14, colors.ag15,
	colors.ag16, colors.ag17, colors.ag18, colors.ag19, colors.ag20,
];
const agColorKeys = Array.from({ length: 20 }, (_, i) => `ag${i + 1}`);

const transformProductionData = (productionData, yearPicker, sumFieldName) => {
	const timestamp = `${yearPicker}-01-01T00:00:00`;
	console.log("Debug - Input:", {
		productionData,
		yearPicker,
		sumFieldName,
		timestamp,
	});

	const euData = productionData.EU?.find(
		(item) => item.timestamp === timestamp,
	)?.[sumFieldName] || 0;
	console.log("Debug - EU data:", euData);

	const countryData = Object.keys(productionData)
		.filter((countryName) => countryName !== "EU")
		.map((countryName) => {
			const countryArray = productionData[countryName] || [];
			console.log("Debug - Country Array:", {
				countryName,
				arrayLength: countryArray.length,
				firstItem: countryArray[0],
			});

			const matchingData = countryArray.find(
				(item) => item.interval_start === timestamp,
			);
			console.log("Debug - Matching Data:", {
				countryName,
				matchingData,
				sumValue: matchingData?.[sumFieldName],
			});

			return {
				label: countryName,
				production: matchingData?.[sumFieldName] || 0,
			};
		})
		.filter((item) => item.production > 0)
		.sort((a, b) => a.label.localeCompare(b.label));

	console.log("Debug - Final countryData:", countryData);

	return {
		euProduction: euData,
		countryData,
	};
};

const ProductsScreen = () => {
	const location = useLocation();
	const selectedProduct = location.state?.selectedProduct;
	const [startDate, setStartDate] = useState("2024-01-01");
	const [endDate, setEndDate] = useState("2024-12-31");

	const [filters, setFilters] = useState({
		year: "2024",
		country: "Greece",
		product: selectedProduct || "Rice",
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

	const keys = useMemo(() => ({
		country: findKeyByText(europeanCountries, filters.country),
		product: findKeyByText(products, filters.product),
	}), [filters.country, filters.product]);

	const dateMetrics = useMemo(() => {
		const isValid = startDate && endDate && new Date(startDate) <= new Date(endDate);
		return {
			isValidDateRange: isValid,
			...calculateDifferenceBetweenDates(startDate, endDate),
		};
	}, [startDate, endDate]);
	const priceConfigs = useMemo(
		() => (dateMetrics.isValidDateRange && keys.product
			? getPriceConfigs(keys.country, keys.product, startDate, endDate, dateMetrics.differenceInDays)
			: null),
		[dateMetrics.isValidDateRange, dateMetrics.differenceInDays, keys.product, keys.country, startDate, endDate],
	);

	const monthlyPriceConfigs = useMemo(
		() => (keys.product
			? getMonthlyPriceConfigs(keys.country, keys.product, customDate)
			: null),
		[keys.product, keys.country],
	);

	const productionConfigs = useMemo(
		() => (keys.product
			? getProductionConfigs(keys.product)
			: null),
		[keys.product],
	);

	// Combine configs when needed
	const allConfigs = useMemo(
		() => {
			const configs = [];
			if (priceConfigs) configs.push(...priceConfigs);
			if (monthlyPriceConfigs) configs.push(...monthlyPriceConfigs);
			if (productionConfigs) configs.push(...productionConfigs);
			return configs;
		},
		[priceConfigs, monthlyPriceConfigs, productionConfigs],
	);

	const { state, dispatch } = useInit(organization, allConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	console.log(dataSets);

	const pricesTimeline = useMemo(() => dataSets?.pricesTimeline || [], [dataSets]);
	const periodPrices = useMemo(() => dataSets?.periodPrices || [], [dataSets]);
	const monthlyPrices = useMemo(() => dataSets?.monthlyPrices || [], [dataSets]);
	const isValidPrice = useMemo(() => isValidArray(pricesTimeline), [pricesTimeline]);
	const unit = useMemo(() => dataSets?.unit || [], [dataSets]);

	const production = useMemo(() => {
		if (!dataSets) return [];

		// Get all productProduction keys
		const productionKeys = Object.keys(dataSets).filter((key) => key.startsWith("productProduction"));

		// Map each key to its array
		return productionKeys.map((key) => dataSets[key] || []);
	}, [dataSets]);
	// console.log("Combined Production Data:", production);

	const productionByCountry = useMemo(() => production.map((productionData) => {
		const grouped = groupByKey(productionData, "key");

		// Filter out EU and transform codes to names
		const result = Object.keys(grouped)
			.filter((code) => code !== "EU")
			.reduce((acc, countryCode) => {
				const countryName = europeanCountries.find((country) => country.value === countryCode)?.text;
				if (countryName) {
					acc[countryName] = grouped[countryCode];
				}

				return acc;
			}, {});

		// Sort by country names
		const sortedResult = Object.keys(result)
			.sort((a, b) => a.localeCompare(b))
			.reduce((acc, countryName) => {
				acc[countryName] = result[countryName];
				return acc;
			}, {});

		return sortedResult;
	}), [production]);
	console.log("Production by Country:", productionByCountry);

	const productionTypes = useMemo(() => productionByCountry.map((productionData) => {
		const firstCountryData = Object.values(productionData)[0] || [];
		const sumFieldName = Object.keys(firstCountryData[0] || {})
			.find((key) => key.startsWith("sum_"));

		return {
			value: sumFieldName,
			text: (sumFieldName?.split("sum_")[1]?.replace(/_/g, " ") || "")
				.split(" ")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" "),
		};
	}), [productionByCountry]);
	console.log("Sum Field Types:", productionTypes);

	// Replace current productionType state initialization
	const [productionType, setProductionType] = useState("");

	// Add useEffect to update productionType when productionTypes is populated
	useEffect(() => {
		if (productionTypes.length > 0 && !productionType) {
			setProductionType(productionTypes[0].value);
		}
	}, [productionType, productionTypes]);

	console.log("Selected prouction type:", productionType);
	console.log("Selected date:", filters.year);

	const formRefDate = useRef();
	const formContentDate = useMemo(() => [
		{
			customType: "date-range",
			id: "dateRange",
			startValue: startDate,
			startLabel: "Start date",
			endValue: endDate,
			endLabel: "End date",
			labelSize: 12,
			onStartChange: (newValue) => handleDateChange(newValue, setStartDate),
			onEndChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [endDate, handleDateChange, startDate]);

	const yearPickerRef = useRef;
	const yearPickerProps = useMemo(() => [
		{
			customType: "date-picker",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date(`${year}-01-01`),
			minDate: new Date("2001-01-01"),
			maxDate: new Date("2025-12-31"),
			onChange: (newValue) => {
				if (newValue) {
					setFilters((prev) => ({
						...prev,
						year: newValue.$y.toString(),
					}));
				}
			},
		},
	], []);

	const dropdownContent = useMemo(() => ([
		{
			id: "product",
			items: products,
			value: filters.product,
			label: "Select Product",
			onChange: (event) => {
				dispatch({ type: "FETCH_START" }); // Add loading state
				setFilters((prev) => ({ ...prev, product: event.target.value }));
			},
		},
		{
			id: "country",
			items: europeanCountries,
			value: filters.country,
			label: "Select Country",
			onChange: (event) => {
				dispatch({ type: "FETCH_START" }); // Add loading state
				setFilters((prev) => ({ ...prev, country: event.target.value }));
			},
		},
		{
			id: "productionType",
			items: productionTypes,
			value: productionTypes[0]?.value,
			label: "Select Production Type",
			onChange: (event) => {
				const selectedType = productionTypes.find((type) => type.text === event.target.value);
				setProductionType(selectedType?.value || "");
			},
		},
	].map((item) => ({
		...item,
		size: "small",
	}))), [dispatch, filters.country, filters.product, productionTypes]);

	const europeOverview = useMemo(() => {
		const productionData = productionByCountry.find((data) => {
			const firstCountryData = Object.values(data)[0] || [];
			console.log("First Country Data:", firstCountryData);
			const sumFieldName = Object.keys(firstCountryData[0] || {})
				.find((key) => key.startsWith("sum_"));
			return sumFieldName === productionType;
		});
		console.log("Selected Production Data:", productionData);

		if (!productionData) return null;

		const firstCountryData = Object.values(productionData)[0] || [];
		const sumFieldName = Object.keys(firstCountryData[0] || {})
			.find((key) => key.startsWith("sum_"));
		const { countryData } = transformProductionData(
			productionData,
			filters.year,
			sumFieldName,
		);
		console.log("Transformed Production Data:", countryData);
		return {
			countryData,
			productionType: productionType.split("sum_")[1]?.replace(/_/g, " "),
			charts: {
				gauge: {
					data: {
						value: countryData.reduce((sum, data) => sum + data.production, 0),
						subtitle: "EU's Annual Production",
					},
					shape: "bullet",
					range: [0, 5_000_000],
					color: "primary",
					suffix: ` ${unit}`,
				},
				pie: {
					data: isValidArray(countryData) ? [{
						labels: countryData.map((item) => item.label),
						values: countryData.map((item) => item.production),
						color: agriColors,
						type: "pie",
						sort: false,
					}] : [],
				},
				bars: {
					data: Object.entries(productionData).map(([countryCode, values], index) => ({
						x: generateYearsArray(2010, 2025),
						y: values.map((item) => item[sumFieldName] || 0),
						type: "bar",
						title: countryCode,
						color: agColorKeys[index % agColorKeys.length],
					})),
					title: "Annual Production by Country",
				},
			},
		};
	}, [productionByCountry, productionType, filters.year, unit]);
	console.log("Europe Overview:", europeOverview);
	console.log("General production data:", productionByCountry);

	const countryOverview = useMemo(() => [
		{
			data: {
				value: europeOverview?.countryData?.find(
					(country) => country.label === filters.country,
				)?.production ?? null,
				subtitle: `${filters.country}'s ${europeOverview?.productionType} Production`,
			},
			range: [0, 3_000_000],
			color: "secondary",
			suffix: ` ${unit}`,
			shape: "angular",
		},
		{
			data: {
				value: monthlyPrices?.[0]?.avg_price ?? null,
				subtitle: "Current Month's Average Price",
			},
			color: "third",
			suffix: `€/${unit}`,
			shape: "angular",
		},
		{
			title: `${filters.product}'s Price Timeline`,
			data: [
				{
					x: isValidPrice ? pricesTimeline.map((item) => item.interval_start) : [],
					y: isValidPrice ? pricesTimeline.map((item) => item.avg_price) : [],
					type: "scatter",
					mode: "lines",
					color: "secondary",
					title: `€/${unit}`,
				},
			],
			xaxis: { title: "Date" },
			yaxis: { title: `Average Price per ${unit}` },
		},
		{
			data: {
				value: periodPrices?.[0]?.avg_price ?? null,
				subtitle: "Specified Period's Average Price",
			},
			color: "third",
			suffix: `€/${unit}`,
			shape: "angular",
		},
	], [europeOverview?.countryData, europeOverview?.productionType, filters.country, filters.product, unit, monthlyPrices, isValidPrice, pricesTimeline, periodPrices]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={[dropdownContent[0]]} />
			<Grid item xs={12} md={6} alignItems="center" flexDirection="column">
				<Card
					title="EU's Annual Overview"
					footer={cardFooter({ minutesAgo })}
				>
					<Grid item xs={12} md={12} display="flex" justifyContent="flex-end">
						<StickyBand
							sticky={false}
							dropdownContent={[dropdownContent[2]]}
							formRef={yearPickerRef.production1}
							formContent={yearPickerProps}
						/>
					</Grid>
					{isLoading ? (
						<LoadingIndicator />
					) : (
						<Grid container display="flex" direction="row" justifyContent="space-evenly" sx={{ flex: 1 }}>
							<Grid item xs={12} sm={12} md={12} justifyContent="center" alignItems="center">
								{europeOverview?.charts.gauge.data.value && (
									<Plot
										showLegend
										scrollZoom
										height={europeOverview.charts.gauge.shape === "bullet" ? "115px" : "200px"}
										data={[{
											type: "indicator",
											mode: "gauge+number",
											value: europeOverview.charts.gauge.data.value,
											range: europeOverview.charts.gauge.range,
											color: europeOverview.charts.gauge.color,
											shape: europeOverview.charts.gauge.shape,
											indicator: "primary",
											textColor: "primary",
											suffix: europeOverview.charts.gauge.suffix,
										}]}
										title={europeOverview.charts.gauge.data.subtitle}
									/>
								)}
							</Grid>
							<Grid item xs={12} sm={12} md={12} justifyContent="center" alignItems="center">
								{europeOverview?.charts.pie.data.length > 0 && (
									<Plot
										scrollZoom
										showLegend
										displayBar={false}
										height="295px"
										title={`${filters.year}'s Production by Country`}
										data={europeOverview.charts.pie.data}
									/>
								)}
							</Grid>
						</Grid>
					)}
				</Card>
			</Grid>
			<Grid item xs={12} md={6} alignItems="center" flexDirection="column">
				<Card
					title="Production per Year"
					footer={cardFooter({ minutesAgo })}
				>
					{isLoading ? (
						<LoadingIndicator />
					) : (
						<Grid item xs={12} sm={12} justifyContent="center" alignItems="center" sx={{ flex: 1 }}>
							{europeOverview?.charts.bars.data && (
								<Plot
									scrollZoom
									data={[...europeOverview.charts.bars.data].reverse()}
									barmode="stack"
									displayBar={false}
									title={europeOverview.charts.bars.title}
								/>
							)}
						</Grid>
					)}
				</Card>
			</Grid>
			<Grid item xs={12} md={12} mb={2} alignItems="center" flexDirection="column">
				<Card title="Product per Country" footer={cardFooter({ minutesAgo })}>
					<StickyBand
						sticky={false}
						dropdownContent={[dropdownContent[1]]}
						formRef={formRefDate}
						formContent={formContentDate}
					/>
					{dateMetrics.isValidDateRange ? (
						isLoading ? (
							<LoadingIndicator />
						) : (
							<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
								{countryOverview.map((plotData, index) => {
									const isTimelinePlot = index === countryOverview.length - 2;
									const isValidData = isTimelinePlot
										? (isValidPrice && plotData.data)
										: (plotData.data?.value && plotData.data.value !== "");

									return isValidData && (
										<Grid
											key={index}
											item
											height="200px"
											xs={12}
											sm={12}
											md={index === countryOverview.length - 1 ? 3 : index === countryOverview.length - 2 ? 9 : 4}
											justifyContent="center"
											alignItems="center"
										>
											{isTimelinePlot ? (
												<Plot
													scrollZoom
													data={plotData.data}
													xaxis={plotData.xaxis}
													yaxis={plotData.yaxis}
												/>
											) : (
												<Plot
													showLegend
													scrollZoom
													height={plotData.shape === "bullet" ? "120px" : "200px"}
													data={[{
														type: "indicator",
														mode: "gauge+number",
														value: plotData.data.value,
														range: plotData.range ?? [0, 2000],
														color: plotData.color,
														shape: plotData.shape,
														indicator: "primary",
														textColor: "primary",
														suffix: plotData.suffix,
													}]}
													displayBar={false}
													title={plotData.data?.subtitle}
												/>
											)}
										</Grid>
									);
								})}
							</Grid>
						)
					) : (<DataWarning message="Please Select a Valid Date Range" />
					)}
				</Card>
			</Grid>
		</Grid>
	);
};

export default memo(ProductsScreen);
