import { Grid, InputAdornment } from "@mui/material";
import { memo, useRef, useState } from "react";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import VerifiedUser from "@mui/icons-material/VerifiedUser";
import VerifiedUserOutlined from "@mui/icons-material/VerifiedUserOutlined";
import { VolumeDown, VolumeUp } from "@mui/icons-material";

import Form from "../components/Form.js";
import { useSnackbar } from "../utils/index.js";
import { SecondaryBorderButton } from "../components/Buttons.js";

const FormExample = () => {
	const { info } = useSnackbar();
	const [showPassword, setShowPassword] = useState(false);
	const formRef = useRef();

	const handleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	const onSubmit = (values) => {
		console.log(values);
		info("Form submitted");
	};

	const formContent = [
		{
			customType: "input",
			id: "username",
			type: "text",
			placeholder: "Username",
			inputProps: {
				endAdornment: (
					<InputAdornment position="start">
						<IconButton disabled>
							<AccountCircle />
						</IconButton>
					</InputAdornment>
				),
			},
			onChange: (event) => console.log(`Username changed to ${event.target.value}`),
		},
		{
			customType: "input",
			id: "description",
			type: "text",
			multiline: true,
			placeholder: "Description",
			minRows: 5,
		},
		{
			customType: "input",
			id: "password",
			type: showPassword ? "text" : "password",
			placeholder: "Password",
			inputProps: {
				endAdornment: (
					<InputAdornment position="start">
						<IconButton
							aria-label="toggle password visibility"
							onClick={handleShowPassword}
						>
							{showPassword ? <Visibility /> : <VisibilityOff />}
						</IconButton>
					</InputAdornment>
				),
			},
		},
		{
			customType: "checkbox",
			id: "agree",
			label: "Agree",
			defaultValue: true,
			color: "secondary",
			disabled: false,
		},
		{
			customType: "checkbox",
			id: "verified",
			label: "Verified",
			defaultValue: false,
			color: "secondary",
			icon: <VerifiedUserOutlined />,
			checkedIcon: <VerifiedUser />,
			disabled: false,
		},
		{
			customType: "radio",
			id: "gender",
			label: "Gender",
			defaultValue: "male",
			color: "secondary",
			labelPlacement: "end",
			items: [
				{ value: "male", label: "Male" },
				{ value: "female", label: "Female" },
				{ value: "other", label: "Other" },
				{ value: "wrong", label: "Wrong", disabled: true },
			],
		},
		{
			customType: "radio",
			id: "status",
			label: "Status",
			defaultValue: true,
			color: "third",
			labelPlacement: "end",
			row: true,
			items: [
				{ value: true, label: "Active" },
				{ value: false, label: "Inactive" },
			],
		},
		{
			customType: "slider",
			id: "range",
			label: "Range",
			defaultValue: 50,
			displayLabel: "off",
			color: "third",
			step: 5,
		},
		{
			customType: "slider",
			id: "volume",
			label: "Volume",
			defaultValue: 50,
			iconBefore: <VolumeDown />,
			iconAfter: <VolumeUp />,
			// step: null,
			track: "normal",
			marks: [
				{ value: 0, label: "0" },
				{ value: 10, label: "10" },
				{ value: 20, label: "20" },
				{ value: 30, label: "30" },
				{ value: 40, label: "40" },
				{ value: 50, label: "50" },
				{ value: 75, label: "75" },
				{ value: 100, label: "100" },
			],
			onChange: (event) => console.log(`Volume: ${event.target.value}`),
		},
		{
			customType: "switch",
			id: "active",
			label: "Active",
			defaultValue: true,
		},
		{
			customType: "date-picker",
			id: "birthday",
			type: "desktop",
			label: "Birthday",
		},
		{
			customType: "button",
			id: "submit",
			type: "submit",
			text: "Submit",
		},
	];

	return (
		<Grid container display="flex" direction="column" justifyContent="center" alignItems="center">
			<Grid item width="500px" display="flex" alignItems="center" flexDirection="column">
				<Form ref={formRef} content={formContent} validationSchema="exampleSchema" onSubmit={onSubmit} />
				<Grid item marginTop="10px">
					<SecondaryBorderButton title="Get Form Values" onClick={() => console.log(formRef.current.getFormValues())} />
				</Grid>
			</Grid>
		</Grid>
	);
};

export default memo(FormExample);
