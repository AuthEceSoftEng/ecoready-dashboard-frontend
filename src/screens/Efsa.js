import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import PaginationControls from "../components/Pagination.js";
import efsaConfigs, { organization } from "../config/EfsaConfig.js";
import useInit from "../utils/screen-init.js";
import { isValidArray, groupByKey } from "../utils/data-handling-functions.js";
import { wrapText, cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { UNIT_CONVERSION_FACTORS } from "../utils/useful-constants.js";

const countries = ["Austria", "Belgium", "Bulgaria", "Croatia", "Denmark", "France", "Germany", "Greece", "Ireland", "Italy", "Lithuania", "Luxembourg", "Netherlands", "Poland", "Portugal", "Republic of north macedonia", "Romania", "Serbia", "Slovakia", "Spain", "Ukraine", "United kingdom"];

const TARGET_UNIT = "mg/kg"; // Your standard unit

const ITEMS_PER_PAGE = 6; // for pagination

const MAX_LABEL_LENGTH = 10; // for truncating long labels

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

const truncateLabel = (label, maxLength = 15) => (label.length > maxLength ? `${label.slice(0, Math.max(0, maxLength))}...` : label);

// Create a dropdown factory function
const createDropdown = (id, label, items, value, onChange) => ({
	id,
	label,
	items,
	value,
	onChange,
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Efsa = () => {
	const [selectedCountry, setSelectedCountry] = useState(countries[0]);
	const [selectedContaminant, setSelectedContaminant] = useState(null);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [selectedContaminantTimeline, setSelectedContaminantTimeline] = useState(null);
	const [selectedProductTimeline, setSelectedProductTimeline] = useState(null);
	const [selectedProductContaminationTimeline, setSelectedProductContaminationTimeline] = useState(null);
	const [selectedContaminantForProduct, setSelectedContaminantForProduct] = useState(null);
	const [yearContaminant, setYearContaminant] = useState("2023");
	const [yearProduct, setYearProduct] = useState("2023");
	const [yearStacked, setYearStacked] = useState("2023");

	// Add pagination state
	const [contaminantChartPage, setContaminantChartPage] = useState(0);
	const [productChartPage, setProductChartPage] = useState(0);
	const [stackedBarChartPage, setStackedBarChartPage] = useState(0);

	// Create separate year change handlers
	const handleContaminantYearChange = useCallback((newValue) => {
		setYearContaminant(newValue.$y);
	}, []);

	const handleProductYearChange = useCallback((newValue) => {
		setYearProduct(newValue.$y);
	}, []);

	const handleStackedYearChange = useCallback((newValue) => {
		setYearStacked(newValue.$y);
	}, []);

	const productYearPickerRef = useRef(null);
	const productYearPickerProps = useMemo(() => [
		{
			key: "product-year-picker",
			customType: "date-picker",
			width: "150px",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date(`${yearProduct}-01-01`),
			minDate: new Date("2011-01-01"),
			maxDate: new Date("2023-12-31"),
			onChange: handleProductYearChange,
		},
	], [handleProductYearChange, yearProduct]);

	const contaminantYearPickerRef = useRef(null);
	const contaminantYearPickerProps = useMemo(() => [
		{
			key: "contaminant-year-picker",
			customType: "date-picker",
			width: "150px",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date(`${yearContaminant}-01-01`),
			minDate: new Date("2011-01-01"),
			maxDate: new Date("2023-12-31"),
			onChange: handleContaminantYearChange,
		},
	], [handleContaminantYearChange, yearContaminant]);

	const stackedYearPickerRef = useRef(null);
	const stackedYearPickerProps = useMemo(() => [
		{
			key: "stacked-year-picker",
			customType: "date-picker",
			width: "150px",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date(`${yearStacked}-01-01`),
			minDate: new Date("2011-01-01"),
			maxDate: new Date("2023-12-31"),
			onChange: handleStackedYearChange,
		},
	], [handleStackedYearChange, yearStacked]);

	// You'll need to modify your fetchConfigs to handle both years
	const fetchConfigs = useMemo(
		() => (selectedCountry ? efsaConfigs(selectedCountry.toLowerCase()) : null),
		[selectedCountry],
	);

	const { state } = useInit(organization, fetchConfigs);

	const { isLoading, dataSets, minutesAgo } = state;

	const processedData = useMemo(() => {
		const rawTimeline = dataSets?.timeline || [];

		if (rawTimeline.length === 0) {
			return {
				uniqueChartProducts: [],
				uniqueChartContaminants: [],
				uniqueTimelineProducts: [],
				uniqueTimelineContaminants: [],
				dataGroupedByProduct: {},
				dataGroupedByContaminant: {},
				dataGroupedByStacked: {},
				timelineGroupedByProduct: {},
				timelineGroupedByContaminant: {},
			};
		}

		// Single pass processing for timeline
		const processedTimeline = [];
		const timelineProductsSet = new Set();
		const timelineContaminantsSet = new Set();
		const timelineGroupedByProduct = {};
		const timelineGroupedByContaminant = {};

		for (const item of rawTimeline) {
			const processedItem = {
				...item,
				originalResval: item.resval,
				originalResunit: item.resunit,
				resval: convertToStandardUnitCached(item.resval, item.resunit),
				resloq: convertToStandardUnitCached(item.resloq, item.resunit),
				resunit: TARGET_UNIT,
			};

			processedTimeline.push(processedItem);
			timelineProductsSet.add(item.key);
			timelineContaminantsSet.add(item.param);

			// Group while processing
			if (!timelineGroupedByProduct[item.key]) timelineGroupedByProduct[item.key] = [];
			timelineGroupedByProduct[item.key].push(processedItem);

			if (!timelineGroupedByContaminant[item.param]) timelineGroupedByContaminant[item.param] = [];
			timelineGroupedByContaminant[item.param].push(processedItem);
		}

		// Create metrics data from timeline data filtered by selected years
		const contaminantYearInt = Number.parseInt(yearContaminant, 10);
		const productYearInt = Number.parseInt(yearProduct, 10);
		const stackedYearInt = Number.parseInt(yearStacked, 10);

		const chartProductsSet = new Set();
		const chartContaminantsSet = new Set();
		const stackedContaminantsSet = new Set();
		const dataGroupedByProduct = {};
		const dataGroupedByContaminant = {};
		const dataGroupedByStacked = {};

		// Filter for contaminant chart (first chart)
		const contaminantMetrics = processedTimeline.filter((item) => {
			const itemYear = new Date(item.timestamp).getFullYear();
			return itemYear === contaminantYearInt && item.resval > 0;
		});

		// Group contaminant metrics by contaminant
		for (const item of contaminantMetrics) {
			chartContaminantsSet.add(item.param);

			if (!dataGroupedByContaminant[item.param]) dataGroupedByContaminant[item.param] = [];
			dataGroupedByContaminant[item.param].push(item);
		}

		// Filter for product chart (second chart)
		const productMetrics = processedTimeline.filter((item) => {
			const itemYear = new Date(item.timestamp).getFullYear();
			return itemYear === productYearInt && item.resval > 0;
		});

		// Group product metrics by product
		for (const item of productMetrics) {
			chartProductsSet.add(item.key);

			if (!dataGroupedByProduct[item.key]) dataGroupedByProduct[item.key] = [];
			dataGroupedByProduct[item.key].push(item);
		}

		// Filter for stacked bar chart (third chart)
		const stackedMetrics = processedTimeline.filter((item) => {
			const itemYear = new Date(item.timestamp).getFullYear();
			return itemYear === stackedYearInt && item.resval > 0;
		});
		for (const item of stackedMetrics) {
			stackedContaminantsSet.add(item.param);

			if (!dataGroupedByStacked[item.key]) dataGroupedByStacked[item.key] = [];
			dataGroupedByStacked[item.key].push(item);
		}

		return {
			uniqueChartProducts: [...chartProductsSet].sort(),
			uniqueChartContaminants: [...chartContaminantsSet].sort(),
			uniqueStackedContaminants: [...stackedContaminantsSet].sort().reverse(),
			uniqueTimelineProducts: [...timelineProductsSet].sort(),
			uniqueTimelineContaminants: [...timelineContaminantsSet].sort(),
			dataGroupedByProduct,
			dataGroupedByContaminant,
			dataGroupedByStacked,
			timelineGroupedByProduct,
			timelineGroupedByContaminant,
		};
	}, [dataSets?.timeline, yearContaminant, yearProduct, yearStacked]);

	// Now use destructuring to get the values you need
	const {
		uniqueChartProducts,
		uniqueChartContaminants,
		uniqueStackedContaminants,
		uniqueTimelineProducts,
		uniqueTimelineContaminants,
		dataGroupedByProduct,
		dataGroupedByContaminant,
		dataGroupedByStacked,
		timelineGroupedByProduct,
		timelineGroupedByContaminant,
	} = processedData;

	const countryDropdown = useMemo(() => createDropdown(
		"country-dropdown",
		"Select Country",
		countries,
		selectedCountry,
		(e) => {
			const newCountry = e.target.value;
			setSelectedCountry(newCountry);
			setSelectedContaminant(uniqueChartContaminants[0]);
		},
	), [selectedCountry, uniqueChartContaminants]);

	const contaminantChartDropdown = useMemo(() => createDropdown(
		"contaminant-dropdown",
		"Select Contaminant",
		uniqueChartContaminants,
		selectedContaminant,
		(e) => setSelectedContaminant(e.target.value),
	), [uniqueChartContaminants, selectedContaminant]);

	const productChartDropdown = useMemo(() => createDropdown(
		"product-dropdown",
		"Select Product",
		uniqueChartProducts,
		selectedProduct,
		(e) => setSelectedProduct(e.target.value),
	), [uniqueChartProducts, selectedProduct]);

	const contaminantTimelineDropdown = useMemo(() => createDropdown(
		"contaminant-timeline-dropdown",
		"Select Contaminant",
		uniqueTimelineContaminants,
		selectedContaminantTimeline,
		(e) => setSelectedContaminantTimeline(e.target.value),
	), [uniqueTimelineContaminants, selectedContaminantTimeline]);

	const productTimelineDropdown = useMemo(() => createDropdown(
		"product-timeline-dropdown",
		"Select Product",
		uniqueTimelineProducts,
		selectedProductTimeline,
		(e) => setSelectedProductTimeline(e.target.value),
	), [uniqueTimelineProducts, selectedProductTimeline]);

	const productTimelineContaminantDropdown = useMemo(() => createDropdown(
		"product-timeline-contaminant-dropdown",
		"Select Product",
		uniqueTimelineProducts,
		selectedProductContaminationTimeline,
		(e) => setSelectedProductContaminationTimeline(e.target.value),
	), [uniqueTimelineProducts, selectedProductContaminationTimeline]);

	const availableContaminantsForProduct = useMemo(() => {
		if (!selectedProductContaminationTimeline || Object.keys(timelineGroupedByProduct).length === 0) return [];

		const productData = timelineGroupedByProduct[selectedProductContaminationTimeline] || [];
		const contaminants = [...new Set(productData.map((item) => item.param))].sort();
		return contaminants;
	}, [timelineGroupedByProduct, selectedProductContaminationTimeline]);

	const contaminantForProductDropdown = useMemo(() => createDropdown(
		"contaminant-for-product-dropdown",
		"Select Contaminant",
		availableContaminantsForProduct,
		selectedContaminantForProduct,
		(e) => setSelectedContaminantForProduct(e.target.value),
	), [availableContaminantsForProduct, selectedContaminantForProduct]);

	// ===================================================================
	// EFFECTS
	// ===================================================================
	// When country changes, reset selected contaminant and product to first available options

	useEffect(() => {
		// Reset selected contaminant and product when country changes
		if (selectedCountry && uniqueChartContaminants.length > 0) {
			setSelectedContaminant(uniqueChartContaminants[0]);
		}

		if (selectedCountry && uniqueChartProducts.length > 0) {
			setSelectedProduct(uniqueChartProducts[0]);
		}

		if (selectedCountry && uniqueTimelineContaminants.length > 0) {
			setSelectedContaminantTimeline(uniqueTimelineContaminants[0]);
		}

		if (selectedCountry && uniqueTimelineProducts.length > 0) {
			setSelectedProductTimeline(uniqueTimelineProducts[0]);
			setSelectedProductContaminationTimeline(uniqueTimelineProducts[0]);
		}
	}, [selectedCountry, uniqueChartContaminants, uniqueChartProducts, uniqueTimelineContaminants, uniqueTimelineProducts]);

	useEffect(() => {
		if (selectedProductContaminationTimeline && availableContaminantsForProduct.length > 0) {
			setSelectedContaminantForProduct(availableContaminantsForProduct[0]);
		}
	}, [selectedProductContaminationTimeline, availableContaminantsForProduct]);

	// Reset pagination when country changes
	useEffect(() => {
		setContaminantChartPage(0);
		setProductChartPage(0);
		setStackedBarChartPage(0); // Add this line
	}, [selectedCountry]);

	// Reset pagination when contaminant changes
	useEffect(() => {
		setContaminantChartPage(0);
	}, [selectedContaminant]);

	// Reset pagination when product changes
	useEffect(() => {
		setProductChartPage(0);
	}, [selectedProduct]);

	// Reset pagination when year changes
	useEffect(() => {
		setStackedBarChartPage(0);
	}, [yearContaminant, yearProduct]);

	const contaminantChartData = useMemo(() => {
		if (!selectedContaminant || Object.keys(dataGroupedByContaminant).length === 0) return [];

		const contaminantData = dataGroupedByContaminant[selectedContaminant] || [];

		// Apply pagination
		const startIndex = contaminantChartPage * ITEMS_PER_PAGE;
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
	}, [dataGroupedByContaminant, selectedContaminant, contaminantChartPage]);

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
			line: {
				color: "goldenrod",
				width: 2,
				dash: "dash",
			},
		}));

		return {
			xaxis: {
				automargin: true,
				tickmode: "array",
				tickvals: paginatedData.map((_, index) => index),
				ticktext: paginatedData.map((item) => wrapText(item.key, MAX_LABEL_LENGTH)),
				tickangle: 0,
			},
			yaxis: { title: `Residue Value (${TARGET_UNIT})`, automargin: true },
			hoverlabel: { align: "left" },
			shapes,
		};
	}, [contaminantChartData]);

	const productChartData = useMemo(() => {
		if (!selectedProduct || Object.keys(dataGroupedByProduct).length === 0) return [];

		const productData = dataGroupedByProduct[selectedProduct] || [];
		// Apply pagination
		const startIndex = productChartPage * ITEMS_PER_PAGE;
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
	}, [dataGroupedByProduct, selectedProduct, productChartPage]);

	const productChartLayout = useMemo(() => {
		if (!selectedProduct || Object.keys(dataGroupedByProduct).length === 0) {
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
				automargin: true,
				tickmode: "array",
				tickvals: paginatedData.map((_, index) => index),
				ticktext: paginatedData.map((item) => wrapText(item.param, MAX_LABEL_LENGTH)),
				tickangle: 0,
			},
			yaxis: { title: `Residue Value (${TARGET_UNIT})`, automargin: true },
			hoverlabel: { align: "left" },
			margin: { l: 80, r: 50, t: 50, b: 120 },
			shapes,
		};
	}, [selectedProduct, dataGroupedByProduct, productChartData]);

	const stackedBarChartData = useMemo(() => {
		if (!isValidArray(dataSets?.timeline) || uniqueStackedContaminants.length === 0) return [];
		console.log("Rendering stacked bar chart with dataGroupedByStacked:", dataGroupedByStacked);

		// Get all products that have data
		const availableProducts = Object.keys(dataGroupedByStacked);

		if (availableProducts.length === 0) return [];

		const startIndex = stackedBarChartPage * ITEMS_PER_PAGE * 2; // Show more items per page for better visibility
		const endIndex = startIndex + ITEMS_PER_PAGE * 2;
		const paginatedProducts = availableProducts.slice(startIndex, endIndex);

		// Find contaminants that are actually present in the current page's products
		const contaminantsInCurrentPage = new Set();
		paginatedProducts.forEach(product => {
			const productData = dataGroupedByStacked[product] || [];
			productData.forEach(item => {
				contaminantsInCurrentPage.add(item.param);
			});
		});

		// Filter to only show contaminants that exist in current page
		const availableContaminantsForPage = uniqueStackedContaminants.filter(contaminant =>
			contaminantsInCurrentPage.has(contaminant)
		);

		// Create one trace per contaminant (only for contaminants in current page)
		return availableContaminantsForPage.map((contaminant) => {
			const contaminantValues = paginatedProducts.map((product) => {
				const productData = dataGroupedByStacked[product] || [];
				const dataPoint = productData.find((item) => item.param === contaminant);
				return dataPoint ? dataPoint.resval : 0;
			});

			const hoverText = paginatedProducts.map((product) => {
				const productData = dataGroupedByStacked[product] || [];
				const dataPoint = productData.find((item) => item.param === contaminant);
				return dataPoint
					? `<b>Product</b>: ${product.replaceAll(/\b\w/g, (l) => l.toUpperCase())}`
					+ `<br><b>Contaminant</b>: ${contaminant.replaceAll(/\b\w/g, (l) => l.toUpperCase())}`
					+ `<br><b>Residue Value</b>: ${dataPoint.resval.toExponential(2)} ${dataPoint.resunit}`
					: `<b>Product</b>: ${product.replaceAll(/\b\w/g, (l) => l.toUpperCase())}`
					+ `<br><b>Contaminant</b>: ${contaminant.replaceAll(/\b\w/g, (l) => l.toUpperCase())}<br>No data`;
			});

			return {
				x: paginatedProducts.map((product) => truncateLabel(product)),
				y: contaminantValues,
				name: truncateLabel(contaminant),
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: hoverText,
				type: "bar",
			};
		});
	}, [dataSets?.timeline, uniqueStackedContaminants, dataGroupedByStacked, stackedBarChartPage]);

	const stackedBarChartLayout = useMemo(() => ({
		xaxis: { title: "Food Products", automargin: true },
		yaxis: { title: `Total Residue Value (${TARGET_UNIT})`, automargin: true },
		showlegend: true,
		legend: {
			y: 1,
			x: 1.25,
			xanchor: "left",
		},
		hoverlabel: { align: "left" },
	}), []);

	const contaminantTimelineData = useMemo(() => {
		if (!selectedContaminantTimeline || Object.keys(timelineGroupedByContaminant).length === 0) return [];

		const contaminantData = timelineGroupedByContaminant[selectedContaminantTimeline] || [];

		// Group the contaminant data by product (key) to create separate lines
		const productGroups = groupByKey(contaminantData, "key");
		const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

		// Sort product keys alphabetically before creating traces
		const sortedProductKeys = Object.keys(productGroups).sort();

		// Create a trace for each product
		return sortedProductKeys.map((productKey, index) => {
			const productData = productGroups[productKey];

			return {
				x: productData.map((item) => item.timestamp),
				y: productData.map((item) => item.resval),
				type: "scatter",
				mode: "lines+markers",
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: productData.map((item) => `<b>Product</b>: ${item.key.replaceAll(/\b\w/g, (l) => l.toUpperCase())}<br>`
					+ `<b>Residue Value</b>: ${item.resval.toExponential(2)}<br>`
					+ `<b>LOQ</b>: ${item.resloq.toExponential(2)} ${item.resunit}`),
				title: truncateLabel(productKey),
				color: colors[index % colors.length],
			};
		});
	}, [timelineGroupedByContaminant, selectedContaminantTimeline]);

	const contaminantTimelineLayout = useMemo(() => {
		if (!selectedContaminantTimeline || Object.keys(timelineGroupedByContaminant).length === 0) {
			return { yaxis: { title: "Residue Value" } };
		}

		const contaminantData = timelineGroupedByContaminant[selectedContaminantTimeline] || [];
		const loqValue = contaminantData.length > 0 ? contaminantData[0].resloq : 0;

		return {
			yaxis: {
				title: `Residue Value (${TARGET_UNIT})`,
				automargin: true,
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
	}, [selectedContaminantTimeline, timelineGroupedByContaminant]);

	const productTimelineData = useMemo(() => {
		if (!selectedProductTimeline || Object.keys(timelineGroupedByProduct).length === 0) return [];

		const productData = timelineGroupedByProduct[selectedProductTimeline] || [];

		// Group the product data by contaminant (param) to create separate lines
		const contaminantGroups = groupByKey(productData, "param");
		const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

		// Sort contaminant keys alphabetically before creating traces
		const sortedContaminantKeys = Object.keys(contaminantGroups).sort();

		// Create residue value data
		const residueValueData = sortedContaminantKeys.map((contaminantKey, index) => {
			const contaminantData = contaminantGroups[contaminantKey];

			return {
				x: contaminantData.map((item) => item.timestamp),
				y: contaminantData.map((item) => item.resval),
				type: "scatter",
				mode: "lines+markers",
				name: truncateLabel(contaminantKey),
				hovertemplate: "%{customdata}<extra></extra>",
				customdata: contaminantData.map((item) => `<b>Contaminant</b>: ${wrapText(contaminantKey.replaceAll(/\b\w/g, (l) => l.toUpperCase()), MAX_LABEL_LENGTH)}<br>`
					+ `<b>Residue Value</b>: ${item.resval.toExponential(2)} ${item.resunit}<br>`
					+ `<b>LOQ</b>: ${item.resloq.toExponential(2)} ${item.resunit}`),
				color: colors[index % colors.length],
			};
		});

		return { residueValues: residueValueData };
	}, [timelineGroupedByProduct, selectedProductTimeline]);

	// Separate computation for combined measurements chart
	const productCombinedTimelineData = useMemo(() => {
		if (!selectedProductContaminationTimeline || Object.keys(timelineGroupedByProduct).length === 0) return [];

		const productData = timelineGroupedByProduct[selectedProductContaminationTimeline] || [];

		// Filter data for the specific contaminant
		const contaminantData = productData.filter((item) => item.param === selectedContaminantForProduct);

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
					+ `<br><b>Contaminant</b>: ${selectedContaminantForProduct}`
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
	}, [timelineGroupedByProduct, selectedProductContaminationTimeline, selectedContaminantForProduct]);

	// Update the layouts
	const productTimelineLayouts = useMemo(() => {
		if (!selectedProductTimeline || Object.keys(timelineGroupedByProduct).length === 0) {
			return {
				residueValues: {
					yaxis: { title: "Residue Value" },
					xaxis: { automargin: true },
				},
				combinedMeasurements: {
					yaxis: { title: "Measurements Exceeding Legal Limit (%)", nticks: 5 },
					yaxis2: { title: "Number of Measurements", nticks: 5 },
					xaxis: { automargin: true },
				},
			};
		}

		const baseLayout = {
			showlegend: true,
			legend: { y: 1, x: 1.05, xanchor: "left" }, // Move legend further right
			margin: { r: 200 }, // Increase right margin significantly
		};

		return {
			residueValues: {
				...baseLayout,
				yaxis: { title: `Residue Value (${TARGET_UNIT})`, automargin: true },
			},
			combinedMeasurements: {
				...baseLayout,
				yaxis: {
					primary: {
						title: "Number of Measurements",
						automargin: true,
						anchor: "x",
						side: "right",
						nticks: 5,
					},
					secondary: {
						title: "Measurements Exceeding Legal Limit (%)",
						automargin: true,
						range: [0, 100],
						overlaying: "y",
						nticks: 6,
					},
				},
			},
		};
	}, [selectedProductTimeline, timelineGroupedByProduct]);

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
					<StickyBand sticky={false} dropdownContent={[contaminantChartDropdown]} formRef={contaminantYearPickerRef} formContent={contaminantYearPickerProps} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueChartContaminants.length === 0 ? (
						<DataWarning message="No contaminant measurements available for the selected country and year" minHeight="450px" />
					) : isValidArray(contaminantChartData[0]?.x) && (

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

					)}
					{(() => {
						const totalItems = dataGroupedByContaminant[selectedContaminant]?.length || 0;
						const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

						return (
							<PaginationControls
								currentPage={contaminantChartPage}
								totalPages={totalPages}
								itemsPerPage={ITEMS_PER_PAGE}
								totalItems={totalItems}
								onPageChange={setContaminantChartPage}
							/>
						);
					})()}
				</Card>
			</Grid>

			<Grid item xs={12} sm={12} md={6} display="flex">
				<Card
					title="Contaminants in Food Product"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand sticky={false} dropdownContent={[productChartDropdown]} formRef={productYearPickerRef} formContent={productYearPickerProps} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : uniqueChartProducts.length === 0 ? (
						<DataWarning message="No product measurements available for the selected country and year" minHeight="450px" />
					) : isValidArray(productChartData[0]?.x) && (

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

					)}
					{(() => {
						const totalItems = dataGroupedByProduct[selectedProduct]?.length || 0;
						const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

						return (
							<PaginationControls
								currentPage={productChartPage}
								totalPages={totalPages}
								itemsPerPage={ITEMS_PER_PAGE}
								totalItems={totalItems}
								onPageChange={setProductChartPage}
							/>
						);
					})()}
				</Card>
			</Grid>

			<Grid item xs={12} md={12}>
				<Card
					title="Total Contaminants per Food Product"
					footer={isLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand sticky={false} formRef={stackedYearPickerRef} formContent={stackedYearPickerProps} />
					{isLoading ? (
						<LoadingIndicator minHeight="300px" />
					) : dataGroupedByStacked.length === 0 ? (
						<DataWarning message="No data available for the selected country and year" />
					) : isValidArray(stackedBarChartData) && stackedBarChartData.length > 0 ? (
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
					) : (
						<DataWarning message="No measurements available for stacked visualization" />
					)}
					{(() => {
						const totalItems = Object.keys(dataGroupedByStacked).length;
						const totalPages = Math.ceil(totalItems / (ITEMS_PER_PAGE * 2));

						return (
							<PaginationControls
								currentPage={stackedBarChartPage}
								totalPages={totalPages}
								itemsPerPage={ITEMS_PER_PAGE * 2}
								totalItems={totalItems}
								onPageChange={setStackedBarChartPage}
							/>
						);
					})()}
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
						<DataWarning message={`No measurements found for ${selectedContaminantTimeline}.`} />
					)}
				</Card>
			</Grid>

			<Grid item xs={12} sm={12} md={6} mt={1} display="flex">
				<Card
					title="Product Timeline - Residue Values"
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
						<DataWarning message={`No measurements found for ${selectedProductTimeline}.`} />
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
