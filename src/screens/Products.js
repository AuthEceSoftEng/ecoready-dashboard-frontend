/* eslint-disable max-len */
import { useLocation } from "react-router-dom";
import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import colors from "../_colors.scss";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import { getPriceConfigs, getMonthlyPriceConfigs, getProductionConfigs, organization } from "../config/ProductConfig.js";
import {
	getCustomDateTime, calculateDates, calculateDifferenceBetweenDates,
	debounce, isValidArray, generateYearsArray, groupByKey,
} from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { europeanCountries, products } from "../utils/useful-constants.js";

const customDate = getCustomDateTime(2024, 12);
const { year } = calculateDates(customDate);

const agriColors = [
	colors.ag1, colors.ag2, colors.ag3, colors.ag4, colors.ag5,
	colors.ag6, colors.ag7, colors.ag8, colors.ag9, colors.ag10,
	colors.ag11, colors.ag12, colors.ag13, colors.ag14, colors.ag15,
	colors.ag16, colors.ag17, colors.ag18, colors.ag19, colors.ag20,
];
const agColorKeys = Array.from({ length: 20 }, (_, i) => `ag${i + 1}`);

// Get relevant fields for prices and products
const extractFields = (productObject, fieldName) => {
	if (!productObject) return { fields: [], collections: [] };

	const fields = Object.keys(productObject)
		.filter((key) => key.toLowerCase().includes(fieldName))
		.map((field) => ({
			productName: productObject.text,
			original: field,
			text: field
				.split("_")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" "),
			products: productObject[field]?.products || [],
			productTypes: productObject[field]?.productTypes || [],
			productionMetrics: productObject[field]?.productionMetrics || [],
		}));

	const collections = productObject.collections?.filter((collection) => collection.toLowerCase().includes(fieldName)) || [];

	return { fields, collections, hasData: fields.length > 0, needsDropdown: collections.length > 1 };
};

const getProductionSumField = (productionData) => {
	if (!productionData) return null;

	const firstCountry = Object.values(productionData)[0];
	if (!Array.isArray(firstCountry) || firstCountry.length === 0) return null;

	const firstItem = firstCountry[0];
	return Object.keys(firstItem).find((key) => key.startsWith("sum_"));
};

const getUniqueCountries = (periodPrices) => {
	if (!Array.isArray(periodPrices)) return [];

	// Get unique country codes from periodPrices
	const uniqueKeys = [...new Set(periodPrices.map((item) => item.key))];

	// Map them to country objects from europeanCountries
	return uniqueKeys.map((key) => europeanCountries.find((country) => country.value === key || country.region === key)).filter(Boolean); // Remove any undefined values
};

// Function to categorize production data by country
const transformProductionData = (productionData, yearPicker, sumFieldName) => {
	const timestamp = `${yearPicker}-01-01T00:00:00`;

	const euData = productionData.EU?.find(
		(item) => item.timestamp === timestamp,
	)?.[sumFieldName] || 0;

	const countryData = Object.keys(productionData)
		.filter((countryName) => countryName !== "EU")
		.map((countryName) => {
			const countryArray = productionData[countryName] || [];

			const matchingData = countryArray.find(
				(item) => item.interval_start === timestamp,
			);

			return {
				label: countryName,
				production: matchingData?.[sumFieldName] || 0,
			};
		})
		.sort((a, b) => a.label.localeCompare(b.label));

	return { euProduction: euData, countryData };
};

const getMaxValue = (maxProd, prodTypeVal, country = "EU") => [
	maxProd.flat().find((item) => item?.key === country && Object.keys(item || {}).includes(`max_${prodTypeVal}`))?.[`max_${prodTypeVal}`] || 0,
];
const ProductsScreen = () => {
	const location = useLocation();
	const selectedProduct = location.state?.selectedProduct;
	const [startDate, setStartDate] = useState("2024-01-01");
	const [endDate, setEndDate] = useState("2024-12-31");
	const [globalProduct, setGlobalProduct] = useState(selectedProduct || "Rice");

	// Find the selected product's details from products array
	const selectedProductDetails = useMemo(() => products.find((p) => p.text === globalProduct), [globalProduct]);

	const pricesItems = useMemo(() => extractFields(selectedProductDetails, "prices") || [], [selectedProductDetails]);
	console.log("Prices Items:", pricesItems);

	const priceCategories = useMemo(() => (pricesItems.needsDropdown ? pricesItems.collections : []), [pricesItems]);

	const [selectedPriceCategory, setSelectedPriceCategory] = useState(priceCategories[0] ?? "");
	console.log("Selected Price Category1:", selectedPriceCategory);

	const priceProducts = useMemo(() => pricesItems.fields[0]?.products ?? [], [pricesItems.fields]);
	console.log("Price Products:", priceProducts);

	const priceProductTypes = useMemo(() => pricesItems.fields[0]?.productTypes ?? [], [pricesItems]);
	console.log("Price Product Types:", priceProductTypes);

	const [priceOptions, setPriceOptions] = useState({
		country: "Greece",
		product: "Indica" ?? null,
		productType: "Avg" ?? null,
		productVar: priceProductTypes?.[0]?.value ?? priceProductTypes?.[0] ?? null,
	});
	console.log("Price Options:", priceOptions);

	const productionItems = useMemo(() => extractFields(selectedProductDetails, "production") || [], [selectedProductDetails]);
	// console.log("Production Items:", productionItems);

	const productionProducts = useMemo(() => productionItems.fields[0]?.products ?? [], [productionItems]);
	const productTypes = useMemo(() => productionItems.fields[0]?.productTypes ?? [], [productionItems]);
	const productionMetrics = useMemo(() => productionItems.fields[0]?.productionMetrics ?? [], [productionItems]);
	// console.log("Production Product Types:", productTypes);
	const [productionOptions, setProductionOptions] = useState({
		year: "2024",
		product: productionProducts?.[0] ?? null,
		productType: productTypes?.[0] ?? null,
		productionMetricType: productionMetrics?.[0]?.text ?? null,
		productionMetricVal: productionMetrics?.[0]?.value ?? null,
	});

	const handleProductionMetricChange = useCallback((newProductType) => {
		setProductionOptions((prev) => {
			const selectedMetric = productionMetrics?.find((type) => type.text === newProductType);
			return {
				...prev,
				productionMetricType: newProductType,
				productionMetricVal: selectedMetric?.value ?? null,
			};
		});
	}, [productionMetrics]);
	// console.log("Production Options:", productionOptions);

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

	const dateMetrics = useMemo(() => {
		const isValid = startDate && endDate && new Date(startDate) <= new Date(endDate);
		return {
			isValidDateRange: isValid,
			...calculateDifferenceBetweenDates(startDate, endDate),
		};
	}, [startDate, endDate]);

	// Add ready states
	const [isPriceConfigReady, setIsPriceConfigReady] = useState(false);
	const [isProductionConfigReady, setIsProductionConfigReady] = useState(false);

	// Add validation effects
	useEffect(() => {
		const isPriceReady = Boolean(globalProduct && dateMetrics.isValidDateRange && Object.values(priceOptions).some(Boolean));
		setIsPriceConfigReady(isPriceReady);
	}, [globalProduct, dateMetrics.isValidDateRange, priceOptions]);
	console.log("Is Price Configs Ready:", isPriceConfigReady);

	useEffect(() => {
		const isProductionReady = Boolean(globalProduct && Object.values(productionOptions).some(Boolean));
		setIsProductionConfigReady(isProductionReady);
	}, [globalProduct, productionOptions]);

	// Separate price configs
	const priceConfigs = useMemo(
		() => {
			if (!isPriceConfigReady) return [];
			const configs = [];
			if (getPriceConfigs) {
				configs.push(...getPriceConfigs(globalProduct, startDate, endDate, dateMetrics.differenceInDays, priceOptions.product, priceOptions.productType));
			}

			if (getMonthlyPriceConfigs) {
				configs.push(...getMonthlyPriceConfigs(globalProduct, customDate, priceOptions.product, priceOptions.productType));
			}

			return configs;
		},
		[isPriceConfigReady, globalProduct, startDate, endDate, dateMetrics.differenceInDays, priceOptions.product, priceOptions.productType],
	);

	// Separate production configs
	const productionConfigs = useMemo(
		() => {
			if (!isProductionConfigReady) return [];
			return getProductionConfigs(globalProduct, productionOptions.product, productionOptions.productionMetricVal, productionOptions.productType) || [];
		},
		[isProductionConfigReady, globalProduct, productionOptions.product,
			productionOptions.productionMetricVal, productionOptions.productType],
	);

	// Create separate useInit hooks for price and production
	const priceState = useInit(organization, priceConfigs);
	const productionState = useInit(organization, productionConfigs);

	// Combine states for components that need both
	const combinedState = {
		isPriceLoading: priceState.state.isPriceLoading,
		isProductionLoading: productionState.state.isProductionLoading,
		minutesAgo: Math.max(priceState.state.minutesAgo, productionState.state.minutesAgo),
		dataSets: {
			...priceState.state.dataSets,
			...productionState.state.dataSets,
		},
	};

	// Replace references to state and dispatch with combined/specific versions
	const { state, dispatch } = {
		state: combinedState,
		dispatch: useCallback((action) => {
			if (action.type.includes("PRICE")) {
				priceState.dispatch(action);
			} else if (action.type.includes("PRODUCTION")) {
				productionState.dispatch(action);
			} else {
				priceState.dispatch(action);
				productionState.dispatch(action);
			}
		}, [priceState, productionState]),
	};

	console.log("Filter product:", globalProduct);
	// console.log("Production options:", productionOptions);

	const units = useMemo(() => ({
		priceUnit: priceConfigs?.[0]?.unit || "",
		productionUnit: productionConfigs?.[0]?.unit || "",
	}), [priceConfigs, productionConfigs]);

	const { isPriceLoading, isProductionLoading, dataSets, minutesAgo } = state;
	console.log("DATATATATATASETS:", dataSets);

	const pricesTimeline = useMemo(() => dataSets?.pricesTimeline || [], [dataSets]);
	const periodPrices = useMemo(() => dataSets?.periodPrices || [], [dataSets]);
	const monthlyPrices = useMemo(() => dataSets?.monthlyPrices || [], [dataSets]);
	const isValidPrice = useMemo(() => isValidArray(pricesTimeline), [pricesTimeline]);
	const isValidPeriodPrices = useMemo(() => isValidArray(periodPrices), [periodPrices]);
	const isValidMonthlyPrices = useMemo(() => isValidArray(monthlyPrices), [monthlyPrices]);
	const maxPrice = useMemo(() => dataSets?.maxPrice?.[0]?.avg_price, [dataSets]);

	const existingCountries = useMemo(() => getUniqueCountries(periodPrices), [periodPrices]);
	console.log("Existing Countries:", existingCountries);

	const productDropdownContent = useMemo(() => ([
		{
			id: "product",
			items: products,
			value: globalProduct,
			label: "Select Product",
			onChange: (event) => {
				const newProduct = event.target.value;
				dispatch({ type: "FETCH_START" });

				// Find the new product details and set initial production options
				const newProductDetails = products.find((p) => p.text === newProduct);
				const productionFields = extractFields(newProductDetails, "production").fields;
				const priceFields = extractFields(newProductDetails, "prices").fields;

				const initialPriceProduct = priceFields[0]?.products?.[0] ?? null;
				const initialPriceType = priceFields[0]?.productTypes?.[0] ?? null;

				const initialProduct = productionFields[0]?.products?.[0] ?? null;
				const initialType = productionFields[0]?.productTypes?.[0] ?? null;
				const initialMetric = productionFields[0]?.productionMetrics?.[0] ?? null;

				setGlobalProduct(newProduct);
				// Update price options
				setPriceOptions({
					country: existingCountries?.[0]?.text ?? null,
					product: initialPriceProduct ?? null,
					productType: initialPriceType?.text ?? initialPriceType ?? null,
					productVar: initialPriceType?.value ?? initialPriceType ?? null,
				});
				setProductionOptions((prev) => ({
					...prev,
					product: initialProduct ?? null,
					productType: initialType ?? null,
					productionMetricType: initialMetric?.text ?? null,
					productionMetricVal: initialMetric?.value ?? null,
				}));
			},
		},
	].map((item) => ({
		...item,
	}))), [dispatch, existingCountries, globalProduct]);

	// PRODUCTION GRAPHS
	const production = useMemo(() => {
		if (!dataSets) return [];

		// Get all productProduction keys
		const productionKeys = Object.keys(dataSets).filter((key) => key.startsWith("productProduction"));

		// Map each key to its array
		return productionKeys.map((key) => dataSets[key] || []);
	}, [dataSets]);
	// console.log("Combined Production Data:", production);

	const maxProduction = useMemo(() => {
		if (!dataSets) return [];

		const maxProductionKeys = Object.keys(dataSets).filter((key) => key.startsWith("maxProduction"));

		return maxProductionKeys.map((key) => dataSets[key] || []);
	}, [dataSets]);

	const productionByCountry = useMemo(() => production.map((productionData) => {
		const grouped = groupByKey(productionData, "key");

		// Filter out EU and transform codes to names
		const result = Object.keys(grouped)
			.filter((code) => code !== "EU")
			.reduce((acc, countryCode) => {
				const countryName = europeanCountries.find((country) => country.value === countryCode || country.region === countryCode)?.text;
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
	// console.log("Production by Country:", productionByCountry);

	const yearPickerRef = useRef();
	const yearPickerProps = useMemo(() => [
		{
			customType: "date-picker",
			width: "150px",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date(`${year}-01-01`),
			minDate: new Date("2010-01-01"),
			maxDate: new Date("2025-12-31"),
			onChange: (newValue) => { if (newValue) { setProductionOptions((prev) => ({ ...prev, year: newValue.$y.toString() })); } },
		},
	], []);
	const productionDropdowns = useMemo(() => {
		const dropdowns = [];

		if (productionProducts?.length) {
			dropdowns.push({
				id: "prodProds",
				width: "150px",
				items: productionProducts,
				value: productionOptions.product,
				label: "Select Product Type",
				onChange: (event) => {
					dispatch({ type: "FETCH_PRODUCTION_START" });
					setProductionOptions((prev) => ({ ...prev, product: event.target.value }));
				},
			});
		}

		if (productTypes?.length) {
			dropdowns.push({
				id: "prodProdTypes",
				width: "150px",
				items: productTypes,
				value: productionOptions.productType,
				label: "Select Product Type",
				onChange: (event) => {
					productionState.dispatch({ type: "FETCH_PRODUCTION_START" });
					setProductionOptions((prev) => ({ ...prev, productType: event.target.value }));
				},
			});
		}

		if (productionMetrics?.length) {
			dropdowns.push({
				id: "prodProdMtrx",
				width: "150px",
				items: productionMetrics,
				value: productionOptions.productionMetricType,
				label: "Select Production Type",
				onChange: (event) => {
					productionState.dispatch({ type: "FETCH_PRODUCTION_START" });
					handleProductionMetricChange(event.target.value);
				},
			});
		}

		return dropdowns;
	}, [productionProducts, productTypes, productionMetrics, productionOptions.product, productionOptions.productType, productionOptions.productionMetricType, dispatch, productionState, handleProductionMetricChange]);

	const europeOverview = useMemo(() => {
		const productionData = productionOptions.productionVal
			? productionByCountry.find((data) => Object.values(data)[0]?.some((item) => item[`sum_${productionOptions.productionVal}`] !== undefined))
			: productionByCountry[0];
		console.log("Production Data:", productionData);

		if (!productionData) return null;

		// get the sumfield
		const sumFieldName = getProductionSumField(productionData);
		if (!sumFieldName) return null;

		const { countryData } = transformProductionData(productionData, productionOptions.year, sumFieldName);
		console.log("Country Data:", countryData);
		const euMaxValue = getMaxValue(maxProduction, sumFieldName);
		const countryMaxValue = getMaxValue(maxProduction, sumFieldName, priceOptions.country);

		return {
			countryData,
			countryMaxValue,
			charts: {
				gauge: {
					data: {
						value: countryData.reduce((sum, data) => sum + data.production, 0),
						subtitle: "EU's Annual Production",
					},
					shape: "bullet",
					range: [0, euMaxValue],
					color: "third",
					suffix: ` ${units.productionUnit}`,
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
					data: Object.entries(productionData).map(([countryCode, values], index) => {
						const years = generateYearsArray(2010, 2025);

						// Create a map of existing data points
						const dataMap = new Map(
							values.map((item) => [
								item.timestamp || item.interval_start,
								item[sumFieldName] || 0,
							]),
						);

						// Generate complete data array with 0s for missing years
						const completeData = years.map((date) => {
							const timestamp = `${date}-01-01T00:00:00`;
							return dataMap.get(timestamp) || 0;
						});

						return {
							x: years,
							y: completeData,
							type: "bar",
							title: countryCode,
							color: agColorKeys[index % agColorKeys.length],
						};
					}),
					title: "Annual Production by Country",
					xaxis: { showticklabels: true, tickmode: "linear", tickangle: 45 },
				},
			},
		};
	}, [productionOptions.productionVal, productionByCountry, productionOptions.year, priceOptions.country, maxProduction, units.productionUnit]);

	// PRICES GRAPHS
	const priceDropdowns = useMemo(() => {
		const dropdowns = [
			{
				id: "country",
				items: existingCountries,
				value: priceOptions.country,
				label: "Select Country",
				onChange: (event) => { setPriceOptions((prev) => ({ ...prev, country: event.target.value })); },
			},
		];

		if (priceProducts?.length) {
			dropdowns.push({
				id: "product",
				items: priceProducts,
				value: priceOptions.product,
				label: "Select Product Type",
				onChange: (event) => {
					priceState.dispatch({ type: "FETCH_PRICE_START" });
					setPriceOptions((prev) => ({ ...prev, product: event.target.value }));
					if (existingCountries?.length) {
						setPriceOptions((prev) => ({ ...prev, country: existingCountries[0].text }));
					}
				},
			});
		}

		if (priceCategories?.length) {
			dropdowns.push({
				id: "priceCategory",
				items: priceCategories,
				value: selectedPriceCategory,
				label: "Select Product Category",
				onChange: (event) => {
					priceState.dispatch({ type: "FETCH_PRICE_START" });
					setSelectedPriceCategory(event.target.value);
					if (existingCountries?.length) {
						setPriceOptions((prev) => ({ ...prev, country: existingCountries[0].text }));
					}
				},
			});
		}

		if (priceProductTypes?.length) {
			dropdowns.push({
				id: "productType",
				items: priceProductTypes,
				value: priceOptions.productType,
				label: "Select Product Variety",
				onChange: (event) => {
					priceState.dispatch({ type: "FETCH_PRICE_START" });
					setPriceOptions((prev) => ({ ...prev, productType: event.target.value }));
					if (existingCountries?.length) {
						setPriceOptions((prev) => ({ ...prev, country: existingCountries[0].text }));
					}
				},
			});
		}

		return dropdowns;
	}, [existingCountries, priceOptions.country, priceOptions.product, priceOptions.productType, priceProducts, priceCategories, priceProductTypes, priceState, selectedPriceCategory]);

	const formRefDate = useRef();
	const formContentDate = useMemo(() => [
		{
			customType: "date-range",
			startValue: startDate,
			startLabel: "Start date",
			endValue: endDate,
			endLabel: "End date",
			labelSize: 12,
			onStartChange: (newValue) => handleDateChange(newValue, setStartDate),
			onEndChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [startDate, endDate, handleDateChange]);

	const countryOverview = useMemo(() => {
		// Get the country key once to reuse across all price lookups
		const countryObj = existingCountries.find((country) => country.text === priceOptions.country);
		const countryKey = countryObj?.value || countryObj?.region;

		return [
			{
				data: { value: europeOverview?.countryData?.find((country) => country.label === priceOptions.country)?.production ?? null },
				range: [0, europeOverview?.countryMaxValue],
				color: "third",
				suffix: ` ${units.productionUnit}`,
				shape: "angular",
			},
			{
				data: {
					value: isValidMonthlyPrices
						? monthlyPrices.find((item) => item.key === countryKey)?.avg_price ?? null
						: null,
					subtitle: "Current Month's Average Price",
				},
				color: "secondary",
				suffix: `${units.priceUnit}`,
				shape: "angular",
			},
			{
				title: `${globalProduct}'s Price Timeline`,
				data: [
					{
						x: isValidPrice ? pricesTimeline.filter((item) => item.key === countryKey).map((item) => item.interval_start) : null,
						y: isValidPrice ? pricesTimeline.filter((item) => item.key === countryKey).map((item) => item.avg_price) : null,
						type: "scatter",
						mode: "lines",
						color: "secondary",
						title: `${units.priceUnit}`,
					},
				],
				color: "secondary",
				xaxis: { title: "Date" },
				yaxis: { title: `Average ${units.priceUnit}` },
			},
			{
				data: {
					value: isValidPeriodPrices
						? periodPrices.find((item) => item.key === countryKey)?.avg_price ?? null
						: null,
					subtitle: "Specified Period's Average Price",
				},
				color: "secondary",
				suffix: `${units.priceUnit}`,
				shape: "angular",
			},
		];
	}, [existingCountries, europeOverview?.countryData, europeOverview?.countryMaxValue, units.productionUnit, units.priceUnit, isValidMonthlyPrices, monthlyPrices, globalProduct, isValidPrice, pricesTimeline, isValidPeriodPrices, periodPrices, priceOptions.country]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={productDropdownContent} />
			{/* PRODUCTION CARDS */}
			<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1} sx={{ minHeight: "500px" }}>
				<Grid
					item
					xs={12}
					md={6}
					alignItems="center"
					sx={{
						display: "flex",
						"& > *": { // This targets the Card component
							flex: 1,
							height: "100%",
							display: "flex",
							flexDirection: "column",
						},
					}}
				>
					<Card
						title="EU's Annual Overview"
						footer={cardFooter({ minutesAgo })}
						sx={{ display: "flex", flexDirection: "column" }}
					>
						<Grid item xs={12} md={12} display="flex" justifyContent="flex-end">
							<StickyBand sticky={false} dropdownContent={productionDropdowns} formRef={yearPickerRef} formContent={yearPickerProps} />
						</Grid>
						{isProductionLoading ? (
							<LoadingIndicator />
						) : (
							<Grid container display="flex" direction="row" justifyContent="space-evenly" sx={{ flex: 1 }}>
								{(!europeOverview?.charts.gauge.data.value || !europeOverview?.charts.pie.data.length) ? (
									<DataWarning message="No Available Data for the Specified Options Combination" />
								) : (
									<>
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
													title={`${productionOptions.year}'s Production by Country`}
													data={europeOverview.charts.pie.data}
												/>
											)}
										</Grid>
									</>
								)}
							</Grid>
						)}
					</Card>
				</Grid>
				<Grid
					item
					xs={12}
					md={6}
					alignItems="center"
					sx={{
						display: "flex",
						"& > *": {
							flex: 1,
							height: "100%",
							display: "flex",
							flexDirection: "column",
						},
					}}
				>
					<Card
						title="Production per Year"
						footer={cardFooter({ minutesAgo })}
						sx={{ display: "flex", flexDirection: "column" }}
					>
						{isProductionLoading ? (
							<LoadingIndicator />
						) : (
							<Grid item xs={12} sm={12} justifyContent="center" alignItems="center" sx={{ flex: 1 }}>
								{europeOverview?.charts.bars.data ? (
									<Plot
										scrollZoom
										data={[...europeOverview.charts.bars.data].reverse()}
										barmode="stack"
										displayBar={false}
										title={europeOverview.charts.bars.title}
										xaxis={europeOverview.charts.bars.xaxis}
									/>
								) : (<DataWarning message="No Available Data for the Specified Options Combination" />)}
							</Grid>
						)}
					</Card>
				</Grid>
			</Grid>
			{/* PRICE CARDS */}
			<Grid item xs={12} md={12} mb={2} alignItems="center" flexDirection="column">
				<Card title="Product per Country" footer={cardFooter({ minutesAgo })}>
					<StickyBand sticky={false} dropdownContent={priceDropdowns} formRef={formRefDate} formContent={formContentDate} />
					{dateMetrics.isValidDateRange ? (
						isPriceLoading ? (
							<LoadingIndicator />
						) : (
							<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
								{countryOverview.map((plotData, index) => {
									const isTimelinePlot = index === countryOverview.length - 2;
									const isValidData = isTimelinePlot
										? (isValidPrice && plotData.data)
										: (plotData.data?.value && plotData.data.value !== "");

									return isValidData ? (
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
														range: plotData.range ?? [0, maxPrice],
														color: plotData.color,
														shape: plotData.shape,
														indicator: "primary",
														textColor: "primary",
														suffix: plotData.suffix,
													}]}
													displayBar={false}
													title={plotData.data.subtitle}
												/>
											)}
										</Grid>
									) : (<DataWarning message="No Available Data for the Specified Options Combination" />);
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
