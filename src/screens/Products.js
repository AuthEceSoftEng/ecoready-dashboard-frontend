import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import colors from "../_colors.scss";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import DatePicker from "../components/DatePicker.js";
import useInit from "../utils/screen-init.js";
import { getPriceConfigs, getMonthlyPriceConfigs, getProductionConfigs, organization } from "../config/ProductConfig.js";
import { getCustomDateTime, calculateDates, calculateDifferenceBetweenDates,
	debounce, findKeyByText, isValidArray, generateYearsArray, groupByKey } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { monthNames, europeanCountries, products } from "../utils/useful-constants.js";
// import { fetchCollections } from "../api/fetch-data.js";

// const metrics = fetchCollections(organization, "rice");
const unit = "Tonnes";
const customDate = getCustomDateTime(2024, 12);
const { year, month } = calculateDates(customDate);

const agriColors = [
	colors.ag1, colors.ag2, colors.ag3, colors.ag4, colors.ag5,
	colors.ag6, colors.ag7, colors.ag8, colors.ag9, colors.ag10,
	colors.ag11, colors.ag12, colors.ag13, colors.ag14, colors.ag15,
	colors.ag16, colors.ag17, colors.ag18, colors.ag19, colors.ag20,
];
const agColorKeys = Array.from({ length: 20 }, (_, i) => `ag${i + 1}`);

const countryOrder = europeanCountries
	.filter((country) => country.value !== "EU")
	.sort((a, b) => a.text.localeCompare(b.text))
	.map((country) => country.value);

const transformProductionData = (production, sliderYear, countries) => ({
	euProduction: production.find(
		(country) => country.key === "EU"
			&& country.timestamp === `${sliderYear}-01-01T00:00:00`,
	)?.total_production,

	countryData: countryOrder
		.map((countryCode) => {
			const productionItem = production.find(
				(item) => item.key === countryCode
					&& item.timestamp === `${sliderYear}-01-01T00:00:00`,
			);
			return {
				label: countries.find((c) => c.value === countryCode)?.text || countryCode,
				total_production: productionItem?.total_production || 0,
			};
		})
		.filter((item) => item.total_production > 0),
});

const ProductsScreen = () => {
	const [startDate, setStartDate] = useState("2024-01-01");
	const [endDate, setEndDate] = useState("2024-12-31");

	const [filters, setFilters] = useState({
		year: "2024",
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

	const keys = useMemo(() => ({
		country: findKeyByText(europeanCountries, filters.country),
		product: findKeyByText(products, filters.product),
	}), [filters.country, filters.product]);

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

	const yearPickerProps = useMemo(() => ({
		type: "desktop",
		width: "170px",
		label: "Year Picker",
		views: ["year"],
		value: new Date(`${year}-01-01`),
		minDate: new Date("2001-01-01"),
		maxDate: new Date("2035-12-31"),
		onChange: (newValue) => {
			if (newValue) {
				setFilters((prev) => ({
					...prev,
					year: newValue.$y.toString(),
				}));
			}
		},
	}), []);

	const dateMetrics = useMemo(() => {
		const isValid = startDate && endDate && new Date(startDate) <= new Date(endDate);
		return {
			isValidDateRange: isValid,
			...calculateDifferenceBetweenDates(startDate, endDate),
		};
	}, [startDate, endDate]);
	// const { collections } = getProductCollections(countryKey, productKey);
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

	const ricePrice = useMemo(() => dataSets?.pricesTimeline || [], [dataSets]);
	const isValidPrice = useMemo(() => isValidArray(ricePrice), [ricePrice]);
	const riceProduction1 = useMemo(() => dataSets?.riceProd1 || [], [dataSets]);
	const riceProduction2 = useMemo(() => dataSets?.riceProd2 || [], [dataSets]);

	const production = useMemo(() => riceProduction1.map((milledEntry) => {
		// Find matching husk entry
		const huskEntry = riceProduction2.find((h) => h.key === milledEntry.key && h.interval_start === milledEntry.interval_start);

		return {
			key: milledEntry.key,
			timestamp: milledEntry.interval_start,
			total_production: (
				(milledEntry.sum_milled_rice_equivalent_quantity || 0)
				+ (huskEntry?.sum_rice_husk_quantity || 0)
			),
		};
	}), [riceProduction1, riceProduction2]);

	const productionByCountry = useMemo(() => {
		const grouped = groupByKey(production, "key");

		// Filter out EU and transform codes to names
		const result = Object.keys(grouped)
			.filter((code) => code !== "EU")
			.reduce((acc, countryCode) => {
				const countryName = europeanCountries.find((country) => country.value === countryCode)?.text;
				if (countryName) {
					acc[countryName] = grouped[countryCode].map((item) => item.total_production);
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
	}, [production]);

	// const unit = useMemo(() => ricePrice[0]?.unit || "", [ricePrice]);
	const dropdownContent = useMemo(() => ([
		{
			id: "product",
			items: products,
			value: filters.product,
			onChange: (event) => {
				dispatch({ type: "FETCH_START" }); // Add loading state
				setFilters((prev) => ({ ...prev, product: event.target.value }));
			},
		},
		{
			id: "country",
			items: europeanCountries,
			value: filters.country,
			onChange: (event) => {
				dispatch({ type: "FETCH_START" }); // Add loading state
				setFilters((prev) => ({ ...prev, country: event.target.value }));
			},
		},
	].map((item) => ({
		...item,
		size: "small",
	}))), [dispatch, filters.country, filters.product]);

	const europeOverview = useMemo(() => {
		const { euProduction, countryData } = transformProductionData(production, filters.year, europeanCountries);
		return [
			{
				data: {
					value: countryData.reduce((sum, data) => sum + (data.total_production || 0), 0),
					subtitle: "EU's Annual Production",
				},
				color: "third",
				suffix: ` ${unit}s`,
				shape: "bullet",
			},
			{
				data: isValidArray(countryData)
					? [
						{
							labels: countryData.map((item) => item.label),
							values: countryData.map((item) => item.total_production),
							color: agriColors,
							type: "pie",
							sort: false,
						},
					] : [{ labels: [], values: [], type: "pie" }],
			},
			{
				data: Object.entries(productionByCountry)
					.filter(([countryCode]) => countryCode !== "EU")
					.map(([countryCode, values], index) => ({
						x: generateYearsArray(2010, Number.parseInt(filters.year, 10)),
						y: values,
						type: "bar",
						title: countryCode,
						color: agColorKeys[index % agColorKeys.length],
					})),
				title: "Annual Production by Country",
			},
		];
	}, [filters.year, production, productionByCountry]);

	const countryOverview = useMemo(() => [
		{
			data: {
				value: production.find(
					(stat) => stat.key === keys.country,
				)?.total_production ?? null,
				subtitle: "Annual Production",
			},
			range: [0, 3_000_000],
			color: "secondary",
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
	], [dataSets?.monthlyPrices, dataSets?.periodPrices, filters.product, isValidPrice, keys.country, production, ricePrice]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={[dropdownContent[0]]} />
			<Grid item xs={12} md={6} alignItems="center" flexDirection="column">
				<Card title="EU's Annual Overview" footer={cardFooter({ minutesAgo })}>
					<Grid item xs={12} md={12} alignItems="center" flexDirection="column">
						<DatePicker {...yearPickerProps} />
					</Grid>
					{isLoading ? (
						<LoadingIndicator />
					) : (
						<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
							<Grid
								item
								xs={12}
								sm={12}
								md={12}
								justifyContent="center"
								alignItems="center"
							>
								{europeOverview[0].data.value ? (
									<Plot
										showLegend
										scrollZoom
										height={europeOverview[0].shape === "bullet" ? "115px" : "200px"}
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
								md={12}
								justifyContent="center"
								alignItems="center"
							>
								{europeOverview[1].data.values ? (
									<Plot
										scrollZoom
										showLegend
										displayBar={false}
										height="300px"
										title={`${filters.year}'s Production by Country`}
										data={europeOverview[1].data}
									/>
								) : (<DataWarning />)}
							</Grid>
						</Grid>
					)}
				</Card>
			</Grid>
			<Grid item xs={12} md={12} alignItems="center" flexDirection="column">
				<Card title="Product Production per Year" footer={cardFooter({ minutesAgo })}>
					{isLoading ? (
						<LoadingIndicator />
					) : (
						<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
							<Grid item xs={12} sm={12} md={6} justifyContent="center" alignItems="center">
								{europeOverview[2].data ? (
									<Plot
										scrollZoom
										height="300px"
										data={[...europeOverview[2].data].reverse()}
										barmode="stack"
										displayBar={false}
										title={europeOverview[2].title}
									/>
								) : (<DataWarning />)}
							</Grid>
						</Grid>
					)}
				</Card>
			</Grid>
			<Grid item xs={12} md={12} alignItems="center" flexDirection="column">
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
								{countryOverview.map((plotData, index) => (
									<Grid
										key={index}
										item
										xs={12}
										sm={12}
										md={index === countryOverview.length - 1 ? 12 : 4}
										mb={index === -1 ? 2 : 0}
										justifyContent="center"
										alignItems="center"
									>
										{index === countryOverview.length - 1 ? (
										// Timeline plot
											isValidPrice ? (
												<Plot
													scrollZoom
													data={plotData.data}
													height="300px"
													xaxis={plotData.xaxis}
													yaxis={plotData.yaxis}
												/>
											) : (
												<DataWarning />
											)
										) : (
										// Gauge plots
											plotData.data.value ? (
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
											) : (
												<DataWarning />
											)
										)}
									</Grid>
								))}
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
