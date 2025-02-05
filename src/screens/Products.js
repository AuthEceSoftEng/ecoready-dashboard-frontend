/* eslint-disable max-len */
import { useLocation } from "react-router-dom";
import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import colors from "../_colors.scss";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import { getPriceConfigs, getMonthlyPriceConfigs, getProductionConfigs, organization } from "../config/ProductConfig.js";
import { getCustomDateTime, calculateDates, calculateDifferenceBetweenDates,
	debounce, findKeyByText, isValidArray, generateYearsArray, groupByKey } from "../utils/data-handling-functions.js";
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
		}));

	const collections = productObject.collections?.filter((collection) => collection.toLowerCase().includes(fieldName)) || [];

	return {
		fields,
		collections,
		hasData: fields.length > 0,
		needsDropdown: collections.length > 1,
	};
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
		.filter((item) => item.production > 0)
		.sort((a, b) => a.label.localeCompare(b.label));

	return {
		euProduction: euData,
		countryData,
	};
};

const getEUMaxValue = (maxProd, prodTypeVal) => {
	console.log("Max Prod:", maxProd);
	console.log("Prod Type Val:", prodTypeVal);
	return [
		maxProd.flat().find((item) => item?.key === "EU" && Object.keys(item || {}).includes(`max_${prodTypeVal}`))?.[`max_${prodTypeVal}`] || 0,
	];
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

	// Find the selected product's details from products array
	const selectedProductDetails = useMemo(() => products.find((p) => p.text === filters.product),
		[filters.product]);

	// Get production products if they exist
	const pricesItems = useMemo(() => extractFields(selectedProductDetails, "prices") || [], [selectedProductDetails]);
	// console.log("Prices:", pricesItems);

	const priceCategories = useMemo(() => (pricesItems.needsDropdown ? pricesItems.collections : []),
		[pricesItems]);

	const [selectedPriceCategory, setSelectedPriceCategory] = useState(priceCategories[0] ?? "");
	// console.log("Selected Price Category1:", selectedPriceCategory);

	const priceProducts = useMemo(() => {
		if (!pricesItems?.fields) return [];
		const categoryIndex = priceCategories.indexOf(selectedPriceCategory);
		return pricesItems.fields[categoryIndex === -1 ? 0 : categoryIndex]?.products;
	}, [priceCategories, pricesItems.fields, selectedPriceCategory]);
	// console.log("Price Products:", priceProducts);

	const priceProductTypes = useMemo(() => {
		if (!pricesItems?.fields) return [];
		const categoryIndex = priceCategories.indexOf(selectedPriceCategory);
		return pricesItems.fields[categoryIndex === -1 ? 0 : categoryIndex]?.productTypes;
	}, [priceCategories, pricesItems.fields, selectedPriceCategory]);
	// console.log("Price Product Types:", priceProductTypes);

	const [priceOptions, setPriceOptions] = useState({
		product: priceProducts?.[0] ?? null,
		productType: priceProductTypes?.[0]?.text ?? priceProductTypes[0] ?? null,
		productTypeVal: priceProductTypes?.[0]?.value ?? priceProductTypes[0] ?? null,
	});

	// console.log("Price Options:", priceOptions);

	const productionItems = useMemo(() => extractFields(selectedProductDetails, "production") || [], [selectedProductDetails]);
	console.log("PRoduction Items:", productionItems);

	const productionProducts = useMemo(() => productionItems.fields[0]?.products ?? [],
		[productionItems]);
	const productionProductTypes = useMemo(() => productionItems.fields[0]?.productTypes ?? [],
		[productionItems]);
	console.log("Production Product Types:", productionProductTypes);

	const [productionOptions, setProductionOptions] = useState({
		product: null,
		productType: null,
		productTypeVal: null,
	});

	const handleProductionTypeChange = useCallback((newProductType) => {
		const selectedType = productionProductTypes?.find((type) => type.text === newProductType);
		setProductionOptions((prev) => ({
			...prev,
			productType: newProductType,
			productTypeVal: selectedType?.value ?? null,
		}));
	}, [productionProductTypes]);

	useEffect(() => {
		if (productionProducts?.length > 0 || productionProductTypes?.length > 0) {
			const initialType = productionProductTypes?.[0];
			setProductionOptions({
				product: productionProducts?.[0] ?? null,
				productType: initialType?.text ?? null,
				productTypeVal: initialType?.value ?? null,
			});
		}
	}, [productionProducts, productionProductTypes]);

	useEffect(() => {
		const selectedType = productionProductTypes?.find((type) => type.text === productionOptions.productType);
		if (selectedType) {
			setProductionOptions((prev) => ({
				...prev,
				productTypeVal: selectedType.value,
			}));
		}
	}, [productionOptions.productType, productionProductTypes]);

	console.log("Production Options:", productionOptions);

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

	// Add ready states
	const [isPriceConfigReady, setIsPriceConfigReady] = useState(false);
	const [isProductionConfigReady, setIsProductionConfigReady] = useState(false);

	// Add validation effects
	useEffect(() => {
		const isPriceReady = Boolean(
			keys.country
			&& filters.product
			&& dateMetrics.isValidDateRange,
		);
		setIsPriceConfigReady(isPriceReady);
	}, [keys.country, filters.product, dateMetrics.isValidDateRange]);

	useEffect(() => {
		const isProductionReady = Boolean(
			filters.product
			&& productionOptions.product
			&& productionOptions.productTypeVal,
		);
		setIsProductionConfigReady(isProductionReady);
	}, [filters.product, productionOptions.product, productionOptions.productTypeVal]);

	// Update config calls
	const priceConfigs = useMemo(
		() => (isPriceConfigReady
			? getPriceConfigs(keys.country, filters.product, startDate, endDate, dateMetrics.differenceInDays)
			: null),
		[isPriceConfigReady, keys.country, filters.product, startDate, endDate, dateMetrics.differenceInDays],
	);

	const monthlyPriceConfigs = useMemo(
		() => (isPriceConfigReady
			? getMonthlyPriceConfigs(keys.country, filters.product, customDate)
			: null),
		[isPriceConfigReady, keys.country, filters.product],
	);

	const productionConfigs = useMemo(
		() => (isProductionConfigReady
			? getProductionConfigs(filters.product, productionOptions.product, productionOptions.productTypeVal)
			: null),
		[isProductionConfigReady, filters.product, productionOptions.product, productionOptions.productTypeVal],
	);

	console.log("Filter product:", filters.product);
	console.log("Production options:", productionOptions);

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

	const units = useMemo(() => ({
		priceUnit: priceConfigs?.[0].unit || "",
		productionUnit: productionConfigs?.[0].unit || "",
	}), [priceConfigs, productionConfigs]);

	const { state, dispatch } = useInit(organization, allConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	console.log("DATATATATATASETS:", dataSets);

	const pricesTimeline = useMemo(() => dataSets?.pricesTimeline || [], [dataSets]);
	const periodPrices = useMemo(() => dataSets?.periodPrices || [], [dataSets]);
	const monthlyPrices = useMemo(() => dataSets?.monthlyPrices || [], [dataSets]);
	const isValidPrice = useMemo(() => isValidArray(pricesTimeline), [pricesTimeline]);
	const maxPrice = useMemo(() => dataSets?.maxPrice?.[0]?.avg_price, [dataSets]);

	const production = useMemo(() => {
		if (!dataSets) return [];

		// Get all productProduction keys
		const productionKeys = Object.keys(dataSets).filter((key) => key.startsWith("productProduction"));

		// Map each key to its array
		return productionKeys.map((key) => dataSets[key] || []);
	}, [dataSets]);
	console.log("Combined Production Data:", production);

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

	const yearPickerRef = useRef();
	const yearPickerProps = useMemo(() => [
		{
			customType: "date-picker",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date(`${year}-01-01`),
			minDate: new Date("2010-01-01"),
			maxDate: new Date("2025-12-31"),
			onChange: (newValue) => { if (newValue) { setFilters((prev) => ({ ...prev, year: newValue.$y.toString() })); } },
		},
	], []);

	const productDropdownContent = useMemo(() => ([
		{
			id: "product",
			items: products,
			value: filters.product,
			label: "Select Product",
			onChange: (event) => {
				dispatch({ type: "FETCH_START" });
				setFilters((prev) => ({ ...prev, product: event.target.value }));
				setProductionOptions({
					product: null,
					productType: null,
				});
			},
		},
	].map((item) => ({
		...item,
		size: "small",
	}))), [dispatch, filters.product]);

	const productionDropdowns = useMemo(() => {
		const dropdowns = [];

		if (productionProducts?.length > 0) {
			dropdowns.push({
				id: "prodProds",
				items: productionProducts,
				value: productionOptions.product,
				label: "Select Product Type",
				onChange: (event) => {
					dispatch({ type: "FETCH_START" });
					setProductionOptions((prev) => ({ ...prev, product: event.target.value }));
				},
				size: "small",
			});
		}

		if (productionProductTypes?.length > 0) {
			dropdowns.push({
				id: "prodProdTypes",
				items: productionProductTypes,
				value: productionOptions.productType,
				label: "Select Product Variety",
				onChange: (event) => {
					dispatch({ type: "FETCH_START" });
					handleProductionTypeChange(event.target.value);
				},
				size: "small",
			});
		}

		return dropdowns;
	}, [productionProducts, productionProductTypes, productionOptions.product, productionOptions.productType, dispatch, handleProductionTypeChange]);

	// PRODUCTION GRAPHS
	const europeOverview = useMemo(() => {
		const productionData = productionOptions.productTypeVal
			? productionByCountry.find((data) => Object.values(data)[0]?.some((item) => item[`sum_${productionOptions.productTypeVal}`] !== undefined))
			: productionByCountry[0];
		console.log("Production Data:", productionData);

		if (!productionData) return null;

		// get the sumfield
		const firstCountry = Object.values(productionData)[0];
		const firstItem = firstCountry?.[0] || {};
		const sumFieldName = Object.keys(firstItem).find((key) => key.startsWith("sum_"));

		const { countryData } = transformProductionData(productionData, filters.year, sumFieldName);
		console.log("Country Data:", countryData);
		const euMaxValue = getEUMaxValue(maxProduction, sumFieldName);
		console.log("EU Max Value:", euMaxValue);

		return {
			countryData,
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
					data: Object.entries(productionData).map(([countryCode, values], index) => ({
						x: generateYearsArray(2010, 2025),
						y: values.map((item) => item[`sum_${productionOptions.productTypeVal}`] || 0),
						type: "bar",
						title: countryCode,
						color: agColorKeys[index % agColorKeys.length],
					})),
					title: "Annual Production by Country",
				},
			},
		};
	}, [productionByCountry, filters.year, maxProduction, productionOptions.productTypeVal, units.productionUnit]);

	// PRICES GRAPHS
	const priceDropdowns = useMemo(() => {
		const dropdowns = [];

		if (priceCategories.length > 0) {
			dropdowns.push({
				id: "priceCategories",
				items: priceCategories,
				value: selectedPriceCategory,
				label: "Select Price Category",
				onChange: (event) => {
					dispatch({ type: "FETCH_START" }); // Add loading state
					setSelectedPriceCategory(event.target.value);
				},
				size: "small",
			});
		}

		if (priceProducts.length > 0) {
			dropdowns.push({
				id: "priceProduct",
				items: priceProducts,
				value: priceOptions.product,
				label: "Select Product Type",
				onChange: (event) => {
					dispatch({ type: "FETCH_START" }); // Add loading state
					setPriceOptions((prev) => ({ ...prev, product: event.target.value }));
				},
				size: "small",
			});
		}

		if (priceProductTypes.length > 0) {
			dropdowns.push({
				id: "priceProductTypes",
				items: priceProductTypes,
				value: priceOptions.productType,
				label: "Select Product Type",
				onChange: (event) => {
					dispatch({ type: "FETCH_START" }); // Add loading state
					setPriceOptions((prev) => ({ ...prev, productType: event.target.value }));
				},
				size: "small",
			});
		}
	}, [dispatch, priceCategories, priceOptions.product, priceOptions.productType, priceProductTypes, priceProducts, selectedPriceCategory]);

	const priceDropdownContent = useMemo(() => ([

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
	]), [filters.country, dispatch]);

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

	const countryOverview = useMemo(() => [
		{
			data: {
				value: europeOverview?.countryData?.find(
					(country) => country.label === filters.country,
				)?.production ?? null,
				// subtitle: `${productionTypes.find((type) => type.value === productionType)?.text || ""}`,
			},
			range: [0, 2000],
			color: "third",
			suffix: ` ${units.productionUnit}`,
			shape: "angular",
		},
		{
			data: {
				value: monthlyPrices?.[0]?.avg_price ?? null,
				subtitle: "Current Month's Average Price",
			},
			color: "secondary",
			suffix: `${units.priceUnit}`,
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
					title: `${units.priceUnit}`,
				},
			],
			color: "secondary",
			xaxis: { title: "Date" },
			yaxis: { title: `Average ${units.priceUnit}` },
		},
		{
			data: {
				value: periodPrices?.[0]?.avg_price ?? null,
				subtitle: "Specified Period's Average Price",
			},
			color: "secondary",
			suffix: `${units.priceUnit}`,
			shape: "angular",
		},
	], [europeOverview?.countryData, units.productionUnit, units.priceUnit, monthlyPrices, filters.product, filters.country, isValidPrice, pricesTimeline, periodPrices]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={productDropdownContent} />
			<Grid item xs={12} md={6} alignItems="center" flexDirection="column">
				<Card
					title="EU's Annual Overview"
					footer={cardFooter({ minutesAgo })}
				>
					<Grid item xs={12} md={12} display="flex" justifyContent="flex-end">
						<StickyBand
							sticky={false}
							dropdownContent={productionDropdowns}
							formRef={yearPickerRef}
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
									height="461px"
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
			{/* <Grid item xs={12} md={12} mb={2} alignItems="center" flexDirection="column">
				<Card title="Product per Country" footer={cardFooter({ minutesAgo })}>
					<StickyBand
						sticky={false}
						dropdownContent={[priceDropdownContent, priceDropdowns]}
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
														range: plotData.range ?? [0, maxPrice],
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
			</Grid> */}
		</Grid>
	);
};

export default memo(ProductsScreen);
