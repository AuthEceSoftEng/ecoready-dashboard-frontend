import { useMemo, useState, useEffect, useRef } from "react";

import { getPriceConfigs, getMonthlyPriceConfigs, organization } from "../config/ProductConfig.js";
import useInit from "../utils/screen-init.js";
import { extractFields, getCustomDateTime } from "../utils/data-handling-functions.js";

const customDate = getCustomDateTime(2024, 12);

const DEFAULT_PRICE_OPTIONS = {
	product: "Japonica",
	productType: "Avg",
	productVar: "Avg",
	country: "Greece",
};

const EMPTY_PRICE_OPTIONS = {
	product: "",
	productType: "",
	productVar: "",
	country: "",
};

export const PriceData = (globalProduct, selectedProductDetails, startDate, endDate, dateMetrics) => {
	const isFirstMount = useRef(true);
	const previousProduct = useRef(globalProduct);
	const hasInitializedCollection = useRef(false);

	const { pricesItems, priceCollections } = useMemo(() => {
		const items = extractFields(selectedProductDetails, "prices") || { fields: [], needsDropdown: false };
		return {
			pricesItems: items,
			priceCollections: items.needsDropdown ? items.collections : [],
		};
	}, [selectedProductDetails]);

	const [selectedPriceCollection, setSelectedPriceCollection] = useState(priceCollections?.[0] ?? "");
	const [priceOptions, setPriceOptions] = useState(() => (isFirstMount.current ? DEFAULT_PRICE_OPTIONS : EMPTY_PRICE_OPTIONS));

	useEffect(() => {
		if (previousProduct.current !== globalProduct) {
			previousProduct.current = globalProduct;
			hasInitializedCollection.current = false;
			setSelectedPriceCollection("");
		}
	}, [globalProduct]);

	useEffect(() => {
		if (!hasInitializedCollection.current && priceCollections?.length) {
			setSelectedPriceCollection(priceCollections[0]);
			hasInitializedCollection.current = true;
		}
	}, [priceCollections]);

	const collectionValue = selectedPriceCollection?.value;

	// Mark first mount as complete after initial render
	useEffect(() => { isFirstMount.current = false; }, []);

	const collectionOptions = useMemo(() => {
		if (!collectionValue || !selectedProductDetails) return null;
		return selectedProductDetails[collectionValue] ?? null;
	}, [selectedProductDetails, collectionValue]);

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

	const isPriceConfigReady = Boolean(globalProduct && isValidDateRange && (priceProduct || productVar));

	const priceConfigs = useMemo(
		() => {
			// if (!isPriceConfigReady) return [];
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
		[globalProduct, startDate, endDate, differenceInDays, priceProduct, productVar, collectionValue],
	);

	const priceState = useInit(organization, priceConfigs);

	const priceUnit = useMemo(() => priceConfigs?.[0]?.unit || "", [priceConfigs]);

	return {
		priceOptions,
		setPriceOptions,
		selectedPriceCollection,
		setSelectedPriceCollection,
		priceProducts,
		priceProductTypes,
		priceCollections,
		priceState,
		isPriceConfigReady,
		priceUnit,
	};
};
