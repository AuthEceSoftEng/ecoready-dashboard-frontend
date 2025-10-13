import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import StickyBand from "../components/StickyBand.js";
import useInit from "../utils/screen-init.js";
import secoConfigs, { organization } from "../config/SecoConfig.js";
import { calculateDates, debounce } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, DataWarning } from "../utils/rendering-items.js";

const timelineValues = ["Temperature", "Humidity", "Co2"];
const MIN_DATE = new Date(2023, 9, 1);
const MAX_DATE = new Date(new Date());

const SecoCollab = () => {
	const [metric, setMetric] = useState(timelineValues[0]);
	const [startDate, setStartDate] = useState("2025-05-01");
	const [endDate, setEndDate] = useState("2025-05-30");

	const isValidDateRange = useMemo(() => startDate && endDate && new Date(startDate) <= new Date(endDate),
		[startDate, endDate]);

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

	const formRefDate = useRef();
	const formContentDate = useMemo(() => [
		{
			customType: "date-range",
			id: "dateRange",
			minDate: MIN_DATE,
			maxDate: MAX_DATE,
			startValue: startDate,
			startLabel: "Start date",
			endValue: endDate,
			endLabel: "End date",
			labelSize: 12,
			onStartChange: (newValue) => handleDateChange(newValue, setStartDate),
			onEndChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [endDate, handleDateChange, startDate]);

	const fetchConfigs = useMemo(
		() => secoConfigs(startDate, endDate),
		[startDate, endDate],
	);
	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	console.log("dataSets", dataSets);

	const handleMetricChange = useCallback((event) => {
		const selectedMetric = event.target.value;
		if (timelineValues.includes(selectedMetric)) {
			setMetric(selectedMetric);
		}
	}, []);

	const metricsDropdownContent = useMemo(() => [
		{
			id: "timeline",
			size: "small",
			label: "Select Metric",
			items: timelineValues,
			value: metric,
			onChange: handleMetricChange,
		},
	], [handleMetricChange, metric]);

	const gaugesOverview = useMemo(() => [
		{
			subtitle: "Avg Temperature",
			min: 0,
			max: 40,
			value: dataSets.avgTemperature?.at(-1)?.avg_m_temp01 ?? null,
			color: "goldenrod",
			symbol: "°C",
		},
		{
			subtitle: "Avg Humidity",
			min: 0,
			max: 100,
			value: dataSets.avgHumidity?.at(-1)?.avg_m_hum01 ?? null,
			color: "third",
			symbol: "%",
		},
		{
			subtitle: "Avg Co2",
			min: 100,
			max: 1600,
			value: dataSets.avgCo2?.at(-1)?.avg_a_co2 ?? null,
			color: "secondary",
			symbol: "",
		},
	], [dataSets]);

	const chartConfigs = useMemo(() => [
		{
			metric: "Temperature",
			yAxisTitle: "Temperature (°C)",
			maxKey: "maxTemperature",
			minKey: "minTemperature",
			maxColor: "goldenrod",
			minColor: "gold",
			maxField: "max_m_temp01",
			minField: "min_m_temp01",
		},
		{
			metric: "Humidity",
			yAxisTitle: "Humidity (%)",
			maxKey: "maxHumidity",
			minKey: "minHumidity",
			maxColor: "primary",
			minColor: "third",
			maxField: "max_m_hum01",
			minField: "min_m_hum01",
		},
		{
			metric: "Co2",
			yAxisTitle: "Co2",
			maxKey: "maxCo2",
			minKey: "minCo2",
			maxColor: "green",
			minColor: "secondary",
			maxField: "max_a_co2",
			minField: "min_a_co2",
		},
	], []);

	const maxminOverview = useMemo(() => chartConfigs.map((config) => ({
		data: [
			{
				x: dataSets[config.maxKey]?.map((item) => item.interval_start) ?? [],
				y: dataSets[config.maxKey]?.map((item) => item[config.maxField]) ?? [],
				type: "bar",
				color: config.maxColor,
				title: `max${config.metric}`,
			},
			{
				x: dataSets[config.maxKey]?.map((item) => item.interval_start) ?? [],
				y: dataSets[config.minKey]?.map((item) => item[config.minField]) ?? [],
				type: "bar",
				color: config.minColor,
				title: `min${config.metric}`,
			},
		],
		yaxis: { title: config.yAxisTitle },
	})), [dataSets, chartConfigs]);

	const overviewData = useMemo(() => {
		if (!dataSets.overview?.length) return { timestamps: [] };

		return {
			timestamps: dataSets.overview.map((item) => item.timestamp),
			temperature: dataSets.overview.map((item) => item.m_temp01),
			humidity: dataSets.overview.map((item) => item.m_hum01),
			co2: dataSets.overview.map((item) => item.a_co2),
		};
	}, [dataSets.overview]);

	const timelineOverview = useMemo(() => [
		{
			data: [
				{
					x: overviewData.timestamps,
					y: overviewData.temperature,
					type: "scatter",
					mode: "lines",
					color: "goldenrod",
					title: "Temperature",
				},
			],
			yaxis: { title: "Temperature (°C)" },
		},
		{
			data: [
				{
					x: overviewData.timestamps,
					y: overviewData.humidity,
					type: "scatter",
					mode: "lines",
					color: "third",
					title: "Humidity",
				},
			],
			yaxis: { title: "Humidity (%)" },
		},
		{
			data: [
				{
					x: overviewData.timestamps,
					y: overviewData.co2,
					type: "scatter",
					mode: "markers",
					color: "secondary",
					title: "Co2",
				},
			],
			yaxis: { title: "Co2" },
		},
	], [overviewData]);

	const selectedTimelineData = useMemo(() => timelineOverview.find((plotData) => plotData.data[0].title === metric),
		[timelineOverview, metric]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand formRef={formRefDate} formContent={formContentDate} />
			{isValidDateRange ? (
				<>
					<Grid item xs={12} md={12} alignItems="center" flexDirection="row">
						<Card title="Period's Averages" footer={cardFooter({ minutesAgo })}>
							{isLoading ? (<LoadingIndicator />
							) : gaugesOverview.some((plot) => plot.value !== null) ? (
								<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
									{gaugesOverview.map((plot, index) => (
										<Grid key={index} item xs={12} md={4} justifyContent="center" sx={{ height: "200px" }}>
											{plot.value === null ? (
												<DataWarning minHeight="200px" />
											) : (
												<Plot
													scrollZoom
													data={[
														{
															type: "indicator",
															mode: "gauge+number",
															value: plot.value,
															range: [plot.min, plot.max],
															color: plot.color,
															shape: "angular",
															indicator: "primary",
															textColor: "primary",
															suffix: plot.symbol,
														},
													]}
													displayBar={false}
													title={plot.subtitle}
												/>
											)}
										</Grid>
									))}
								</Grid>
							) : (<DataWarning message="No overview data available" />
							)}
						</Card>
					</Grid>
					<Grid item xs={12} md={12} alignItems="center" flexDirection="column">
						<Card title="Period's Max vs Min Values" footer={cardFooter({ minutesAgo })}>
							{isLoading ? (<LoadingIndicator />
							) : (
								<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
									{maxminOverview.map((plot, index) => (
										<Grid key={index} item xs={12} md={4} justifyContent="center">
											<Plot
												key={index}
												scrollZoom
												height="250px"
												showLegend={false}
												data={plot.data}
												displayBar={false}
												yaxis={plot.yaxis}
											/>
										</Grid>
									))}
								</Grid>
							)}
						</Card>
					</Grid>
					<Grid item xs={12} md={12} alignItems="center" flexDirection="column" mb={1}>
						<Card title="Timeline's Overview" footer={cardFooter({ minutesAgo })}>
							<Grid item xs={12} md={12} display="flex" justifyContent="flex-end">
								<StickyBand sticky={false} dropdownContent={metricsDropdownContent} />
							</Grid>
							{isLoading ? (<LoadingIndicator />
							) : selectedTimelineData ? (
								<Plot
									scrollZoom
									height="350px"
									data={selectedTimelineData.data}
									showLegend={false}
									displayBar={false}
									yaxis={selectedTimelineData.yaxis}
								/>
							) : null}
						</Card>
					</Grid>
				</>
			) : (
				<Grid item xs={12}>
					<DataWarning message="Please select a valid date range" />
				</Grid>
			)}
		</Grid>
	);
};

export default memo(SecoCollab);
