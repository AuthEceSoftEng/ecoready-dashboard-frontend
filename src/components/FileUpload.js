import { useEffect, useState } from "react";
import { ToggleButton } from "@mui/material";
import { UploadFile } from "@mui/icons-material";

import { uploadFile, reUploadFile } from "../api/index.js";
import { useSnackbar } from "../utils/index.js";

import { SecondaryBackgroundButton } from "./Buttons.js";

const files = {
	pdf: "application/pdf",
	audio: "audio/*",
	video: "video/*",
	image: "image/*",
};

const FileUpload = ({ id, folder: fold = null, oldFile: oFile = null, component: comp = "button", disabled: dis = false, acceptAttribute: aAttribute = "*", onSuccess = () => {} }) => {
	const [componentId, setComponentId] = useState(id);
	const [folder, setFolder] = useState(fold);
	const [oldFile, setOldFile] = useState(oFile);
	const [component, setComponent] = useState(comp);
	const [disabled, setDisabled] = useState(dis);
	const [acceptAttribute, setAcceptAttribute] = useState(dis);
	const { success, error } = useSnackbar();

	useEffect(() => {
		setComponentId(id);
	}, [id]);

	useEffect(() => {
		setFolder(fold);
	}, [fold]);

	useEffect(() => {
		setOldFile(oFile);
	}, [oFile]);

	useEffect(() => {
		setComponent(comp);
	}, [comp]);

	useEffect(() => {
		setDisabled(dis);
	}, [dis]);

	useEffect(() => {
		setAcceptAttribute(aAttribute);
	}, [aAttribute]);

	const onFileUpload = async (e) => {
		const file = e.target.files[0];
		const { name } = file;

		const specialCharacters = /["*/:<>?\\|]/;

		if (specialCharacters.test(name.split(name.slice(name.lastIndexOf(".") + 1))[0])) {
			error("File name should not contain any special character");
		} else {
			const formData = new FormData();

			formData.append("folder", folder);
			if (oldFile) formData.append("oldFile", oldFile);
			formData.append("file", file);
			const response = await ((oldFile) ? reUploadFile(formData) : uploadFile(formData));
			if (response.success) {
				success("File uploaded successfully");
				onSuccess(response);
			} else {
				error("There was a problem uploading the file");
			}
		}
	};

	return (
		<>
			{component === "button"
			&& (
				<SecondaryBackgroundButton
					size="small"
					sx={{ px: 5, py: 1 }}
					disabled={disabled}
					title={(oldFile ? "Reupload file" : "Upload file")}
					onClick={() => {
						const fileInput = document.querySelector(`#${componentId}`);
						fileInput.click();
					}}
				/>
			)}
			{component !== "button"
			&& (
				<ToggleButton
					value="view"
					title="view"
					aria-label="view"
					sx={{ borderColor: "secondary.main" }}
					disabled={disabled}
					onClick={() => {
						const fileInput = document.querySelector(`#${componentId}`);
						fileInput.click();
					}}
				>
					<UploadFile color="secondary" />
				</ToggleButton>
			)}
			<input
				id={componentId}
				type="file"
				accept={files[acceptAttribute]}
				style={{ display: "none", position: "relative", zIndex: "2" }}
				onChange={onFileUpload}
				onClick={(event) => { event.target.value = null; }}
			/>
		</>
	);
};

export default FileUpload;
