import { useMemo, useState, useCallback, useEffect } from "react";

import { getProductionConfigs, organization } from "../config/ProductConfig.js";
import useInit from "../utils/screen-init.js";
import { extractFields } from "../utils/data-handling-functions.js";

export const ProductionData = (globalProduct, selectedProductDetails, startDate, endDate, dateMetrics) => {
	const { productionProducts, productTypes, productionMetrics } = useMemo(() => {
		const items = extractFields(selectedProductDetails, "production") || { fields: [] };
		const fields = items.fields[0] ?? {};
		return {
			productionProducts: fields.products ?? [],
			productTypes: fields.productTypes ?? [],
			productionMetrics: fields.productionMetrics ?? [],
		};
	}, [selectedProductDetails]);

	const [productionOptions, setProductionOptions] = useState({
		year: "2024",
		product: productionProducts?.[0] ?? "",
		productType: productTypes?.[0] ?? "",
		productionMetricType: productionMetrics?.[0]?.text ?? "",
		productionMetricVal: productionMetrics?.[0]?.value ?? "",
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

	const productionUnit = useMemo(() => productionConfigs?.[0]?.unit || "", [productionConfigs]);

	return {
		productionOptions,
		setProductionOptions,
		productionProducts,
		productTypes,
		productionMetrics,
		handleProductionMetricChange,
		productionState,
		isProductionConfigReady,
		productionUnit,
	};
};
