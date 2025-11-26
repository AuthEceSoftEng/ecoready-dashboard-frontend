import { useMemo, useState, useCallback, useEffect } from "react";

import { getProductionConfigs, organization } from "../config/ProductConfig.js";
import useInit from "../utils/screen-init.js";
import { extractFields } from "../utils/data-handling-functions.js";

export const ProductionData = (globalProduct, selectedProductDetails, startDate, endDate, dateMetrics) => {
	const productionItems = useMemo(() => extractFields(selectedProductDetails, "production") || [], [selectedProductDetails]);
	const productionFields = useMemo(() => productionItems.fields[0] ?? {}, [productionItems]);
	const productionProducts = useMemo(() => productionFields.products ?? [], [productionFields]);
	const productTypes = useMemo(() => productionFields.productTypes ?? [], [productionFields]);
	const productionMetrics = useMemo(() => productionFields.productionMetrics ?? [], [productionFields]);

	const [productionOptions, setProductionOptions] = useState({
		year: "2024",
		product: productionProducts?.[0] ?? null,
		productType: productTypes?.[0] ?? null,
		productionMetricType: productionMetrics?.[0]?.text ?? null,
		productionMetricVal: productionMetrics?.[0]?.value ?? null,
	});

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

	const productionConfigs = useMemo(
		() => {
			if (!isProductionConfigReady) return [];
			return getProductionConfigs(
				globalProduct,
				startDate,
				endDate,
				dateMetrics.differenceInDays,
				productionOptions.product,
				productionOptions.productionMetricVal,
				productionOptions.productType,
			) || [];
		},
		[isProductionConfigReady, globalProduct, startDate, endDate, dateMetrics.differenceInDays, productionOptions],
	);

	const productionState = useInit(organization, productionConfigs);

	useEffect(() => {
		const isProductionReady = Boolean(
			globalProduct
            && Object.values(productionOptions).some(Boolean)
            && !productionState.state.error,
		);
		setIsProductionConfigReady(isProductionReady);
	}, [globalProduct, productionOptions, productionState.state.error]);

	return {
		productionOptions,
		setProductionOptions,
		productionProducts,
		productTypes,
		productionMetrics,
		handleProductionMetricChange,
		productionState,
		isProductionConfigReady,
		productionUnit: productionConfigs?.[0]?.unit || "",
	};
};
