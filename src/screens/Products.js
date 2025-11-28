/* eslint-disable max-len */
import { useLocation } from "react-router-dom";
import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useEffect, useRef } from "react";

import colors from "../_colors.scss";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import StickyBand from "../components/StickyBand.js";
import {
	extractFields, getCustomDateTime, calculateDates, calculateDifferenceBetweenDates,
	debounce, isValidArray, generateYearsArray, groupByKey,
	findKeyByText, sumByKey,
} from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, DataWarning } from "../utils/rendering-items.js";
import { europeanCountries, products } from "../utils/useful-constants.js";

import { ProductionData } from "./ProductsProduction.js";
import { PriceData } from "./ProductsPrice.js";

const customDate = getCustomDateTime(2024, 12);
const { year } = calculateDates(customDate);

const currentYear = new Date().getFullYear();

const agriColors = Array.from({ length: 20 }, (_, i) => colors[`ag${i + 1}`]);
const agColorKeys = Array.from({ length: 20 }, (_, i) => `ag${i + 1}`);

const getProductionSumField = (productionData) => {
	if (!productionData) return null;

	const firstCountry = Object.values(productionData)[0];
	if (!Array.isArray(firstCountry) || firstCountry.length === 0) return null;

	const firstItem = firstCountry[0];
	return Object.keys(firstItem).find((key) => key.startsWith("sum_"));
};

const getUniqueCountries = (periodPrices, globalProduct) => {
	if (!Array.isArray(periodPrices)) return [];

	const uniqueKeys = new Set();
	for (const item of periodPrices) {
		if (item.key && item.key !== "EU") uniqueKeys.add(item.key);
	}

	if (globalProduct === "Sugar") {
		const regions = new Map();
		for (const country of europeanCountries) {
			if (country.region?.startsWith("Region")) {
				regions.set(country.region, {
					...country,
					text: country.region,
					value: country.region,
				});
			}
		}

		return [...regions.values()];
	}

	return [...uniqueKeys]
		.map((key) => europeanCountries.find((country) => country.value === key))
		.filter(Boolean);
};

const processDataByKey = (dataSets, keyPrefix) => {
	if (!dataSets) return [];
	return Object.keys(dataSets)
		.filter((key) => key.startsWith(keyPrefix))
		.map((key) => dataSets[key] || []);
};

const getMaxValue = (maxProd, prodTypeVal, country = "EU") => [
	maxProd.flat().find((item) => item?.key === country && Object.keys(item || {}).includes(`max_${prodTypeVal}`))?.[`max_${prodTypeVal}`] || 0,
];

const useTimeoutFlag = (isLoading, timeoutMs = 10_000) => {
	const [timedOut, setTimedOut] = useState(false);

	useEffect(() => {
		if (!isLoading) {
			setTimedOut(false);
			return;
		}

		setTimedOut(false);
		const id = setTimeout(() => {
			setTimedOut((prev) => (isLoading ? true : prev));
		}, timeoutMs);

		return () => clearTimeout(id);
	}, [isLoading, timeoutMs]);

	return [timedOut, setTimedOut];
};

const ProductsScreen = () => {
	const location = useLocation();
	const selectedProduct = location.state?.selectedProduct;
	const [startDate, setStartDate] = useState("2024-01-01");
	const [endDate, setEndDate] = useState("2024-12-31");
	const [globalProduct, setGlobalProduct] = useState(selectedProduct || "Rice");
	const [isSugar, setIsSugar] = useState(globalProduct === "Sugar");

	// Find the selected product's details from products array
	const selectedProductDetails = findKeyByText(products, globalProduct, true);

	const debouncedSetDate = useMemo(
		() => debounce((date, setter) => {
			const { currentDate } = calculateDates(date);
			setter(currentDate);
		}, 2200),
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

	const {
		productionOptions,
		setProductionOptions,
		productionProducts,
		productTypes,
		productionMetrics,
		handleProductionMetricChange,
		productionState,
		productionUnit,
	} = ProductionData(globalProduct, selectedProductDetails, startDate, endDate, dateMetrics);

	const {
		priceOptions,
		setPriceOptions,
		selectedPriceCollection,
		setSelectedPriceCollection,
		priceProducts,
		priceProductTypes,
		priceCollections,
		priceState,
		priceUnit,
	} = PriceData(globalProduct, selectedProductDetails, startDate, endDate, dateMetrics);

	// Combine states for components that need both
	const combinedState = useMemo(() => ({
		isLoading: priceState.state.isLoading && productionState.state.isLoading,
		isPriceLoading: priceState.state.isPriceLoading,
		isProductionLoading: productionState.state.isProductionLoading,
		minutesAgo: Math.max(priceState.state.minutesAgo, productionState.state.minutesAgo),
		dataSets: {
			...productionState.state.dataSets,
			...priceState.state.dataSets,
		},
	}), [priceState, productionState]);

	// Destructure after memoization
	const { isPriceLoading, isProductionLoading, dataSets, minutesAgo } = combinedState;

	const dispatch = useCallback((action) => {
		const actionType = action.type.toUpperCase();

		if (actionType.includes("PRICE")) {
			priceState.dispatch(action);
		} else if (actionType.includes("PRODUCTION")) {
			productionState.dispatch(action);
		} else {
			// Broadcast to both for generic actions
			priceState.dispatch(action);
			productionState.dispatch(action);
		}
	}, [priceState, productionState]);

	const units = useMemo(() => ({
		priceUnit: priceUnit || "",
		productionUnit: productionUnit || "",
	}), [priceUnit, productionUnit]);

	const [productionTimeoutReached, setProductionTimeoutReached] = useTimeoutFlag(isProductionLoading, 12_000);
	const [priceTimeoutReached, setPriceTimeoutReached] = useTimeoutFlag(isPriceLoading, 12_000);

	const hasProductionData = dataSets
		&& dataSets.productProduction
		&& (Array.isArray(dataSets.productProduction) ? dataSets.productProduction.length > 0 : !!dataSets.productProduction);

	const priceData = useMemo(() => ({
		timeline: dataSets?.pricesTimeline || [],
		period: dataSets?.periodPrices || [],
		monthly: dataSets?.monthlyPrices || [],
		maxPrices: dataSets?.maxPrice || [],
	}), [dataSets]);

	const priceValidations = useMemo(() => ({
		timeline: isValidArray(priceData.timeline),
		period: isValidArray(priceData.period),
		monthly: isValidArray(priceData.monthly),
	}), [priceData]);

	const maxPrice = useMemo(() => {
		// Ensure maxPrices is an array
		const maxPricesArray = isValidArray(priceData.maxPrices) ? priceData.maxPrices : [priceData.maxPrices].filter(Boolean);

		if (maxPricesArray.length === 0) return 100; // Default value if empty

		let max = -Infinity;
		for (const item of maxPricesArray) {
			if (item?.max_price > max) {
				max = item.max_price;
			}
		}

		return max === -Infinity ? 100 : max;
	}, [priceData.maxPrices]);

	const existingCountries = useMemo(() => getUniqueCountries(priceData.timeline, globalProduct), [priceData.timeline, globalProduct]);

	const globalProductDropdownContent = useMemo(() => {
		const handleProductChange = (event) => {
			const newProduct = event.target.value;
			dispatch({ type: "FETCH_START" });

			// Reset timeout flags when changing products
			setProductionTimeoutReached(false);
			setPriceTimeoutReached(false);

			// Find the new product details
			const newProductDetails = findKeyByText(products, newProduct, true);
			const productionFields = extractFields(newProductDetails, "production").fields;
			const pricesFields = extractFields(newProductDetails, "prices");

			// Handle price collections if they exist
			const initialPriceCollection = pricesFields.collections?.[0] ?? null;
			const collectionConfig = initialPriceCollection ? newProductDetails[initialPriceCollection.value] : null;

			let initialPriceProduct;
			let initialPriceType;
			if (pricesFields?.needsDropdown && collectionConfig) {
				// Use collection config if collections exist
				initialPriceProduct = collectionConfig.products?.[0]?.text ?? collectionConfig.products?.[0] ?? "";
				initialPriceType = collectionConfig.productTypes?.[0] ?? "";
			} else {
				// Otherwise use direct fields
				initialPriceProduct = pricesFields.fields[0]?.products?.[0]?.text ?? pricesFields.fields[0]?.products?.[0] ?? "";
				initialPriceType = pricesFields.fields[0]?.productTypes?.[0] ?? "";
			}

			const initialProduct = productionFields[0]?.products?.[0] ?? "";
			const initialType = productionFields[0]?.productTypes?.[0] ?? "";
			const initialMetric = productionFields[0]?.productionMetrics?.[0] ?? "";

			setGlobalProduct(newProduct);
			setIsSugar(newProduct === "Sugar");
			setSelectedPriceCollection(initialPriceCollection);

			setProductionOptions((prev) => ({
				...prev,
				product: initialProduct,
				productType: initialType,
				productionMetricType: initialMetric?.text ?? "",
				productionMetricVal: initialMetric?.value ?? "",
			}));

			setPriceOptions({
				product: initialPriceProduct,
				productType: initialPriceType?.text ?? initialPriceType ?? "",
				productVar: initialPriceType?.value ?? initialPriceType ?? "",
				country: "",
			});
		};

		return [{
			id: "product",
			items: products,
			value: globalProduct,
			label: "Select Product",
			onChange: handleProductChange,
		}];
	}, [dispatch, globalProduct, setPriceOptions, setPriceTimeoutReached, setProductionOptions, setProductionTimeoutReached, setSelectedPriceCollection]);

	// PRODUCTION GRAPHS
	// Function to categorize production data by country
	const transformProductionData = useCallback((productionData, yearPicker, sumFieldName) => {
		const timestamp = `${yearPicker}-01-01T00:00:00`;

		// For Sugar products, use early return optimization
		if (isSugar) {
			const countryMap = new Map(europeanCountries.map((c) => [c.value, c]));

			const regionDataPoints = Object.entries(productionData)
				.filter(([name]) => name !== "EU")
				.map(([name, data]) => {
					const production = data.find((item) => item.interval_start === timestamp)?.[sumFieldName] || 0;
					const country = countryMap.get(name);
					return { label: country?.region || name, production };
				})
				.filter((item) => item.label?.startsWith("Region"));

			const regionSums = sumByKey(regionDataPoints, "label", "production");

			return {
				countryData: Object.entries(regionSums)
					.map(([label, production]) => ({ label, production }))
					.sort((a, b) => a.label.localeCompare(b.label)),
			};
		}

		const countryData = Object.entries(productionData)
			.filter(([name]) => name !== "EU")
			.map(([name, data]) => ({
				label: name,
				production: data.find((item) => item.interval_start === timestamp)?.[sumFieldName] || 0,
			}))
			.sort((a, b) => a.label.localeCompare(b.label));

		return { countryData };
	}, [isSugar]);

	const production = useMemo(() => processDataByKey(dataSets, "productProduction"), [dataSets]);
	const maxProduction = useMemo(() => processDataByKey(dataSets, "maxProduction"), [dataSets]);

	const productionByCountry = useMemo(() => {
		// Create lookup maps once, outside the loop
		const countryMaps = {
			byCode: new Map(europeanCountries.map((c) => [c.value, c])),
			byRegion: new Map(europeanCountries.filter((c) => c.region).map((c) => [c.region, c])),
		};

		// Handle Greek country mapping
		const greekCountry = countryMaps.byCode.get("EL");
		if (greekCountry) {
			countryMaps.byCode.set("GR", greekCountry);
		}

		return production.map((productionData) => {
			const grouped = groupByKey(productionData, "key");

			// Pre-filter keys once
			const validEntries = Object.entries(grouped).filter(([code]) => code !== "EU" && code !== "EU Average");

			if (isSugar) {
				// Sugar path: aggregate by region with early filtering
				const regionMap = new Map();

				for (const [code, data] of validEntries) {
					const country = countryMaps.byRegion.get(code);
					if (country?.region?.startsWith("Region")) {
						const existing = regionMap.get(country.region);
						regionMap.set(
							country.region,
							existing ? [...existing, ...data] : data,
						);
					}
				}

				// Convert to sorted object
				return [...regionMap.entries()]
					.sort(([a], [b]) => a.localeCompare(b))
					.reduce((acc, [region, data]) => {
						acc[region] = data;
						return acc;
					}, {});
			}

			// Non-Sugar path: map by country name
			const countryMap = new Map();

			for (const [code, data] of validEntries) {
				const country = countryMaps.byCode.get(code);
				if (country?.text) {
					countryMap.set(country.text, data);
				}
			}

			// Convert to sorted object
			return [...countryMap.entries()]
				.sort(([a], [b]) => a.localeCompare(b))
				.reduce((acc, [name, data]) => {
					acc[name] = data;
					return acc;
				}, {});
		});
	}, [production, isSugar]);

	const yearPickerProps = useMemo(() => [
		{
			customType: "date-picker",
			width: "150px",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date(`${year}-01-01`),
			minDate: new Date("2010-01-01"),
			maxDate: new Date(`${currentYear}-01-01`),
			onChange: (newValue) => { if (newValue) { setProductionOptions((prev) => ({ ...prev, year: newValue.$y.toString() })); } },
		},
	], [setProductionOptions]);

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
	}, [productionProducts, productTypes, productionMetrics, productionOptions, productionState, setProductionOptions, handleProductionMetricChange]);

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

		// Pre-compute chart data configurations
		const gaugeConfig = {
			data: {
				value: totalProduction,
				subtitle: "EU's Annual Production",
			},
			shape: "bullet",
			range: [0, euMaxValue],
			color: "third",
			suffix: ` ${units.productionUnit}`,
			warning: totalProduction === 0 ? `No production data available for ${productionOptions.year}` : null,
		};

		const pieConfig = {
			data: isValidArray(countryData) ? [{
				labels: countryData.map((item) => item.label),
				values: countryData.map((item) => item.production),
				color: agriColors,
				type: "pie",
				sort: false,
			}] : [],
			warning: !isValidArray(countryData) || countryData.every((item) => item.production === 0)
				? `No production distribution data available for ${productionOptions.year}` : null,
			title: isSugar ? "Production by Region" : "Production by Country",
		};

		// Optimize bars data generation
		const years = generateYearsArray(2010, 2025);
		const barsData = Object.entries(productionData).map(([key, values], index) => {
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
		});

		const barsConfig = {
			data: barsData,
			title: isSugar ? "Annual Production by Region" : "Annual Production by Country",
			xaxis: { showticklabels: true, tickmode: "linear", tickangle: 45 },
			yaxis: { title: `Production (${units.productionUnit})` },
			warning: barsData.length === 0 ? "No historical production data available" : null,
		};

		return {
			countryData,
			countryMaxValue,
			charts: {
				gauge: gaugeConfig,
				pie: pieConfig,
				bars: barsConfig,
			},
		};
	}, [productionOptions.productionVal, productionOptions.year, productionByCountry, transformProductionData, maxProduction, priceOptions.country, units.productionUnit, isSugar]);

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
					console.log("Selected Price Collection Changed To:", selectedCollection);

					const newCollectionConfig = selectedProductDetails?.[selectedCollection?.value];
					const newProduct = newCollectionConfig.products?.[0]?.text ?? newCollectionConfig.products?.[0] ?? "";
					const newProductType = newCollectionConfig.productTypes?.[0]?.text ?? newCollectionConfig.productTypes?.[0] ?? "";
					const newProductVar = newCollectionConfig.productTypes?.[0]?.value ?? newCollectionConfig.productTypes?.[0] ?? "";

					console.log("Resetting price options for collection:",
						newProduct,
						newProductType,
						newProductVar);

					setPriceOptions({
						product: newProduct,
						productType: newProductType,
						productVar: newProductVar,
						country: "",
					});
				},
			});
		}

		if (priceProducts?.length) {
			dropdowns.push({
				id: "product",
				items: priceProducts,
				value: priceOptions.product,
				label: globalProduct === "Poultry" ? "Select Price Type" : "Select Product Type",
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
			const countryItems = isSugar
				? [...new Set(existingCountries
					.filter((country) => country.region?.startsWith("Region"))
					.map((country) => country.region))]
					.map((region) => ({ text: region, value: region }))
				: existingCountries;

			dropdowns.push({
				id: "country",
				items: countryItems,
				value: priceOptions.country,
				label: isSugar ? "Select Region" : "Select Country",
				onChange: (event) => {
					setPriceOptions((prev) => ({ ...prev, country: event.target.value }));
				},
			});
		}

		return dropdowns;
	}, [
		priceCollections, priceProducts, priceProductTypes, existingCountries,
		selectedPriceCollection.text, priceState, setSelectedPriceCollection, selectedProductDetails,
		setPriceOptions, priceOptions.product, priceOptions.productType, priceOptions.country,
		globalProduct, isSugar,
	]);

	useEffect(() => {
		if (!selectedProductDetails) return;

		const priceFields = extractFields(selectedProductDetails, "prices").fields;
		const hasValidProduct = priceProducts.some((p) => p.text === priceOptions.product || p === priceOptions.product);
		const hasValidType = priceProductTypes.some((p) => p.text === priceOptions.productType || p === priceOptions.productType);
		const hasValidVar = priceProductTypes.some((p) => p.value === priceOptions.productVar || p === priceOptions.productVar);

		if (hasValidProduct && hasValidType) return;

		setPriceOptions((prev) => {
			const initialField = priceFields[0];

			return {
				...prev,
				product: hasValidProduct ? prev.product : initialField?.products?.[0]?.text ?? initialField?.products?.[0] ?? prev.product,
				productType: hasValidType ? prev.productType : initialField?.productTypes?.[0]?.text ?? initialField?.productTypes?.[0] ?? prev.productType,
				productVar: hasValidVar ? prev.productVar : initialField?.productTypes?.[0]?.value ?? initialField?.productTypes?.[0] ?? prev.productVar,
			};
		});
	}, [selectedProductDetails, priceProducts, priceProductTypes, priceOptions.product, priceOptions.productType, priceOptions.productVar, setPriceOptions]);

	// useEffect(() => {
	// 	// Only set initial collection if no collection is currently selected
	// 	if (!priceCollections?.length || selectedPriceCollection) return;

	// 	// Set initial collection only if selectedPriceCollection is empty/null
	// 	setSelectedPriceCollection(priceCollections[0].text);
	// }, [priceCollections, selectedPriceCollection, setSelectedPriceCollection]);

	// useEffect(() => {
	// 	if (pricesItems.needsDropdown) {
	// 		setPriceOptions((prev) => ({
	// 			...prev,
	// 			product: collectionOptions?.products?.some((p) => p.text === prev.product || p === prev.product)
	// 				? prev.product : collectionOptions?.products?.[0]?.text ?? collectionOptions?.products?.[0] ?? prev.product,
	// 			productType: collectionOptions?.productTypes?.some((p) => p.text === prev.productType || p === prev.productType)
	// 				? prev.productType : collectionOptions?.productTypes?.[0]?.text ?? collectionOptions?.productTypes?.[0] ?? prev.productType,
	// 			productVar: collectionOptions?.productTypes?.some((p) => p.value === prev.productVar || p === prev.productVar)
	// 				? prev.productVar : collectionOptions?.productTypes?.[0]?.value ?? collectionOptions?.productTypes?.[0] ?? prev.productVar,
	// 		}));
	// 	} else {
	// 		// If no dropdowns needed, respect existing values if they're valid options
	// 		if (priceProducts?.length) {
	// 			setPriceOptions((prev) => ({
	// 				...prev,
	// 				product: priceProducts.some((p) => p.text === prev.product || p === prev.product)
	// 					? prev.product : priceProducts[0]?.text ?? priceProducts[0] ?? prev.product,
	// 			}));
	// 		}

	// 		if (priceProductTypes?.length) {
	// 			setPriceOptions((prev) => ({
	// 				...prev,
	// 				productType: priceProductTypes.some((p) => p.text === prev.productType || p === prev.productType)
	// 					? prev.productType : priceProductTypes[0]?.text ?? priceProductTypes[0] ?? prev.productType,
	// 				productVar: priceProductTypes.some((p) => p.value === prev.productVar || p === prev.productVar)
	// 					? prev.productVar : priceProductTypes[0]?.value ?? priceProductTypes[0] ?? prev.productVar,
	// 			}));
	// 		}
	// 	}
	// }, [priceProducts, priceProductTypes, selectedPriceCollection, pricesItems, selectedProductDetails, collectionOptions?.products, collectionOptions?.productTypes, setPriceOptions]);

	// useEffect(() => {
	// 	if (isPriceLoading) return;

	// 	if (existingCountries?.length) {
	// 		// Check if current country/region exists in new list
	// 		const currentExists = existingCountries.some(
	// 			(country) => (isSugar
	// 				? country.region === priceOptions.country
	// 				: country.text === priceOptions.country),
	// 		);

	// 		// If current selection doesn't exist in new list, set to first available option
	// 		if (!currentExists) {
	// 			setPriceOptions((prev) => ({
	// 				...prev,
	// 				country: isSugar
	// 					? existingCountries.find((c) => c.region?.startsWith("Region"))?.region : existingCountries[0].text,
	// 			}));
	// 		}
	// 	}
	// }, [existingCountries, priceOptions.country, isSugar, setPriceOptions]);
	// const isInitialMount = useRef(true);

	// useEffect(() => {
	// 	// Skip the initial mount to prevent cascading updates
	// 	if (isInitialMount.current) {
	// 		isInitialMount.current = false;
	// 		return;
	// 	}

	// 	// Don't update while loading to prevent race conditions
	// 	if (isPriceLoading) return;

	// 	// Early exit if no product details
	// 	if (!selectedProductDetails) return;

	// 	setPriceOptions((prev) => {
	// 		const newOptions = { ...prev };
	// 		let hasChanges = false;

	// 		// 1. Handle product and productType validation
	// 		if (pricesItems.needsDropdown && collectionOptions) {
	// 			// Using collection-based options
	// 			const validProduct = collectionOptions.products?.some(
	// 				(p) => p.text === prev.product || p === prev.product,
	// 			);
	// 			const validType = collectionOptions.productTypes?.some(
	// 				(p) => p.text === prev.productType || p === prev.productType,
	// 			);
	// 			const validVar = collectionOptions.productTypes?.some(
	// 				(p) => p.value === prev.productVar || p === prev.productVar,
	// 			);

	// 			if (!validProduct) {
	// 				newOptions.product = collectionOptions.products?.[0]?.text
	//                 ?? collectionOptions.products?.[0]
	//                 ?? prev.product;
	// 				hasChanges = true;
	// 			}

	// 			if (!validType) {
	// 				newOptions.productType = collectionOptions.productTypes?.[0]?.text
	//                 ?? collectionOptions.productTypes?.[0]
	//                 ?? prev.productType;
	// 				hasChanges = true;
	// 			}

	// 			if (!validVar) {
	// 				newOptions.productVar = collectionOptions.productTypes?.[0]?.value
	//                 ?? collectionOptions.productTypes?.[0]
	//                 ?? prev.productVar;
	// 				hasChanges = true;
	// 			}
	// 		} else {
	// 			// Using direct fields
	// 			if (priceProducts?.length) {
	// 				const validProduct = priceProducts.some(
	// 					(p) => p.text === prev.product || p === prev.product,
	// 				);
	// 				if (!validProduct) {
	// 					newOptions.product = priceProducts[0]?.text ?? priceProducts[0] ?? prev.product;
	// 					hasChanges = true;
	// 				}
	// 			}

	// 			if (priceProductTypes?.length) {
	// 				const validType = priceProductTypes.some(
	// 					(p) => p.text === prev.productType || p === prev.productType,
	// 				);
	// 				const validVar = priceProductTypes.some(
	// 					(p) => p.value === prev.productVar || p === prev.productVar,
	// 				);

	// 				if (!validType) {
	// 					newOptions.productType = priceProductTypes[0]?.text
	//                     ?? priceProductTypes[0]
	//                     ?? prev.productType;
	// 					hasChanges = true;
	// 				}

	// 				if (!validVar) {
	// 					newOptions.productVar = priceProductTypes[0]?.value
	//                     ?? priceProductTypes[0]
	//                     ?? prev.productVar;
	// 					hasChanges = true;
	// 				}
	// 			}
	// 		}

	// 		// 2. Handle country validation
	// 		if (existingCountries?.length) {
	// 			const currentCountryExists = existingCountries.some((country) => (
	// 				isSugar
	// 					? country.region === prev.country
	// 					: country.text === prev.country
	// 			));

	// 			if (!currentCountryExists) {
	// 				newOptions.country = isSugar
	// 					? existingCountries.find((c) => c.region?.startsWith("Region"))?.region
	// 					: existingCountries[0]?.text;
	// 				hasChanges = true;
	// 			}
	// 		}

	// 		// Only return new object if something actually changed
	// 		return hasChanges ? newOptions : prev;
	// 	});
	// }, [
	// 	isPriceLoading,
	// 	selectedProductDetails,
	// 	pricesItems.needsDropdown,
	// 	collectionOptions,
	// 	priceProducts,
	// 	priceProductTypes,
	// 	existingCountries,
	// 	isSugar,
	// 	setPriceOptions,
	// ]);

	const isInitialMount = useRef(true);
	const previousCountriesLength = useRef(0);

	// Simple effect ONLY for country validation when data loads
	useEffect(() => {
		// Skip initial mount
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		// Only run when countries actually change (not just reference)
		if (existingCountries.length === previousCountriesLength.current) {
			return;
		}

		previousCountriesLength.current = existingCountries.length;

		// Don't update while loading
		if (isPriceLoading) return;

		// Only validate country
		if (!existingCountries?.length) return;

		setPriceOptions((prev) => {
			const currentCountryExists = existingCountries.some((country) => (
				isSugar
					? country.region === prev.country
					: country.text === prev.country
			));

			if (currentCountryExists) return prev;

			return {
				...prev,
				country: isSugar
					? existingCountries.find((c) => c.region?.startsWith("Region"))?.region
					: existingCountries[0]?.text,
			};
		});
	}, [isPriceLoading, existingCountries.length, isSugar, setPriceOptions, existingCountries]);

	const formContentDate = useMemo(() => [
		{
			customType: "date-range",
			startValue: startDate,
			startLabel: "Start date",
			endValue: endDate,
			endLabel: "End date",
			labelSize: 12,
			minDate: new Date("2010-01-01"),
			maxDate: new Date(`${currentYear}-01-01`),
			onStartChange: (newValue) => handleDateChange(newValue, setStartDate),
			onEndChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [startDate, endDate, handleDateChange]);

	const getCountryKey = useCallback((country, product = globalProduct) => {
		if (product === "Sugar") {
			return existingCountries.find((c) => c.region === country)?.region;
		}

		return existingCountries.find((c) => c.text === country)?.value;
	}, [globalProduct, existingCountries]);

	const countryOverview = useMemo(() => {
		// Get the country key once to reuse across all price lookups
		const countryKey = getCountryKey(priceOptions.country);

		const countryTimeline = priceValidations.timeline ? priceData.timeline.filter((item) => item.key === countryKey) : [];
		const sumKey = Object.keys(dataSets.periodProduction?.[0] || {}).find((key) => key.startsWith("sum_"));
		const periodProductionValue = dataSets?.periodProduction
			?.find((item) => item.key === countryKey)
			?.[sumKey] ?? null;

		return [
			// Production gauge
			{
				data: {
					value: periodProductionValue,
					subtitle: `${priceOptions.country}'s Period Production`,
				},
				range: [0, europeOverview?.countryMaxValue],
				color: "third",
				suffix: ` ${units.productionUnit}`,
				shape: "angular",
				warning: periodProductionValue ? null : `No production data available for ${priceOptions.country}`,
			},
			// Monthly price gauge
			{
				data: {
					value: priceValidations.monthly
						? priceData.monthly.find((item) => item.key === countryKey)?.avg_price : null,
					subtitle: "Current Month's Average Price",
				},
				color: "secondary",
				suffix: `${units.priceUnit}`,
				shape: "angular",
				warning: !priceValidations.monthly || !priceData.monthly.find((item) => item.key === countryKey)?.avg_price
					? `No price data available for ${priceOptions.country} in the current month`
					: null,
			},
			// Timeline plot
			{
				title: `${globalProduct}'s Price Timeline`,
				data: [
					{
						x: countryTimeline.map((item) => item.interval_start),
						y: countryTimeline.map((item) => item.avg_price),
						type: "scatter",
						mode: "lines",
						color: "secondary",
						title: `${units.priceUnit}`,
					},
				],
				color: "secondary",
				yaxis: { title: `Average ${units.priceUnit}` },
				warning: !priceValidations.timeline || !priceData.timeline.find((item) => item.key === countryKey)?.avg_price
					? `No price timeline data available for ${priceOptions.country}`
					: priceData.timeline.filter((item) => item.key === countryKey).length === 1
						? "Only one data point available - unable to show timeline"
						: null,
			},
			// Period price gauge
			{
				data: {
					value: priceValidations.period
						? priceData.period.find((item) => item.key === countryKey)?.avg_price ?? null
						: null,
					subtitle: "Specified Period's Average Price",
				},
				color: "secondary",
				suffix: `${units.priceUnit}`,
				shape: "angular",
				warning: !priceValidations.period || !priceData.period.find((item) => item.key === countryKey)?.avg_price
					? `No price data available for ${priceOptions.country} in the selected period`
					: null,
			},
		];
	}, [
		getCountryKey, priceOptions.country, priceValidations.timeline, priceValidations.monthly,
		priceValidations.period, priceData.timeline, dataSets.periodProduction, europeOverview?.countryMaxValue,
		units.productionUnit, units.priceUnit, priceData.monthly, globalProduct, priceData.period,
	]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={globalProductDropdownContent} />

			{/* PRODUCTION CARDS */}
			<Grid item xs={12} md={12} alignItems="center" flexDirection="column">
				<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1} sx={{ minHeight: "500px" }}>
					{(isPriceLoading && isProductionLoading && !productionTimeoutReached) ? (
						<Grid item xs={12}><LoadingIndicator minHeight="500px" /></Grid>
					) : productionTimeoutReached ? (
						<Grid item xs={12}>
							<DataWarning minHeight="400px" message="No Available Production Data for the Specified Product" />
						</Grid>
					) : (
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
										<StickyBand sticky={false} dropdownContent={productionDropdowns} formContent={yearPickerProps} />
									</Grid>
									{isProductionLoading ? (<LoadingIndicator minHeight="405px" />
									) : (hasProductionData ? (
										<Grid container display="flex" direction="row" justifyContent="space-evenly" sx={{ flex: 1 }}>
											<Grid container display="flex" direction="row" justifyContent="space-evenly" sx={{ flex: 1 }}>
												<Grid item xs={12} sm={12} md={12} justifyContent="center" alignItems="center">
													{europeOverview?.charts.gauge.warning ? (
														<DataWarning message={europeOverview.charts.gauge.warning} />
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
													{europeOverview?.charts.pie.warning ? (
														<DataWarning message={europeOverview.charts.pie.warning} />
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
									) : (
										<DataWarning minHeight="409px" message="No Available Production Data for the Specified Options' Combination" />
									))}
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
									<Grid item xs={12} sm={12} justifyContent="center" alignItems="center" sx={{ flex: 1 }}>
										{isProductionLoading ? (<LoadingIndicator minHeight="454px" />
										) : (
											europeOverview?.charts.bars.data ? (
												<Plot
													scrollZoom
													height="459px"
													data={[...europeOverview.charts.bars.data].reverse()}
													barmode="stack"
													displayBar={false}
													title={europeOverview.charts.bars.title}
													xaxis={europeOverview.charts.bars.xaxis}
													yaxis={europeOverview.charts.bars.yaxis}
												/>
											) : (<DataWarning minHeight="459px" message="No Available Data for the Specified Options' Combination" />)
										)}
									</Grid>
								</Card>
							</Grid>
						</>
					)}
				</Grid>
			</Grid>

			{/* PRICE CARDS */}
			<Grid item xs={12} md={12} mb={2} alignItems="center" flexDirection="column">
				<Card title="Product per Country" footer={cardFooter({ minutesAgo })}>
					<StickyBand sticky={false} dropdownContent={priceDropdowns} formContent={formContentDate} />
					{(isPriceLoading && !priceTimeoutReached) ? (<LoadingIndicator minHeight="400px" />
					) : existingCountries.length === 0 ? (<DataWarning minHeight="400px" message="No Available Pricing Data For the Specified Options' Combination" />
					) : dateMetrics.isValidDateRange ? (
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
										{isProductionGauge && isPriceLoading ? (<LoadingIndicator />
										) : plotData.warning ? (<DataWarning message={plotData.warning} />
										) : isTimelinePlot ? (
											<Plot scrollZoom data={plotData.data} yaxis={plotData.yaxis} showLegend={false} />
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
					) : (<DataWarning minHeight="400px" message="Please Select a Valid Date Range" />
					)}
				</Card>
			</Grid>
		</Grid>
	);
};

export default memo(ProductsScreen);
