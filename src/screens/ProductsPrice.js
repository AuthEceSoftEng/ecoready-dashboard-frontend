import { useMemo, useState, useEffect, useRef } from "react";

import { getPriceConfigs, getMonthlyPriceConfigs, organization } from "../config/ProductConfig.js";
import useInit from "../utils/screen-init.js";
import { extractFields, getCustomDateTime } from "../utils/data-handling-functions.js";

const customDate = getCustomDateTime(2024, 12);

// Track if this is the very first mount of the component
const isFirstMount = { current: true };

export const PriceData = (globalProduct, selectedProductDetails, startDate, endDate, dateMetrics) => {
	const pricesItems = useMemo(() => extractFields(selectedProductDetails, "prices") || [], [selectedProductDetails]);
	const priceCollections = useMemo(() => (pricesItems.needsDropdown ? pricesItems.collections : []), [pricesItems]);

	const hasInitializedCollection = useRef(false);
	const hasInitializedOptions = useRef(false);
	const previousProduct = useRef(globalProduct);

	const [selectedPriceCollection, setSelectedPriceCollection] = useState(priceCollections?.[0] ?? "");
	const [priceOptions, setPriceOptions] = useState(() => {
		if (isFirstMount.current) {
			return {
				product: "Japonica",
				productType: "Avg",
				productVar: "Avg",
				country: "Greece",
			};
		}

		return {
			product: "",
			productType: "",
			productVar: "",
			country: "",
		};
	});

	useEffect(() => {
		if (previousProduct.current !== globalProduct) {
			previousProduct.current = globalProduct;
			hasInitializedCollection.current = false;
			hasInitializedOptions.current = false;
		}

		if (!hasInitializedCollection.current && priceCollections?.length) {
			setSelectedPriceCollection(priceCollections[0]);
			hasInitializedCollection.current = true;
		}
	}, [globalProduct, priceCollections]);

	const collectionValue = selectedPriceCollection?.value;

	const collectionOptions = useMemo(() => {
		if (!collectionValue || !selectedProductDetails) return null;
		return selectedProductDetails[collectionValue] ?? null;
	}, [selectedProductDetails, collectionValue]);

	// Compute initial options based on available data
	const initialOptions = useMemo(() => {
		if (pricesItems.needsDropdown && collectionOptions) {
			return {
				product: collectionOptions.products?.[0]?.text ?? collectionOptions.products?.[0] ?? "",
				productType: collectionOptions.productTypes?.[0]?.text ?? collectionOptions.productTypes?.[0] ?? "",
				productVar: collectionOptions.productTypes?.[0]?.value ?? collectionOptions.productTypes?.[0] ?? "",
				country: "",
			};
		}

		const fields = pricesItems.fields?.[0];
		return {
			product: fields?.products?.[0]?.text ?? fields?.products?.[0] ?? "",
			productType: fields?.productTypes?.[0]?.text ?? fields?.productTypes?.[0] ?? "",
			productVar: fields?.productTypes?.[0]?.value ?? fields?.productTypes?.[0] ?? "",
			country: "",
		};
	}, [pricesItems, collectionOptions]);

	// Reset country when collection changes (after initial mount)
	const previousCollection = useRef(collectionValue);
	useEffect(() => {
		if (previousCollection.current !== collectionValue) {
			previousCollection.current = collectionValue;
			// Reset country to empty so it gets set by the country validation effect in Products.js
			setPriceOptions((prev) => ({
				...prev,
				country: "",
			}));
		}
	}, [collectionValue]);

	// Mark first mount as complete after initial render
	useEffect(() => {
		if (isFirstMount.current) {
			isFirstMount.current = false;
		}
	}, []);

	// Initialize options when they become available (skip on first mount since we have hardcoded values)
	useEffect(() => {
		if (hasInitializedOptions.current) return;
		if (!initialOptions.product) return;

		// Skip initialization if we already have valid hardcoded values (first mount)
		if (priceOptions.product && priceOptions.productType && priceOptions.productVar) {
			hasInitializedOptions.current = true;
			return;
		}

		hasInitializedOptions.current = true;
		setPriceOptions((prev) => ({
			...prev,
			product: initialOptions.product,
			productType: initialOptions.productType,
			productVar: initialOptions.productVar,
		}));
	}, [initialOptions, priceOptions.product, priceOptions.productType, priceOptions.productVar]);

	const priceProducts = useMemo(() => {
		if (pricesItems.needsDropdown) {
			return collectionOptions?.products ?? [];
		}

		return pricesItems.fields[0]?.products ?? [];
	}, [collectionOptions?.products, pricesItems]);

	const priceProductTypes = useMemo(() => {
		if (pricesItems.needsDropdown) {
			return collectionOptions?.productTypes ?? [];
		}

		return pricesItems.fields[0]?.productTypes ?? [];
	}, [collectionOptions?.productTypes, pricesItems]);

	// Extract primitives for stable dependencies
	const { isValidDateRange, differenceInDays } = dateMetrics;
	const { product: priceProduct, productVar } = priceOptions;

	const isPriceConfigReady = Boolean(
		globalProduct
		&& isValidDateRange
		&& (priceProduct || productVar),
	);

	const priceConfigs = useMemo(
		() => {
			if (!isPriceConfigReady) return [];
			const configs = [];
			if (getPriceConfigs) {
				configs.push(...getPriceConfigs(
					globalProduct,
					startDate,
					endDate,
					differenceInDays,
					priceProduct,
					productVar,
					collectionValue,
				));
			}

			if (getMonthlyPriceConfigs) {
				configs.push(...getMonthlyPriceConfigs(
					globalProduct,
					customDate,
					priceProduct,
					productVar,
					collectionValue,
				));
			}

			return configs;
		},
		[
			isPriceConfigReady,
			globalProduct,
			startDate,
			endDate,
			differenceInDays,
			priceProduct,
			productVar,
			collectionValue,
		],
	);

	const priceState = useInit(organization, priceConfigs);

	return {
		priceOptions,
		setPriceOptions,
		selectedPriceCollection,
		setSelectedPriceCollection,
		priceProducts,
		priceProductTypes,
		priceCollections,
		collectionOptions,
		priceState,
		isPriceConfigReady,
		priceUnit: priceConfigs?.[0]?.unit || "",
	};
};
