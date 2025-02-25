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

	const collections = Array.isArray(productObject.collections)
		? productObject.collections.filter((collection) => (typeof collection === "string"
			? collection.toLowerCase().includes(fieldName)
			: collection.value.toLowerCase().includes(fieldName)))
		: Object.values(productObject.collections || {}).filter((collection) => collection.value.toLowerCase().includes(fieldName));

	return { fields, collections, hasData: fields.length > 0, needsDropdown: collections.length > 1 };
};

const getProductionSumField = (productionData) => {
	if (!productionData) return null;

	const firstCountry = Object.values(productionData)[0];
	if (!Array.isArray(firstCountry) || firstCountry.length === 0) return null;

	const firstItem = firstCountry[0];
	return Object.keys(firstItem).find((key) => key.startsWith("sum_"));
};

const getUniqueCountries = (periodPrices, globalProduct) => {
	if (!Array.isArray(periodPrices)) return [];

	// Get unique keys from periodPrices
	const uniqueKeys = [...new Set(periodPrices.map((item) => item.key))].filter((key) => key !== "EU");

	if (globalProduct === "Sugar") {
		// For Sugar, return only countries with valid regions (Region 1, 2, 3)
		return europeanCountries
			.filter((country) => country.region?.startsWith("Region"))
			.map((country) => ({
				...country,
				text: country.region, // Use region as display text for Sugar
				value: country.region, // Use region as value for Sugar
			}));
	}

	// For other products, use normal country mapping
	return uniqueKeys
		.map((key) => europeanCountries.find((country) => country.value === key))
		.filter(Boolean);
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
	console.log("Selected Product Details:", selectedProductDetails);

	const pricesItems = useMemo(() => extractFields(selectedProductDetails, "prices") || [], [selectedProductDetails]);
	console.log("Prices Items:", pricesItems);

	const priceCollections = useMemo(() => (pricesItems.needsDropdown ? pricesItems.collections : []), [pricesItems]);
	const [selectedPriceCollection, setSelectedPriceCollection] = useState(priceCollections?.[0] ?? "");
	console.log("Selected Price Collection:", selectedPriceCollection);
	const collectionOptions = useMemo(() => selectedProductDetails?.[selectedPriceCollection?.value] ?? null, [selectedProductDetails, selectedPriceCollection]);

	const [priceOptions, setPriceOptions] = useState({
		product: "Japonica" ?? null,
		productType: "Avg" ?? null,
		productVar: "Avg" ?? null,
		country: "Greece",
	});

	const priceProducts = useMemo(() => {
		if (pricesItems.needsDropdown) {
			// If we have collections, use the selected collection's field
			return collectionOptions?.products ?? [];
		}

		return pricesItems.fields[0]?.products ?? [];
	}, [collectionOptions?.products, pricesItems.fields, pricesItems.needsDropdown]);

	const priceProductTypes = useMemo(() => {
		if (pricesItems.needsDropdown) {
			// If we have collections, use the selected collection's field
			return collectionOptions?.productTypes ?? [];
		}

		// If no collections, use the first field's product types
		return pricesItems.fields[0]?.productTypes ?? [];
	}, [collectionOptions?.productTypes, pricesItems.fields, pricesItems.needsDropdown]);

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

	// Add ready states
	const [isPriceConfigReady, setIsPriceConfigReady] = useState(false);
	const [isProductionConfigReady, setIsProductionConfigReady] = useState(false);

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

	// Separate production configs
	const productionConfigs = useMemo(
		() => {
			if (!isProductionConfigReady) return [];
			return getProductionConfigs(globalProduct, startDate, endDate, dateMetrics.differenceInDays, productionOptions.product, productionOptions.productionMetricVal, productionOptions.productType) || [];
		},
		[isProductionConfigReady, globalProduct, startDate, endDate, dateMetrics.differenceInDays, productionOptions.product, productionOptions.productionMetricVal, productionOptions.productType],
	);

	// Separate price configs
	const priceConfigs = useMemo(
		() => {
			if (!isPriceConfigReady) return [];
			const configs = [];
			if (getPriceConfigs) {
				configs.push(
					...getPriceConfigs(globalProduct, startDate, endDate, dateMetrics.differenceInDays, priceOptions.product, priceOptions.productVar, selectedPriceCollection?.value),
				);
			}

			if (getMonthlyPriceConfigs) {
				configs.push(...getMonthlyPriceConfigs(globalProduct, customDate, priceOptions.product, priceOptions.productVar, selectedPriceCollection?.value));
			}

			return configs;
		},
		[isPriceConfigReady, globalProduct, startDate, endDate, dateMetrics.differenceInDays, priceOptions.product, priceOptions.productVar, selectedPriceCollection?.value],
	);

	// Create separate useInit hooks for price and production
	const productionState = useInit(organization, productionConfigs);
	const priceState = useInit(organization, priceConfigs);

	// Combine states for components that need both
	const combinedState = {
		isLoading: priceState.state.isLoading && productionState.state.isLoading,
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

	// Add validation effects
	useEffect(() => {
		const isPriceReady = Boolean(
			globalProduct
			&& dateMetrics.isValidDateRange
			&& Object.values(priceOptions).some(Boolean)
			&& !priceState.state.error,
		);
		setIsPriceConfigReady(isPriceReady);
	}, [globalProduct, dateMetrics.isValidDateRange, priceOptions, priceState.state.error]);

	useEffect(() => {
		const isProductionReady = Boolean(
			globalProduct
			&& Object.values(productionOptions).some(Boolean)
			&& !productionState.state.error,
		);
		setIsProductionConfigReady(isProductionReady);
	}, [globalProduct, productionOptions, productionState.state.error]);

	const units = useMemo(() => ({
		priceUnit: priceConfigs?.[0]?.unit || "",
		productionUnit: productionConfigs?.[0]?.unit || "",
	}), [priceConfigs, productionConfigs]);

	const { isPriceLoading, isProductionLoading, dataSets, minutesAgo } = state;
	console.log("DATASETS:", dataSets);

	const pricesTimeline = useMemo(() => dataSets?.pricesTimeline || [], [dataSets]);
	const periodPrices = useMemo(() => dataSets?.periodPrices || [], [dataSets]);
	const monthlyPrices = useMemo(() => dataSets?.monthlyPrices || [], [dataSets]);
	const maxPrices = useMemo(() => dataSets?.maxPrice || [], [dataSets]);
	const isValidPrice = useMemo(() => isValidArray(pricesTimeline), [pricesTimeline]);
	const isValidPeriodPrices = useMemo(() => isValidArray(periodPrices), [periodPrices]);
	const isValidMonthlyPrices = useMemo(() => isValidArray(monthlyPrices), [monthlyPrices]);
	const maxPrice = useMemo(() => {
		// Ensure maxPrices is an array
		const maxPricesArray = Array.isArray(maxPrices) ? maxPrices : [maxPrices].filter(Boolean);

		if (maxPricesArray.length === 0) return 100; // Default value if empty

		// Filter out undefined/null values and get max
		const validPrices = maxPricesArray
			.filter((item) => item && typeof item.max_price === "number")
			.map((item) => item.max_price);

		// If no valid prices found, return default
		if (validPrices.length === 0) return 100;

		return Math.max(...validPrices);
	}, [maxPrices]);

	const existingCountries = useMemo(() => getUniqueCountries(pricesTimeline, globalProduct), [pricesTimeline, globalProduct]);

	const productDropdownContent = useMemo(() => ([
		{
			id: "product",
			items: products,
			value: globalProduct,
			label: "Select Product",
			onChange: (event) => {
				const newProduct = event.target.value;
				dispatch({ type: "FETCH_START" });

				// Find the new product details
				const newProductDetails = products.find((p) => p.text === newProduct);
				const productionFields = extractFields(newProductDetails, "production").fields;
				const pricesFields = extractFields(newProductDetails, "prices");

				// Handle price collections if they exist
				const initialPriceCollection = pricesFields.collections?.[0] ?? null;
				const collectionConfig = initialPriceCollection ? newProductDetails[initialPriceCollection.value] : null;

				let initialPriceProduct;
				let initialPriceType;
				if (pricesFields.needsDropdown && collectionConfig) {
					// Use collection config if collections exist
					initialPriceProduct = collectionConfig.products?.[0]?.text ?? collectionConfig.products?.[0] ?? null;
					initialPriceType = collectionConfig.productTypes?.[0] ?? null;
				} else {
					// Otherwise use direct fields
					initialPriceProduct = pricesFields.fields[0]?.products?.[0]?.text ?? pricesFields.fields[0]?.products?.[0] ?? null;
					initialPriceType = pricesFields.fields[0]?.productTypes?.[0] ?? null;
				}

				const initialProduct = productionFields[0]?.products?.[0] ?? null;
				const initialType = productionFields[0]?.productTypes?.[0] ?? null;
				const initialMetric = productionFields[0]?.productionMetrics?.[0] ?? null;

				setGlobalProduct(newProduct);
				setSelectedPriceCollection(initialPriceCollection);

				setProductionOptions((prev) => ({
					...prev,
					product: initialProduct ?? null,
					productType: initialType ?? null,
					productionMetricType: initialMetric?.text ?? null,
					productionMetricVal: initialMetric?.value ?? null,
				}));

				setPriceOptions({
					product: initialPriceProduct,
					productType: initialPriceType?.text ?? initialPriceType ?? null,
					productVar: initialPriceType?.value ?? initialPriceType ?? null,
					country: null,
				});
			},
		},
	].map((item) => ({
		...item,
	}))), [dispatch, globalProduct]);

	useEffect(() => {
		if (selectedProduct) { setGlobalProduct(selectedProduct); }
	}, [selectedProduct]);

	// PRODUCTION GRAPHS
	// Function to categorize production data by country
	const transformProductionData = useCallback((productionData, yearPicker, sumFieldName) => {
		const timestamp = `${yearPicker}-01-01T00:00:00`;
		const euData = productionData.EU?.find((item) => item.timestamp === timestamp)?.[sumFieldName] || 0;

		const countryMap = new Map(
			Object.entries(productionData)
				.filter(([name]) => name !== "EU")
				.map(([name, data]) => {
					// For Sugar, group by region instead of country
					if (globalProduct === "Sugar") {
						const country = europeanCountries.find((c) => c.value === name);
						return [
							country?.region || name,
							data.find((item) => item.interval_start === timestamp)?.[sumFieldName] || 0,
						];
					}

					return [
						name,
						data.find((item) => item.interval_start === timestamp)?.[sumFieldName] || 0,
					];
				}),
		);

		// For Sugar, aggregate production by region
		if (globalProduct === "Sugar") {
			const regionMap = new Map();
			for (const [region, production] of countryMap) {
				if (region?.startsWith("Region")) {
					const currentTotal = regionMap.get(region) || 0;
					regionMap.set(region, currentTotal + production);
				}
			}

			return {
				euProduction: euData,
				countryData: Array.from(regionMap, ([label, production]) => ({
					label,
					production,
				})).sort((a, b) => a.label.localeCompare(b.label)),
			};
		}

		return {
			euProduction: euData,
			countryData: Array.from(countryMap, ([label, production]) => ({
				label,
				production,
			})).sort((a, b) => a.label.localeCompare(b.label)),
		};
	}, [globalProduct]);

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

		// Filter out EU and transform codes to names/regions
		const result = Object.keys(grouped)
			.filter((code) => code !== "EU" && code !== "EU Average")
			.reduce((acc, code) => {
				if (globalProduct === "Sugar") {
					const country = europeanCountries.find((c) => c.region === code);
					if (country?.region?.startsWith("Region")) {
						// Aggregate data by region for Sugar
						const regionData = acc[country.region] || [];
						acc[country.region] = [...regionData, ...grouped[code]];
					}
				} else {
					const countryName = europeanCountries.find((country) => country.value === code)?.text;
					if (countryName) {
						acc[countryName] = grouped[code];
					}
				}

				return acc;
			}, {});

		// Sort by region/country names
		return Object.keys(result)
			.sort((a, b) => a.localeCompare(b))
			.reduce((acc, key) => {
				acc[key] = result[key];
				return acc;
			}, {});
	}), [production, globalProduct]);

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
					productionState.dispatch({ type: "FETCH_PRODUCTION_START" });
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
	}, [productionProducts, productTypes, productionMetrics, productionOptions.product, productionOptions.productType, productionOptions.productionMetricType, productionState, handleProductionMetricChange]);

	const europeOverview = useMemo(() => {
		const productionData = productionOptions.productionVal
			? productionByCountry.find((data) => Object.values(data)[0]?.some((item) => item[`sum_${productionOptions.productionVal}`] !== undefined))
			: productionByCountry[0];

		// Early return with specific warnings if no production data
		if (!productionData) {
			return {
				charts: {
					gauge: { warning: "No production data available for the selected options" },
					pie: { warning: "No production distribution data available for the selected options" },
					bars: { warning: "No historical production data available for the selected options" },
				},
			};
		}

		// Get the sumfield and validate
		const sumFieldName = getProductionSumField(productionData);
		if (!sumFieldName) {
			return {
				charts: {
					gauge: { warning: "Unable to determine production metrics for the selected options" },
					pie: { warning: "Unable to determine production distribution metrics" },
					bars: { warning: "Unable to determine historical production metrics" },
				},
			};
		}

		const { countryData } = transformProductionData(productionData, productionOptions.year, sumFieldName);
		const euMaxValue = getMaxValue(maxProduction, sumFieldName);
		const countryMaxValue = getMaxValue(maxProduction, sumFieldName, priceOptions.country);

		const totalProduction = countryData.reduce((sum, data) => sum + data.production, 0);

		return {
			countryData,
			countryMaxValue,
			charts: {
				gauge: {
					data: {
						value: totalProduction,
						subtitle: "EU's Annual Production",
					},
					shape: "bullet",
					range: [0, euMaxValue],
					color: "third",
					suffix: ` ${units.productionUnit}`,
					warning: totalProduction === 0 ? `No production data available for ${productionOptions.year}` : null,
				},
				pie: {
					data: isValidArray(countryData) ? [{
						labels: countryData.map((item) => item.label),
						values: countryData.map((item) => item.production),
						color: agriColors,
						type: "pie",
						sort: false,
					}] : [],
					warning: !isValidArray(countryData) || countryData.every((item) => item.production === 0)
						? `No production distribution data available for ${productionOptions.year}`
						: null,
					title: globalProduct === "Sugar" ? "Production by Region" : "Production by Country",
				},
				bars: {
					data: Object.entries(productionData).map(([key, values], index) => {
						const years = generateYearsArray(2010, 2025);
						const dataMap = new Map(
							values.map((item) => [
								item.timestamp || item.interval_start,
								item[sumFieldName] || 0,
							]),
						);
						const completeData = years.map((date) => {
							const timestamp = `${date}-01-01T00:00:00`;
							return dataMap.get(timestamp) || 0;
						});

						return {
							x: years,
							y: completeData,
							type: "bar",
							title: key,
							color: agColorKeys[index % agColorKeys.length],
						};
					}),
					title: globalProduct === "Sugar" ? "Annual Production by Region" : "Annual Production by Country",
					xaxis: { showticklabels: true, tickmode: "linear", tickangle: 45 },
					warning: Object.entries(productionData).length === 0 ? "No historical production data available" : null,
				},
			},
		};
	}, [globalProduct, productionOptions.productionVal, productionOptions.year, productionByCountry, transformProductionData, maxProduction, priceOptions.country, units.productionUnit]);

	// PRICES GRAPHS
	const priceDropdowns = useMemo(() => {
		const dropdowns = [];

		if (priceCollections?.length) {
			dropdowns.push({
				id: "priceCategory",
				items: priceCollections,
				value: selectedPriceCollection.text,
				label: "Select Product Category",
				onChange: (event) => {
					priceState.dispatch({ type: "FETCH_PRICE_START" });
					const selectedCollection = priceCollections.find(
						(category) => category.text === event.target.value,
					);
					setSelectedPriceCollection(selectedCollection);
					setPriceOptions((prev) => ({
						...prev,
						product: collectionOptions?.products?.[0] ?? null,
						productType: collectionOptions?.productTypes?.[0]?.text ?? collectionOptions?.productTypes?.[0] ?? null,
						productVar: collectionOptions?.productTypes?.[0]?.value ?? collectionOptions?.productTypes?.[0] ?? null,
					}));
				},
			});
		}

		if (priceProducts?.length) {
			dropdowns.push({
				id: "product",
				items: priceProducts,
				value: priceOptions.product,
				label: "Select Product Type",
				onChange: (event) => {
					priceState.dispatch({ type: "FETCH_PRICE_START" });
					setPriceOptions((prev) => ({ ...prev, product: event.target.value }));
				},
			});
		}

		// Then add product types if available
		if (priceProductTypes?.length) {
			dropdowns.push({
				id: "productType",
				items: priceProductTypes,
				value: priceOptions.productType,
				label: priceCollections?.length ? "Select Price Type" : "Select Product Variety",
				onChange: (event) => {
					priceState.dispatch({ type: "FETCH_PRICE_START" });
					setPriceOptions((prev) => ({
						...prev,
						productType: event.target.value,
						productVar: priceProductTypes.find((type) => type.text === event.target.value)?.value ?? event.target.value,
					}));
				},
			});
		}

		// Finally add country selection if there are countries available
		if (existingCountries?.length) {
			const countryItems = globalProduct === "Sugar"
				? [...new Set(existingCountries
					.filter((country) => country.region && country.region.startsWith("Region"))
					.map((country) => country.region))]
					.map((region) => ({ text: region, value: region }))
				: existingCountries;

			dropdowns.push({
				id: "country",
				items: countryItems,
				value: priceOptions.country,
				label: globalProduct === "Sugar" ? "Select Region" : "Select Country",
				onChange: (event) => {
					setPriceOptions((prev) => ({ ...prev, country: event.target.value }));
				},
			});
		}

		return dropdowns;
	}, [priceCollections, priceProducts, priceProductTypes, existingCountries, selectedPriceCollection.text, priceState, collectionOptions?.products, collectionOptions?.productTypes, priceOptions.product, priceOptions.productType, priceOptions.country, globalProduct]);

	useEffect(() => {
		if (selectedProductDetails) {
			const priceFields = extractFields(selectedProductDetails, "prices").fields;

			setPriceOptions((prev) => ({
				...prev,
				// Only update if current values aren't valid options
				product: priceProducts.some((p) => p.text === prev.product || p === prev.product)
					? prev.product
					: priceFields[0]?.products?.[0]?.text ?? priceFields[0]?.products?.[0],
				productType: priceProductTypes.some((p) => p.text === prev.productType || p === prev.productType)
					? prev.productType
					: priceFields[0]?.productTypes?.[0]?.text ?? priceFields[0]?.productTypes?.[0],
				productVar: priceProductTypes.some((p) => p.value === prev.productVar || p === prev.productVar)
					? prev.productVar
					: priceFields[0]?.productTypes?.[0]?.value ?? priceFields[0]?.productTypes?.[0],
			}));
		}
	}, [selectedProductDetails, priceProducts, priceProductTypes]);

	useEffect(() => {
		// Only set initial collection if no collection is currently selected
		if (!priceCollections?.length || selectedPriceCollection) return;

		// Set initial collection only if selectedPriceCollection is empty/null
		setSelectedPriceCollection(priceCollections[0].text);
	}, [priceCollections, selectedPriceCollection]);

	useEffect(() => {
		if (pricesItems.needsDropdown) {
			setPriceOptions((prev) => ({
				...prev,
				product: collectionOptions?.products?.some((p) => p.text === prev.product || p === prev.product)
					? prev.product
					: collectionOptions?.products?.[0]?.text ?? collectionOptions?.products?.[0] ?? prev.product,
				productType: collectionOptions?.productTypes?.some((p) => p.text === prev.productType || p === prev.productType)
					? prev.productType
					: collectionOptions?.productTypes?.[0]?.text ?? collectionOptions?.productTypes?.[0] ?? prev.productType,
				productVar: collectionOptions?.productTypes?.some((p) => p.value === prev.productVar || p === prev.productVar)
					? prev.productVar
					: collectionOptions?.productTypes?.[0]?.value ?? collectionOptions?.productTypes?.[0] ?? prev.productVar,
			}));
		} else {
			// If no dropdowns needed, respect existing values if they're valid options
			if (priceProducts?.length) {
				setPriceOptions((prev) => ({
					...prev,
					product: priceProducts.some((p) => p.text === prev.product || p === prev.product)
						? prev.product
						: priceProducts[0]?.text ?? priceProducts[0] ?? prev.product,
				}));
			}

			if (priceProductTypes?.length) {
				setPriceOptions((prev) => ({
					...prev,
					productType: priceProductTypes.some((p) => p.text === prev.productType || p === prev.productType)
						? prev.productType
						: priceProductTypes[0]?.text ?? priceProductTypes[0] ?? prev.productType,
					productVar: priceProductTypes.some((p) => p.value === prev.productVar || p === prev.productVar)
						? prev.productVar
						: priceProductTypes[0]?.value ?? priceProductTypes[0] ?? prev.productVar,
				}));
			}
		}
	}, [priceProducts, priceProductTypes, selectedPriceCollection, pricesItems,
		selectedProductDetails, collectionOptions?.products, collectionOptions?.productTypes]);

	useEffect(() => {
		if (existingCountries?.length) {
			// Check if current country/region exists in new list
			const currentExists = existingCountries.some(
				(country) => (globalProduct === "Sugar"
					? country.region === priceOptions.country
					: country.text === priceOptions.country),
			);

			// If current selection doesn't exist in new list, set to first available option
			if (!currentExists) {
				setPriceOptions((prev) => ({
					...prev,
					country: globalProduct === "Sugar"
						? existingCountries.find((c) => c.region?.startsWith("Region"))?.region
						: existingCountries[0].text,
				}));
			}
		}
	}, [globalProduct, existingCountries, priceOptions.country]);

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
		const countryObj = globalProduct === "Sugar"
			? existingCountries.find((country) => country.region === priceOptions.country)
			: existingCountries.find((country) => country.text === priceOptions.country);

		const countryKey = globalProduct === "Sugar"
			? countryObj?.region
			: countryObj?.value;

		return [
			// Production gauge
			{
				data: {
					value: dataSets?.periodProduction
						?.find((item) => item.key === (globalProduct === "Sugar"
							? priceOptions.country // For Sugar, use region directly as key
							: existingCountries.find((c) => c.text === priceOptions.country)?.value)) // For others, lookup country value
						?.[Object.keys(dataSets.periodProduction[0] || {}).find((key) => key.startsWith("sum_"))] ?? null,
					subtitle: globalProduct === "Sugar"
						? "Region's Period Production"
						: "Country's Period Production",
				},
				range: [0, europeOverview?.countryMaxValue],
				color: "third",
				suffix: `${units.productionUnit}`,
				shape: "angular",
				warning: dataSets?.periodProduction
					?.find((item) => item.key === (globalProduct === "Sugar"
						? priceOptions.country
						: existingCountries.find((c) => c.text === priceOptions.country)?.value))
					?.[Object.keys(dataSets.periodProduction[0] || {}).find((key) => key.startsWith("sum_"))]
					? null
					: `No production data available for ${priceOptions.country}`,
			},
			// Monthly price gauge
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
				warning: !isValidMonthlyPrices || !monthlyPrices.find((item) => item.key === countryKey)?.avg_price
					? `No price data available for ${priceOptions.country} in the current month`
					: null,
			},
			// Timeline plot
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
				warning: !isValidPrice || !pricesTimeline.find((item) => item.key === countryKey)?.avg_price
					? `No price timeline data available for ${priceOptions.country}`
					: pricesTimeline.filter((item) => item.key === countryKey).length === 1
						? "Only one data point available - unable to show timeline"
						: null,
			},
			// Period price gauge
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
				warning: !isValidPeriodPrices || !periodPrices.find((item) => item.key === countryKey)?.avg_price
					? `No price data available for ${priceOptions.country} in the selected period`
					: null,
			},
		];
	}, [globalProduct, existingCountries, dataSets.periodProduction, europeOverview?.countryMaxValue, units.productionUnit, units.priceUnit, priceOptions.country, isValidMonthlyPrices, monthlyPrices, isValidPrice, pricesTimeline, isValidPeriodPrices, periodPrices]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={productDropdownContent} />
			{/* PRODUCTION CARDS */}
			<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1} sx={{ minHeight: "500px" }}>
				{state.isLoading ? (<LoadingIndicator />
				) : dataSets.productProduction ? (
					<>
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
							<Card title="EU's Annual Overview" footer={cardFooter({ minutesAgo })} sx={{ display: "flex", flexDirection: "column" }}>
								<Grid item xs={12} md={12} display="flex" justifyContent="flex-end">
									<StickyBand sticky={false} dropdownContent={productionDropdowns} formRef={yearPickerRef} formContent={yearPickerProps} />
								</Grid>
								{isProductionLoading ? (<LoadingIndicator />
								) : dataSets.productProduction.length === 0 ? (
									<DataWarning message="No Available Production Data for the Specified Options Combination" />
								) : (
									<Grid container display="flex" direction="row" justifyContent="space-evenly" sx={{ flex: 1 }}>
										<Grid container display="flex" direction="row" justifyContent="space-evenly" sx={{ flex: 1 }}>
											<Grid item xs={12} sm={12} md={12} justifyContent="center" alignItems="center">
												{isProductionLoading ? (<LoadingIndicator />
												) : europeOverview?.charts.gauge.warning ? (<DataWarning message={europeOverview.charts.gauge.warning} />
												) : (
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
												{isProductionLoading ? (<LoadingIndicator />
												) : europeOverview?.charts.pie.warning ? (<DataWarning message={europeOverview.charts.pie.warning} />
												) : (
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
										</Grid>
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
							<Card title="Production per Year" footer={cardFooter({ minutesAgo })} sx={{ display: "flex", flexDirection: "column" }}>
								{isProductionLoading ? (<LoadingIndicator />
								) : !dataSets.productProduction || dataSets.productProduction.length === 0 ? (
									<DataWarning message="No Available Data for the Specified Options Combination" />
								) : (
									<Grid item xs={12} sm={12} justifyContent="center" alignItems="center" sx={{ flex: 1 }}>
										{europeOverview?.charts.bars.data ? (
											<Plot
												scrollZoom
												height="459px"
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
					</>
				) : (
					<DataWarning message="No Available Production Data for the Specified Product" />
				)}
			</Grid>
			{/* PRICE CARDS */}
			<Grid item xs={12} md={12} mb={2} alignItems="center" flexDirection="column">
				<Card title="Product per Country" footer={cardFooter({ minutesAgo })}>
					<StickyBand sticky={false} dropdownContent={priceDropdowns} formRef={formRefDate} formContent={formContentDate} />
					{state.isLoading ? (<LoadingIndicator />
					) : existingCountries.length > 0 ? (dateMetrics.isValidDateRange ? (isPriceLoading ? (<LoadingIndicator />
					) : (
						<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
							{countryOverview.map((plotData, index) => {
								const isTimelinePlot = index === countryOverview.length - 2;
								const isProductionGauge = index === 0;

								return (
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
										{isProductionGauge && isProductionLoading ? (<LoadingIndicator />
										) : plotData.warning ? (<DataWarning message={plotData.warning} />
										) : isTimelinePlot ? (<Plot scrollZoom data={plotData.data} xaxis={plotData.xaxis} yaxis={plotData.yaxis} />
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
								);
							})}
						</Grid>
					)
					) : (<DataWarning message="Please Select a Valid Date Range" />)
					) : (<DataWarning message="No Available Pricing Data For the Specified Options' Combination" />
					)}
				</Card>
			</Grid>
		</Grid>
	);
};

export default memo(ProductsScreen);
