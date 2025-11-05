import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import PaginationControls from "../components/Pagination.js";
import StickyBand from "../components/StickyBand.js";
import efsaConfigs, { organization } from "../config/EfsaConfig.js";
import useInit from "../utils/screen-init.js";
import { isValidArray, groupByKey } from "../utils/data-handling-functions.js";
import { wrapText, truncateText, capitalizeWords, cardFooter, LoadingIndicator, DataWarning } from "../utils/rendering-items.js";
import { UNIT_CONVERSION_FACTORS } from "../utils/useful-constants.js";

const countries = ["Austria", "Belgium", "Bulgaria", "Croatia", "Denmark", "France", "Germany", "Greece", "Ireland", "Italy", "Lithuania", "Luxembourg", "Netherlands", "Poland", "Portugal", "Republic of north macedonia", "Romania", "Serbia", "Slovakia", "Spain", "Ukraine", "United kingdom"];
const BASE_COLORS = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
const GOLDEN_RATIO = 0.618_033_988_749_895;
const TARGET_UNIT = "mg/kg";
const ITEMS_PER_PAGE = 7;
const MAX_LABEL_LENGTH = 10;

const CONVERSION_CACHE = new Map();

const convertToStandardUnitCached = (value, unit) => {
	if (!CONVERSION_CACHE.has(unit)) {
		const factor = UNIT_CONVERSION_FACTORS[unit];
		if (factor === undefined) {
			console.warn(`Unknown unit: ${unit}. Using original value.`);
			CONVERSION_CACHE.set(unit, 1);
		} else {
			CONVERSION_CACHE.set(unit, factor);
		}
	}

	return value * CONVERSION_CACHE.get(unit);
};

const getDistinctColor = (index) => {
	if (index < BASE_COLORS.length) return BASE_COLORS[index];

	// Generate color based on golden ratio for better distribution
	const hue = ((index * GOLDEN_RATIO) % 1) * 360;
	const saturation = 60 + (index % 4) * 10;
	const lightness = 40 + (index % 3) * 15;

	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Create a dropdown factory function
const createDropdown = (id, label, items, value, onChange) => ({
	id, label, items, value, onChange,
});

const useEfsaState = (countryList) => {
	const [selections, setSelections] = useState({
		country: countryList[0],
		contaminant: null,
		product: null,
		contaminantTimeline: null,
		productTimeline: null,
		productContaminationTimeline: null,
		contaminantForProduct: null,
	});

	const [selectedYears, setSelectedYears] = useState({
		contaminant: "2023",
		product: "2023",
		stacked: "2023",
	});

	const [paginationState, setPaginationState] = useState({
		contaminantChart: 0,
		productChart: 0,
		stackedBarChart: 0,
	});

	// Unified update functions
	const updateSelection = useCallback((key, value) => {
		setSelections((prev) => ({ ...prev, [key]: value }));
	}, []);

	const updateYear = useCallback((type, year) => {
		setSelectedYears((prev) => ({ ...prev, [type]: year }));
	}, []);

	const updatePagination = useCallback((chart, page) => {
		setPaginationState((prev) => ({ ...prev, [chart]: page }));
	}, []);

	const resetPagination = useCallback((charts) => {
		setPaginationState((prev) => {
			const newState = { ...prev };
			for (const chart of charts) newState[chart] = 0;
			return newState;
		});
	}, []);

	return {
		selections,
		selectedYears,
		paginationState,
		updateSelection,
		updateYear,
		updatePagination,
		resetPagination,
	};
};

const useProcessedEfsaData = (rawTimeline, selectedYears) => useMemo(() => {
	if (!rawTimeline || rawTimeline.length === 0) {
		return {
			uniqueChartProducts: [],
			uniqueChartContaminants: [],
			uniqueTimelineProducts: [],
			uniqueTimelineContaminants: [],
			dataGroupedByProduct: {},
			dataGroupedByContaminant: {},
			dataStacked: {},
			timelineGroupedByProduct: {},
			timelineGroupedByContaminant: {},
		};
	}

	const yearContaminant = Number(selectedYears.contaminant);
	const yearProduct = Number(selectedYears.product);
	const yearStacked = Number(selectedYears.stacked);

	const timelineProducts = new Set();
	const timelineContaminants = new Set();
	const chartProducts = new Set();
	const chartContaminants = new Set();

	const timelineByProduct = Object.create(null);
	const timelineByContaminant = Object.create(null);
	const dataByProduct = Object.create(null);
	const dataByContaminant = Object.create(null);
	const dataStacked = Object.create(null);

	for (const item of rawTimeline) {
		const { resval, resunit, resloq, key, param, timestamp } = item;

		const convertedResval = convertToStandardUnitCached(resval, resunit);
		const convertedResloq = convertToStandardUnitCached(resloq, resunit);

		const processedItem = {
			...item,
			resval: convertedResval,
			resloq: convertedResloq,
			resunit: "mg/kg",
		};

		const itemYear = new Date(timestamp).getFullYear();

		timelineProducts.add(key);
		timelineContaminants.add(param);

		if (!timelineByProduct[key]) timelineByProduct[key] = [];
		timelineByProduct[key].push(processedItem);

		if (!timelineByContaminant[param]) timelineByContaminant[param] = [];
		timelineByContaminant[param].push(processedItem);

		if (convertedResval > 0) {
			if (itemYear === yearContaminant) {
				chartContaminants.add(param);
				if (!dataByContaminant[param]) dataByContaminant[param] = [];
				dataByContaminant[param].push(processedItem);
			}

			if (itemYear === yearProduct) {
				chartProducts.add(key);
				if (!dataByProduct[key]) dataByProduct[key] = [];
				dataByProduct[key].push(processedItem);
			}

			if (itemYear === yearStacked) {
				if (!dataStacked[key]) dataStacked[key] = [];
				dataStacked[key].push(processedItem);
			}
		}
	}

	return {
		uniqueChartProducts: [...chartProducts].sort(),
		uniqueChartContaminants: [...chartContaminants].sort(),
		uniqueTimelineProducts: [...timelineProducts].sort(),
		uniqueTimelineContaminants: [...timelineContaminants].sort(),
		dataGroupedByProduct: dataByProduct,
		dataGroupedByContaminant: dataByContaminant,
		dataStacked,
		timelineGroupedByProduct: timelineByProduct,
		timelineGroupedByContaminant: timelineByContaminant,
	};
}, [rawTimeline, selectedYears.contaminant, selectedYears.product, selectedYears.stacked]);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Efsa = () => {
	const {
		selections,
		selectedYears,
		paginationState,
		updateSelection,
		updateYear,
		updatePagination,
		resetPagination,
	} = useEfsaState(countries);

	const handleCountryChange = useCallback((e) => {
		const newCountry = e.target.value;
		updateSelection("country", newCountry);
		resetPagination(["contaminantChart", "productChart", "stackedBarChart"]);
	}, [resetPagination, updateSelection]);

	const handleContaminantChange = useCallback((e) => {
		updateSelection("contaminant", e.target.value);
		resetPagination(["contaminantChart"]);
	}, [resetPagination, updateSelection]);

	const handleProductChange = useCallback((e) => {
		updateSelection("product", e.target.value);
		resetPagination(["productChart"]);
	}, [resetPagination, updateSelection]);

	// Create separate year change handlers
	const handleYearChange = useCallback((type) => (newValue) => {
		updateYear(type, newValue.$y);
	}, [updateYear]);

	// Year picker configurations - consolidated
	const createYearPickerProps = useCallback((year, handler, key) => [{
		key,
		customType: "date-picker",
		width: "150px",
		sublabel: "Select Year",
		views: ["year"],
		value: new Date(`${year}-01-01`),
		minDate: new Date("2011-01-01"),
		maxDate: new Date("2023-12-31"),
		onChange: handler,
	}], []);

	const yearPickerRefs = useRef({
		contaminant: null,
		product: null,
		stacked: null,
	});

	const productYearPickerProps = useMemo(() => createYearPickerProps(selectedYears.product, handleYearChange("product")),
		[createYearPickerProps, selectedYears.product, handleYearChange]);
	const contaminantYearPickerProps = useMemo(() => createYearPickerProps(selectedYears.contaminant, handleYearChange("contaminant")),
		[createYearPickerProps, selectedYears.contaminant, handleYearChange]);
	const stackedYearPickerProps = useMemo(() => createYearPickerProps(selectedYears.stacked, handleYearChange("stacked")),
		[createYearPickerProps, selectedYears.stacked, handleYearChange]);

	const fetchConfigs = useMemo(() => (selections.country
		? efsaConfigs(selections.country.toLowerCase()) : null), [selections.country]);

	const { state } = useInit(organization, fetchConfigs);

	const { isLoading, dataSets, minutesAgo } = state;

	const {
		uniqueChartProducts,
		uniqueChartContaminants,
		uniqueTimelineProducts,
		uniqueTimelineContaminants,
		dataGroupedByProduct,
		dataGroupedByContaminant,
		dataStacked,
		timelineGroupedByProduct,
		timelineGroupedByContaminant,
	} = useProcessedEfsaData(dataSets?.timeline || [], selectedYears);

	const dynamicRangesByYear = useMemo(() => {
		const calculateRange = (groupedData, filterKey = null, filterValue = null) => {
			if (!groupedData || Object.keys(groupedData).length === 0) {
				return [0, 100];
			}

			const allValues = [];
			for (const key of Object.keys(groupedData)) {
				const items = groupedData[key] || [];
				for (const item of items) {
					// Apply filter if specified. Process if no filter or if item matches filter.
					if ((!filterKey || !filterValue || item[filterKey] === filterValue) && item.resval > 0) {
						allValues.push(item.resval);
					}
				}
			}

			if (allValues.length === 0) {
				return [0, 100];
			}

			const max = Math.max(...allValues);
			const min = Math.min(...allValues);
			const padding = (max - min) * 0.1 || max * 0.1 || 10;
			return [Math.max(0, min - padding), max + padding];
		};

		return {
			// For contaminant chart: filter by selected product if available
			contaminant: calculateRange(
				dataGroupedByContaminant,
				selections.contaminant ? "param" : null,
				selections.contaminant,
			),
			// For product chart: filter by selected contaminant if available
			product: calculateRange(
				dataGroupedByProduct,
				selections.product ? "key" : null,
				selections.product,
			),
			// Stacked chart uses all data
			stacked: calculateRange(dataStacked),
		};
	}, [dataGroupedByContaminant, dataGroupedByProduct, dataStacked, selections.contaminant, selections.product]);

	const countryDropdown = useMemo(() => createDropdown(
		"country-dropdown",
		"Select Country",
		countries,
		selections.country,
		handleCountryChange,
	), [handleCountryChange, selections.country]);

	const contaminantChartDropdown = useMemo(() => createDropdown(
		"contaminant-dropdown",
		"Select Contaminant",
		uniqueChartContaminants,
		selections.contaminant || "",
		handleContaminantChange,
	), [handleContaminantChange, selections.contaminant, uniqueChartContaminants]);

	const productChartDropdown = useMemo(() => createDropdown(
		"product-dropdown",
		"Select Product",
		uniqueChartProducts,
		selections.product || "",
		handleProductChange,
	), [handleProductChange, selections.product, uniqueChartProducts]);

	const contaminantTimelineDropdown = useMemo(() => createDropdown(
		"contaminant-timeline-dropdown",
		"Select Contaminant",
		uniqueTimelineContaminants,
		selections.contaminantTimeline || "", // Use empty string as fallback
		(e) => updateSelection("contaminantTimeline", e.target.value),
	), [uniqueTimelineContaminants, selections.contaminantTimeline, updateSelection]);

	const productTimelineDropdown = useMemo(() => createDropdown(
		"product-timeline-dropdown",
		"Select Product",
		uniqueTimelineProducts,
		selections.productTimeline || "", // Use empty string as fallback
		(e) => updateSelection("productTimeline", e.target.value),
	), [uniqueTimelineProducts, selections.productTimeline, updateSelection]);

	const productTimelineContaminantDropdown = useMemo(() => createDropdown(
		"product-timeline-contaminant-dropdown",
		"Select Product",
		uniqueTimelineProducts,
		selections.productTimeline || "", // Use empty string as fallback
		(e) => updateSelection("productContaminationTimeline", e.target.value),
	), [uniqueTimelineProducts, selections.productTimeline, updateSelection]);

	const availableContaminantsForProduct = useMemo(() => {
		if (!selections.productContaminationTimeline || Object.keys(timelineGroupedByProduct).length === 0) return [];

		const productData = timelineGroupedByProduct[selections.productContaminationTimeline] || [];
		const contaminantSet = new Set();
		for (const item of productData) {
			contaminantSet.add(item.param);
		}

		return [...contaminantSet].sort();
	}, [timelineGroupedByProduct, selections.productContaminationTimeline]);

	const contaminantForProductDropdown = useMemo(() => createDropdown(
		"contaminant-for-product-dropdown",
		"Select Contaminant",
		availableContaminantsForProduct,
		selections.contaminantForProduct || "", // Use empty string as fallback
		(e) => updateSelection("contaminantForProduct", e.target.value),
	), [availableContaminantsForProduct, selections.contaminantForProduct, updateSelection]);

	// ===================================================================
	// EFFECTS
	// ===================================================================

	useEffect(() => {
		const resetSelections = () => {
			updateSelection("contaminant", uniqueChartContaminants[0] || null);
			updateSelection("product", uniqueChartProducts[0] || null);
			updateSelection("contaminantTimeline", uniqueTimelineContaminants[0] || null);
			updateSelection("productTimeline", uniqueTimelineProducts[0] || null);
			updateSelection("productContaminationTimeline", uniqueTimelineProducts[0] || null);
		};

		resetSelections();
	}, [uniqueChartContaminants, uniqueChartProducts, uniqueTimelineContaminants, uniqueTimelineProducts, updateSelection]);

	useEffect(() => {
		updateSelection("contaminantForProduct", availableContaminantsForProduct[0] || null);
	}, [selections.productContaminationTimeline, availableContaminantsForProduct, updateSelection]);

	// Reset pagination effects - consolidated
	useEffect(() => {
		resetPagination(["contaminantChart", "productChart", "stackedBarChart"]);
	}, [selections.country, resetPagination]);

	const contaminantChartData = useMemo(() => {
		if (!selections.contaminant || Object.keys(dataGroupedByContaminant).length === 0) return [];

		const contaminantData = dataGroupedByContaminant[selections.contaminant] || [];

		// Apply pagination
		const startIndex = paginationState.contaminantChart * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		const paginatedData = contaminantData.slice(startIndex, endIndex);

		return [
			{
				x: paginatedData.map((_, index) => index),
				y: paginatedData.map((item) => item.resval),
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: paginatedData.map((item) => `<b>Product</b>: ${item.key.replaceAll(/\b\w/g, (l) => l.toUpperCase())}<br>`
					+ `<b>Residue Value</b>: ${item.resval.toExponential(2)} ${item.resunit}<br>`
					+ `<b>LOQ</b>: ${item.resloq.toExponential(2)} ${item.resunit}`),
				type: "bar",
				color: "third",
				title: "Residue Value",
				paginatedData, // Store for layout use
			},
		];
	}, [selections.contaminant, dataGroupedByContaminant, paginationState.contaminantChart]);

	const contaminantChartLayout = useMemo(() => {
		const paginatedData = contaminantChartData[0]?.paginatedData || [];

		const shapes = paginatedData.map((item, index) => ({
			type: "line",
			xref: "x",
			x0: index - 0.45,
			x1: index + 0.5,
			yref: "y",
			y0: item.resloq,
			y1: item.resloq,
			line: { color: "goldenrod", width: 2, dash: "dash" },
		}));

		return {
			xaxis: {
				tickmode: "array",
				tickvals: paginatedData.map((_, index) => index),
				ticktext: paginatedData.map((item) => wrapText(item.key, MAX_LABEL_LENGTH)),
				tickangle: 0,
			},
			yaxis: { title: `Residue Value (${TARGET_UNIT})`, range: dynamicRangesByYear.contaminant },
			hoverlabel: { align: "left" },
			shapes,
		};
	}, [contaminantChartData, dynamicRangesByYear.contaminant]);

	const productChartData = useMemo(() => {
		if (!selections.product || Object.keys(dataGroupedByProduct).length === 0) return [];

		const productData = dataGroupedByProduct[selections.product] || [];
		// Apply pagination
		const startIndex = paginationState.productChart * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		const paginatedData = productData.slice(startIndex, endIndex);

		return [
			{
				x: paginatedData.map((_, index) => index),
				y: paginatedData.map((item) => item.resval),
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: paginatedData.map((item) => `<b>Contaminant</b>: ${wrapText(item.param.replaceAll(/\b\w/g, (l) => l.toUpperCase()), MAX_LABEL_LENGTH)}<br>`
					+ `<b>Residue Value</b>: ${item.resval.toExponential(2)} ${item.resunit}<br>`
					+ `<b>LOQ</b>: ${item.resloq.toExponential(2)} ${item.resunit}`),
				type: "bar",
				color: "colors.third",
				paginatedData, // Store for layout use
			},
		];
	}, [dataGroupedByProduct, selections.product, paginationState.productChart]);

	const productChartLayout = useMemo(() => {
		if (!selections.product || Object.keys(dataGroupedByProduct).length === 0) {
			return {
				xaxis: { title: "Contaminants" },
				yaxis: { title: "Residue Value" },
			};
		}

		const paginatedData = productChartData[0]?.paginatedData || [];

		// Create individual shapes for each contaminant's LOQ line
		const shapes = paginatedData.map((item, index) => ({
			type: "line",
			xref: "x",
			x0: index - 0.45, // Start before the bar
			x1: index + 0.5, // End after the bar
			yref: "y",
			y0: item.resloq,
			y1: item.resloq,
			line: { color: "goldenrod", width: 3, dash: "dash" },
		}));

		return {
			xaxis: {

				tickmode: "array",
				tickvals: paginatedData.map((_, index) => index),
				ticktext: paginatedData.map((item) => wrapText(item.param, MAX_LABEL_LENGTH)),
				tickangle: 0,
			},
			yaxis: { title: `Residue Value (${TARGET_UNIT})`, range: dynamicRangesByYear.product },
			hoverlabel: { align: "left" },
			margin: { l: 80, r: 50, t: 50, b: 120 },
			shapes,
		};
	}, [selections.product, dataGroupedByProduct, productChartData, dynamicRangesByYear.product]);

	const stackedBarChartData = useMemo(() => {
		if (!dataStacked || Object.keys(dataStacked).length === 0) return [];

		const availableProducts = Object.keys(dataStacked);
		const startIndex = paginationState.stackedBarChart * ITEMS_PER_PAGE * 2;
		const endIndex = startIndex + ITEMS_PER_PAGE * 2;
		const paginatedProducts = availableProducts.slice(startIndex, endIndex);

		if (paginatedProducts.length === 0) return [];

		// Pre-compute all product-related data in one pass
		const productData = paginatedProducts.map((product) => ({
			product,
			capitalized: capitalizeWords(product),
			wrapped: wrapText(product, MAX_LABEL_LENGTH),
			contaminants: Object.create(null),
		}));

		const contaminantsSet = new Set();

		for (const [_, { product, contaminants }] of productData.entries()) {
			const items = dataStacked[product];
			if (items) {
				for (const item of items) {
					contaminants[item.param] = item;
					contaminantsSet.add(item.param);
				}
			}
		}

		const availableContaminants = [...contaminantsSet].sort().reverse();

		return availableContaminants.map((contaminant) => {
			const capitalizedContaminant = capitalizeWords(contaminant);
			const contaminantValues = Array.from({ length: productData.length });
			const hoverText = Array.from({ length: productData.length });

			for (const [i, { capitalized, contaminants }] of productData.entries()) {
				const dataPoint = contaminants[contaminant];

				if (dataPoint) {
					contaminantValues[i] = dataPoint.resval;
					hoverText[i] = `<b>Product</b>: ${capitalized}<br><b>Contaminant</b>: ${capitalizedContaminant}<br><b>Residue Value</b>: ${dataPoint.resval.toExponential(2)} ${dataPoint.resunit}`;
				} else {
					contaminantValues[i] = 0;
					hoverText[i] = `<b>Product</b>: ${capitalized}<br><b>Contaminant</b>: ${capitalizedContaminant}<br>No data`;
				}
			}

			return {
				x: productData.map((d) => d.wrapped),
				y: contaminantValues,
				name: truncateText(contaminant),
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: hoverText,
				type: "bar",
			};
		});
	}, [dataStacked, paginationState.stackedBarChart]);

	const stackedBarChartLayout = useMemo(() => ({
		xaxis: { title: "Food Products", tickangle: 0 },
		yaxis: { title: `Total Residue Value (${TARGET_UNIT})`, range: dynamicRangesByYear.stacked },
		showlegend: true,
		legend: { y: 1, x: 1.25, xanchor: "left" },
		hoverlabel: { align: "left" },
	}), [dynamicRangesByYear.stacked]);

	const contaminantTimelineData = useMemo(() => {
		if (!selections.contaminantTimeline || Object.keys(timelineGroupedByContaminant).length === 0) return [];

		const contaminantData = timelineGroupedByContaminant[selections.contaminantTimeline] || [];

		// Group the contaminant data by product (key) to create separate lines
		const productGroups = groupByKey(contaminantData, "key");

		// Sort product keys alphabetically before creating traces
		const sortedProductKeys = Object.keys(productGroups).sort();

		return sortedProductKeys.map((productKey, index) => {
			const productData = productGroups[productKey];
			const timestamps = [];
			const values = [];
			const customData = [];

			// Single loop for all arrays
			for (const item of productData) {
				timestamps.push(item.timestamp);
				values.push(item.resval);
				customData.push(
					`<b>Product</b>: ${item.key.replaceAll(/\b\w/g, (l) => l.toUpperCase())}<br>`
					+ `<b>Residue Value</b>: ${item.resval.toExponential(2)}<br>`
					+ `<b>LOQ</b>: ${item.resloq.toExponential(2)} ${item.resunit}`,
				);
			}

			return {
				x: timestamps,
				y: values,
				type: "scatter",
				mode: "lines+markers",
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: customData,
				title: truncateText(productKey),
				color: getDistinctColor(index),
			};
		});
	}, [timelineGroupedByContaminant, selections.contaminantTimeline]);

	const contaminantTimelineLayout = useMemo(() => {
		if (!selections.contaminantTimeline || Object.keys(timelineGroupedByContaminant).length === 0) {
			return { yaxis: { title: "Residue Value" } };
		}

		const contaminantData = timelineGroupedByContaminant[selections.contaminantTimeline] || [];
		const loqValue = contaminantData.length > 0 ? contaminantData[0].resloq : 0;

		return {
			yaxis: {
				title: `Residue Value (${TARGET_UNIT})`,

			},
			showlegend: true,
			legend: {
				y: 1,
				x: 1.25,
				xanchor: "left",
			},
			hoverlabel: { align: "left" },
			shapes: loqValue > 0 ? [{
				type: "line",
				xref: "paper",
				x0: 0,
				x1: 1,
				yref: "y",
				y0: loqValue,
				y1: loqValue,
				line: {
					color: "goldenrod",
					width: 2,
					dash: "dash",
				},
			}] : [],
		};
	}, [selections.contaminantTimeline, timelineGroupedByContaminant]);

	const productTimelineData = useMemo(() => {
		if (!selections.productTimeline || Object.keys(timelineGroupedByProduct).length === 0) return [];

		const productData = timelineGroupedByProduct[selections.productTimeline] || [];

		// Group the product data by contaminant (param) to create separate lines
		const contaminantGroups = groupByKey(productData, "param");

		// Sort contaminant keys alphabetically before creating traces
		const sortedContaminantKeys = Object.keys(contaminantGroups).sort();

		// Create residue value data
		const residueValueData = sortedContaminantKeys.map((contaminantKey, index) => {
			const contaminantData = contaminantGroups[contaminantKey];
			const timestamps = [];
			const values = [];
			const customData = [];

			// Single loop for all arrays
			for (const item of contaminantData) {
				timestamps.push(item.timestamp);
				values.push(item.resval);
				customData.push(
					`<b>Contaminant</b>: ${wrapText(contaminantKey.replaceAll(/\b\w/g, (l) => l.toUpperCase()), MAX_LABEL_LENGTH)}<br>`
					+ `<b>Residue Value</b>: ${item.resval.toExponential(2)} ${item.resunit}<br>`
					+ `<b>LOQ</b>: ${item.resloq.toExponential(2)} ${item.resunit}`,
				);
			}

			return {
				x: timestamps,
				y: values,
				type: "scatter",
				mode: "lines+markers",
				name: truncateText(contaminantKey),
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: customData,
				color: getDistinctColor(index),
			};
		});

		return { residueValues: residueValueData };
	}, [timelineGroupedByProduct, selections.productTimeline]);

	// Separate computation for combined measurements chart
	const productCombinedTimelineData = useMemo(() => {
		if (!selections.productContaminationTimeline || Object.keys(timelineGroupedByProduct).length === 0) return [];

		const productData = timelineGroupedByProduct[selections.productContaminationTimeline] || [];

		// Filter data for the specific contaminant
		const contaminantData = productData.filter((item) => item.param === selections.contaminantForProduct);

		if (contaminantData.length === 0) return [];

		// Exceeding limit percentage scatter plot
		const exceedingLimitData = {
			x: contaminantData.map((item) => item.timestamp),
			y: contaminantData.map((item) => {
				const exceedingLimit = item.nr_measurements_exceeding_legallimit || 0;
				const totalMeasurements = item.nr_measure || 1;
				return (exceedingLimit / totalMeasurements) * 100;
			}),
			type: "scatter",
			mode: "lines+markers",
			name: "Measurements Exceeding Legal Limit (%)",
			hovertemplate: "%{customdata}<extra></extra>",
			customdata: contaminantData.map((item) => {
				const exceedingLimit = item.nr_measurements_exceeding_legallimit || 0;
				const totalMeasurements = item.nr_measure || 1;
				const percentage = ((exceedingLimit / totalMeasurements) * 100).toFixed(2);
				return `<b>Product</b>: ${item.key || "Unknown"}`
					+ `<br><b>Contaminant</b>: ${selections.contaminantForProduct}`
					+ `<br><b>Percentage Exceeding Limit</b>: ${percentage}%`
					+ `<br><b>Exceeding Measurements</b>: ${exceedingLimit}/${totalMeasurements}<br>`;
			}),
			yaxis: "y2",
		};

		const measurementCountData = {
			x: contaminantData.map((item) => item.timestamp),
			y: contaminantData.map((item) => item.nr_measure || 0),
			type: "bar",
			name: "Measurement Count",
			hovertemplate: "%{customdata}<extra></extra>",
			customdata: contaminantData.map((item) => `<b>Product</b>: ${item.key || "Unknown"}<br>`
				+ `<b>Number of Measurements</b>: ${item.nr_measure || 0}<br>`),
			color: "#D3D3D3",
			showLegend: false,
			yaxis: "y",
		};

		return [exceedingLimitData, measurementCountData];
	}, [timelineGroupedByProduct, selections.productContaminationTimeline, selections.contaminantForProduct]);

	// Update the layouts
	const productTimelineLayouts = useMemo(() => {
		if (!selections.productTimeline || Object.keys(timelineGroupedByProduct).length === 0) {
			return {
				residueValues: {
					yaxis: { title: "Residue Value" },
				},
				combinedMeasurements: {
					yaxis: { title: "Measurements Exceeding Legal Limit (%)", nticks: 5 },
					yaxis2: { title: "Number of Measurements", nticks: 5 },
				},
			};
		}

		const baseLayout = {
			showlegend: true,
			legend: { y: 1, x: 1.05, xanchor: "left" },
			margin: { r: 200 },
		};

		return {
			residueValues: {
				...baseLayout,
				yaxis: { title: `Residue Value (${TARGET_UNIT})` },
			},
			combinedMeasurements: {
				...baseLayout,
				yaxis: {
					primary: {
						title: "Number of Measurements",

						anchor: "x",
						side: "right",
						nticks: 5,
						showgrid: false,
					},
					secondary: {
						title: "Measurements Exceeding Legal Limit (%)",

						range: [0, 100],
						overlaying: "y",
						nticks: 6,
					},
				},
			},
		};
	}, [selections.productTimeline, timelineGroupedByProduct]);

	//= ===============================================================================
	// Render
	//= ===============================================================================
	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={[countryDropdown]} />

			<Grid item xs={12} sm={12} md={6} display="flex">
				<Card
					title="Foods with Risky Contaminant Levels"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand
						sticky={false}
						dropdownContent={[contaminantChartDropdown]}
						formRef={yearPickerRefs.contaminant}
						formContent={contaminantYearPickerProps}
					/>
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueChartContaminants.length === 0 ? (
						<DataWarning message="No contaminant measurements available for the selected country and year" minHeight="450px" />
					) : isValidArray(contaminantChartData[0]?.x) && (
						<>
							<Grid item xs={12} md={12}>
								<Plot
									scrollZoom
									data={contaminantChartData}
									showLegend={false}
									shapes={contaminantChartLayout.shapes}
									xaxis={contaminantChartLayout.xaxis}
									yaxis={contaminantChartLayout.yaxis}
									layout={{ hoverlabel: contaminantChartLayout.hoverlabel }}
								/>
							</Grid>
							{(() => {
								const totalItems = dataGroupedByContaminant[selections.contaminant]?.length || 0;
								const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

								return (
									<PaginationControls
										currentPage={paginationState.contaminantChart}
										totalPages={totalPages}
										itemsPerPage={ITEMS_PER_PAGE}
										totalItems={totalItems}
										onPageChange={(page) => updatePagination("contaminantChart", page)}
									/>
								);
							})()}
						</>
					)}
				</Card>
			</Grid>

			<Grid item xs={12} sm={12} md={6} display="flex">
				<Card
					title="Contaminants in Food Product"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand
						sticky={false}
						dropdownContent={[productChartDropdown]}
						formRef={yearPickerRefs.product}
						formContent={productYearPickerProps}
					/>
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueChartProducts.length === 0 ? (
						<DataWarning message="No product measurements available for the selected country and year" minHeight="450px" />
					) : isValidArray(productChartData[0]?.x) && (

						<>
							<Grid item xs={12} md={12}>
								<Plot
									scrollZoom
									showLegend={false}
									data={productChartData}
									shapes={productChartLayout.shapes}
									xaxis={productChartLayout.xaxis}
									yaxis={productChartLayout.yaxis}
									layout={{ hoverlabel: productChartLayout.hoverlabel }}
								/>
							</Grid>
							{(() => {
								const totalItems = dataGroupedByProduct[selections.product]?.length || 0;
								const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

								return (
									<PaginationControls
										currentPage={paginationState.productChart}
										totalPages={totalPages}
										itemsPerPage={ITEMS_PER_PAGE}
										totalItems={totalItems}
										onPageChange={(page) => updatePagination("productChart", page)}
									/>
								);
							})()}
						</>

					)}

				</Card>
			</Grid>

			<Grid item xs={12} md={12}>
				<Card
					title="Total Contaminants per Food Product"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand sticky={false} formRef={yearPickerRefs.stacked} formContent={stackedYearPickerProps} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : Object.keys(dataStacked).length === 0 ? (
						<DataWarning message="No data available for the selected country and year" />
					) : isValidArray(stackedBarChartData) && stackedBarChartData.length > 0 ? (
						<>
							<Grid item xs={12}>
								<Plot
									scrollZoom
									height="499px"
									data={stackedBarChartData}
									barmode="stack"
									displayBar={false}
									xaxis={stackedBarChartLayout.xaxis}
									yaxis={stackedBarChartLayout.yaxis}
								/>
							</Grid>
							{(() => {
								const totalItems = Object.keys(dataStacked).length;
								const totalPages = Math.ceil(totalItems / (ITEMS_PER_PAGE * 2));

								return (
									<PaginationControls
										currentPage={paginationState.stackedBarChart}
										totalPages={totalPages}
										itemsPerPage={ITEMS_PER_PAGE * 2}
										totalItems={totalItems}
										onPageChange={(page) => updatePagination("stackedBarChart", page)}
									/>
								);
							})()}
						</>
					) : (
						<DataWarning message="No measurements available for stacked visualization" />
					)}

				</Card>
			</Grid>

			<Grid item xs={12} sm={12} md={6} mt={1} display="flex">
				<Card
					title="Contaminant Timeline"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand sticky={false} dropdownContent={[contaminantTimelineDropdown]} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueTimelineContaminants.length === 0 ? (
						<DataWarning message="No contaminant measurements available for the selected country and year" minHeight="450px" />
					) : isValidArray(contaminantTimelineData[0]?.x) ? (
						<Grid item xs={12} md={12}>
							<Plot
								scrollZoom
								showLegend
								data={contaminantTimelineData}
								shapes={contaminantTimelineLayout.shapes}
								yaxis={contaminantTimelineLayout.yaxis}
							/>
						</Grid>
					) : (
						<DataWarning message={`No measurements found for ${selections.contaminantTimeline}.`} />
					)}
				</Card>
			</Grid>

			<Grid item xs={12} sm={12} md={6} mt={1} display="flex">
				<Card
					title="Product Timeline"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand sticky={false} dropdownContent={[productTimelineDropdown]} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueTimelineProducts.length === 0 ? (
						<DataWarning message="No product measurements available for the selected country and year" />
					) : isValidArray(productTimelineData.residueValues) && productTimelineData.residueValues.length > 0 ? (
						<Grid item xs={12} md={12}>
							<Plot
								scrollZoom
								data={productTimelineData.residueValues}
								xaxis={productTimelineLayouts.residueValues.xaxis}
								yaxis={productTimelineLayouts.residueValues.yaxis}
								showlegend={productTimelineLayouts.residueValues.showlegend}
								layout={{ legend: productTimelineLayouts.residueValues.legend, hoverlabel: { align: "left" } }}
							/>
						</Grid>
					) : (
						<DataWarning message={`No measurements found for ${selections.productTimeline}.`} />
					)}
				</Card>
			</Grid>
			<Grid item xs={12} sm={12} md={12} mt={1} mb={2} display="flex">
				<Card
					title="Product Timeline - Measurements & Legal Limit Violations"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand sticky={false} dropdownContent={[productTimelineContaminantDropdown, contaminantForProductDropdown]} />
					{isLoading ? (
						<LoadingIndicator minHeight="400px" />
					) : uniqueTimelineProducts.length === 0 ? (
						<DataWarning message="No product measurements available for the selected country and year" minHeight="450px" />
					) : isValidArray(productCombinedTimelineData) && productCombinedTimelineData?.length > 0 ? (
						<Grid item xs={12} md={12}>
							<Plot
								scrollZoom
								data={productCombinedTimelineData}
								yaxis={productTimelineLayouts.combinedMeasurements.yaxis}
								showlegend={productTimelineLayouts.combinedMeasurements.showlegend}
								layout={{ legend: productTimelineLayouts.combinedMeasurements.legend }}
							/>
						</Grid>
					) : (
						<LoadingIndicator minHeight="400px" />
					)}
				</Card>
			</Grid>
		</Grid>
	);
};

export default memo(Efsa);
