import { memo, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { makeStyles } from "@mui/styles";
import { Grid, Typography } from "@mui/material";
import { Formik } from "formik";

import { validations } from "../utils/index.js";

// eslint-disable-next-line import/no-named-as-default
import Input from "./Input.js";
import { SecondaryBackgroundButton } from "./Buttons.js";
import Dropdown from "./Dropdown.js";
import Checkbox from "./Checkbox.js";
import RadioButtons from "./RadioButtons.js";
import Slider from "./Slider.js";
import Switch from "./Switch.js";
import DatePicker from "./DatePicker.js";

const useStyles = makeStyles((theme) => ({
	form: {
		width: "100%",
		display: "flex",
		justifyContent: "space-evenly",
		flexDirection: "column",
		alignItems: "center",
		textAlign: "center",
	},
	input: {
		color: "black",
		width: "100%",
		maxWidth: "300px",
		backgroundColor: "white",
		opacity: 0.7,
		borderRadius: "4px",
		marginBottom: "10px",
		"&:hover": {
			opacity: 0.8,
		},
	},
	dropdown: {
		width: "50%",
		maxWidth: "300px",
		marginBottom: "1px",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		color: "black",
	},
	checkboxBox: {
		width: "100%",
		maxWidth: "300px",
		marginBottom: "10px",
		display: "flex",
	},
	checkbox: {
		width: "100%",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		color: "black",
	},
	radioBox: {
		width: "100%",
		maxWidth: "300px",
		marginBottom: "10px",
		display: "flex",
		flexDirection: "column",
		color: "black",
	},
	sliderBox: {
		width: "100%",
		maxWidth: "600px",
		marginBottom: "10px",
		display: "flex",
		flexDirection: "column",
		color: "black",
	},
	datepickerBox: {
		maxWidth: "250px",
		marginBottom: "1px",
		display: "flex",
		flexDirection: "column",
		color: "black",
	},
	daterangeBox: {
		maxWidth: "550px",
		width: "100%",
		minWidth: "350px",
		marginBottom: "1px",
		display: "flex",
		justifyContent: "center",
		alignItems: "flex-end",
		flexDirection: "row",
		color: "white",
	},
	switchBox: {
		width: "100%",
		maxWidth: "300px",
		marginTop: "10px",
		marginBottom: "10px",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		color: "black",
	},
	buttonTitle: {
		color: "black",
		letterSpacing: theme.spacing(0.1),
	},
	markLabel: {
		color: "black",
	},
	button: {
		width: "100%",
		maxWidth: "300px",
	},
}));

const Form = forwardRef(({ disabled: dsb, content, validationSchema, onSubmit, onSubmitProps, toResetForm = true }, ref) => {
	const classes = useStyles();
	const [formContent, setFormContent] = useState(content);
	const [disabled, setDisabled] = useState(dsb);
	const formRef = useRef();

	useEffect(() => {
		setFormContent(content);
	}, [content]);

	useEffect(() => {
		setDisabled(dsb);
	}, [dsb]);

	useImperativeHandle(ref, () => ({
		getFormValues() {
			return formRef.current.values;
		},
	}));

	return (
		<Formik
			innerRef={formRef}
			initialValues={formContent.reduce((a, v) => (
				v.customType === "input"
					? { ...a, [v.id]: v.value || "" }
					: (v.customType === "dropdown"
					|| v.customType === "checkbox"
					|| v.customType === "radio"
					|| v.customType === "slider"
					|| v.customType === "switch"
						? { ...a, [v.id]: v.defaultValue }
						: (v.customType === "date-picker"
							? { ...a, [v.id]: v.value || null }
							: a
						)
					)
			), {})}
			validationSchema={validations?.[validationSchema] || null}
			validateOnChange={false}
			onSubmit={(...formikArgs) => {
				onSubmit(...formikArgs, onSubmitProps);
				const [, { resetForm, setSubmitting }] = formikArgs;
				if (toResetForm) resetForm();
				setSubmitting(false);
			}}
		>
			{(formikProps) => (
				<form className={classes.form} onSubmit={formikProps.handleSubmit}>
					{formContent.map((comp) => (
						<div
							key={comp.id}
							style={{ width: "100%", display: "flex", justifyContent: "center" }}
						>
							{comp.customType === "input"
							&& (
								<Input
									key={comp.id}
									id={comp.id}
									type={comp.type}
									multiline={comp.multiline}
									minRows={comp.minRows}
									maxRows={comp.maxRows}
									className={classes.input}
									placeholder={comp.placeholder}
									variant="filled"
									color="secondary"
									InputProps={comp.inputProps}
									value={formikProps.values[comp.id]}
									error={Boolean(formikProps.errors[comp.id])}
									helperText={formikProps.errors[comp.id]}
									disabled={disabled || comp.disabled}
									onChange={(event) => {
										formikProps.handleChange(event);
										if (comp.onChange) {
											comp.onChange(event);
										}
									}}
								/>
							)}
							{comp.customType === "dropdown"
							&& (
								<Grid item className={classes.dropdown}>
									<Dropdown
										id={comp.id}
										items={comp.items}
										placeholder={comp.label}
										value={comp.value || formikProps.values[comp.id]}
										disabled={disabled || comp.disabled}
										size={comp?.size || "medium"}
										width={comp?.width || "200px"}
										filled={comp?.filled || false}
										background={comp?.background || "primary"}
										onChange={(event) => {
											formikProps.handleChange({
												target: {
													name: comp.id,
													value: event.target.value,
												},
											});
											if (comp.onChange) {
												comp.onChange(event);
											}
										}}
									/>
								</Grid>
							)}
							{comp.customType === "checkbox"
							&& (
								<Grid container item className={classes.checkboxBox}>
									<Grid item className={classes.checkbox}>
										<Typography>{comp.label}</Typography>
										<Checkbox
											key={comp.id}
											id={comp.id}
											checked={formikProps.values[comp.id]}
											size={comp.size}
											color={comp.color}
											sx={{
												color: `${comp.color}.main`,
												"&.Mui-checked": {
													color: `${comp.color}.main`,
												},
											}}
											icon={comp.icon}
											checkedIcon={comp.checkedIcon}
											disabled={disabled || comp.disabled}
											onChange={(event) => {
												formikProps.handleChange({
													target: {
														name: comp.id,
														value: !formikProps.values[comp.id],
													},
												});
												if (comp.onChange) {
													comp.onChange(event);
												}
											}}
										/>
									</Grid>
									{Boolean(formikProps.errors[comp.id])
									&& (
										<Typography color="error" fontSize="small">{formikProps.errors[comp.id]}</Typography>
									)}
								</Grid>
							)}
							{comp.customType === "radio"
							&& (
								<Grid key={comp.id} container item className={classes.radioBox}>
									<Typography textAlign="left">{comp.label}</Typography>
									<RadioButtons
										id={comp.label}
										value={formikProps.values[comp.id]}
										row={comp.row}
										color={comp.color}
										labelPlacement={comp.labelPlacement}
										disabled={disabled || comp.disabled}
										items={comp.items}
										onChange={(event) => {
											formikProps.handleChange({
												target: {
													name: comp.id,
													value: event.target.value,
												},
											});
											if (comp.onChange) {
												comp.onChange(event);
											}
										}}
									/>
									{Boolean(formikProps.errors[comp.id])
									&& (
										<Typography textAlign="left" color="error" fontSize="small">{formikProps.errors[comp.id]}</Typography>
									)}
								</Grid>
							)}
							{comp.customType === "slider"
							&& (
								<Grid key={comp.id} container item className={classes.sliderBox}>
									<Typography textAlign="left">{comp.label}</Typography>
									<Slider
										iconBefore={comp.iconBefore}
										iconAfter={comp.iconAfter}
										color={comp.color || "secondary"}
										value={formikProps.values[comp.id]}
										min={comp.min}
										max={comp.max}
										marks={comp.marks}
										step={comp.step}
										size={comp.size}
										track={comp.track}
										valueLabelDisplay={comp.displayLabel}
										disabled={disabled || comp.disabled}
										onChange={(event) => {
											formikProps.handleChange({
												target: {
													name: comp.id,
													value: event.target.value,
												},
											});
											if (comp.onChange) {
												comp.onChange(event);
											}
										}}
									/>
									{Boolean(formikProps.errors[comp.id])
									&& (
										<Typography textAlign="left" color="error" fontSize="small">{formikProps.errors[comp.id]}</Typography>
									)}
								</Grid>
							)}
							{comp.customType === "switch"
							&& (
								<Grid key={comp.id} container item className={classes.switchBox}>
									<Typography textAlign="left">{comp.label}</Typography>
									<Switch
										color={comp.color || "secondary"}
										checked={formikProps.values[comp.id]}
										size={comp.size}
										disabled={disabled || comp.disabled}
										onChange={(event) => {
											formikProps.handleChange({
												target: {
													name: comp.id,
													value: !formikProps.values[comp.id],
												},
											});
											if (comp.onChange) {
												comp.onChange(event);
											}
										}}
									/>
									{Boolean(formikProps.errors[comp.id])
									&& (
										<Typography textAlign="left" color="error" fontSize="small">{formikProps.errors[comp.id]}</Typography>
									)}
								</Grid>
							)}
							{comp.customType === "date-picker" && (
								<Grid key={comp.id} container item className={classes.datepickerBox} width={comp.width || "170px"}>
									{comp.labelPosition === "side" ? (
										<Grid container spacing={1} alignItems="center">
											<Grid item sx={{ display: "flex", justifyContent: "flex-end" }} xs={10}>
												<DatePicker
													type={comp.type || "desktop"} // desktop, mobile, time, datetime
													value={comp.value ?? formikProps.values[comp.id]}
													minDate={comp.minDate}
													maxDate={comp.maxDate}
													disabled={disabled || comp.disabled}
													label={comp.label || ""}
													views={comp.views || ["day", "month", "year"]}
													background={comp.background || "primary"}
													color={comp.background === "grey" ? "black" : "white"}
													sx={{
														width: {
															xs: "100%", // Full width on extra-small screens
															sm: "75%", // 75% width on small screens
															md: "50%", // 50% width on medium screens
															lg: "25%", // 25% width on large screens
														},
													}}
													onChange={(value) => {
														formikProps.setFieldValue(comp.id, value);
														if (comp.onChange) {
															comp.onChange(value);
														}
													}}
												/>
											</Grid>
										</Grid>
									) : (
										<>
											<Typography textAlign="left" style={{ fontSize: comp.labelSize || "inherit" }}>
												{comp.label}
											</Typography>
											<DatePicker
												type={comp.type || "desktop"} // desktop, mobile, time, datetime
												value={comp.value ?? formikProps.values[comp.id]}
												minDate={comp.minDate}
												maxDate={comp.maxDate}
												disabled={disabled || comp.disabled}
												label={comp.sublabel || ""}
												views={comp.views || ["day", "month", "year"]}
												background={comp.background || "primary"}
												color="white"
												sx={{
													width: {
														xs: "100%", // Full width on extra-small screens
														sm: "75%", // 75% width on small screens
														md: "50%", // 50% width on medium screens
														lg: "25%", // 25% width on large screens
													},
												}}
												onChange={(value) => {
													formikProps.setFieldValue(comp.id, value);
													if (comp.onChange) {
														comp.onChange(value);
													}
												}}
											/>
										</>
									)}
									{Boolean(formikProps.errors[comp.id])
									&& (
										<Typography textAlign="left" color="error" fontSize="small">{formikProps.errors[comp.id]}</Typography>
									)}
								</Grid>
							)}
							{comp.customType === "date-range" && (
								<Grid key={comp.id} container item className={classes.daterangeBox}>
									<Grid container direction="row" width={comp.width || "350px"}>
										{comp.label && (
											<Grid item xs={2}>
												<Typography style={{ fontSize: comp.labelSize || "inherit" }}>
													{comp.label}
												</Typography>
											</Grid>
										)}
										<Grid container spacing={1} alignItems="center">
											<Grid item xs={6}>
												<DatePicker
													fullWidth
													type={comp.type || "desktop"}
													value={comp.startValue ?? formikProps.values[`${comp.id}_start`]}
													minDate={comp.minDate}
													maxDate={comp.maxDate}
													disabled={disabled || comp.disabled}
													label={comp.startLabel || "Start date"}
													views={comp.views || ["day", "month", "year"]}
													background={comp.background || "primary"}
													color="white"
													onChange={(value) => {
														formikProps.setFieldValue(`${comp.id}_start`, value);
														if (comp.onStartChange) {
															comp.onStartChange(value);
														}
													}}
												/>
											</Grid>
											<Grid item xs={6}>
												<DatePicker
													fullWidth
													type={comp.type || "desktop"}
													value={comp.endValue ?? formikProps.values[`${comp.id}_end`]}
													minDate={comp.minDate}
													maxDate={comp.maxDate}
													disabled={disabled || comp.disabled}
													label={comp.endLabel || "End date"}
													views={comp.views || ["day", "month", "year"]}
													background={comp.background || "primary"}
													color="white"
													onChange={(value) => {
														formikProps.setFieldValue(`${comp.id}_end`, value);
														if (comp.onEndChange) {
															comp.onEndChange(value);
														}
													}}
												/>
											</Grid>
										</Grid>
									</Grid>
								</Grid>
							)}
							{comp.customType === "button"
							&& (
								<SecondaryBackgroundButton
									id={comp.id}
									type={comp.type}
									disabled={formikProps.isSubmitting || disabled}
									className={classes.button}
									size="large"
									width="100%"
									title={comp.text}
								/>
							)}
						</div>
					))}
				</form>
			)}
		</Formik>
	);
});

export default memo(Form);
