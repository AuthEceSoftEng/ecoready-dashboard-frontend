import { Grid, Typography, Link } from "@mui/material";
import { memo, useState } from "react";
import Image from "mui-image";

import { SecondaryBorderButton } from "../components/Buttons.js";
import FileUpload from "../components/FileUpload.js";
import { jwt, useSnackbar } from "../utils/index.js";
import { deleteFile } from "../api/index.js";

const { REACT_APP_MAIN_SERVER_URL } = process.env;

const folder = "example";

const ButtonsExample = () => {
	const [saveName, setSaveName] = useState("");
	const [originalName, setOriginalName] = useState("");
	const [imageSaveName, setImageSaveName] = useState("");
	const { success, error } = useSnackbar();

	const uploadSuccess = ({ originalName: oName, saveName: sName }) => {
		setSaveName(sName);
		setOriginalName(oName);
	};

	const uploadSuccessImage = ({ saveName: sName }) => {
		setImageSaveName(sName);
	};

	const onDelete = async () => {
		const { success: deleteSuccess } = await deleteFile({ folder, saveName });
		if (deleteSuccess) {
			success("File deleted successfully");
			setSaveName("");
			setOriginalName("");
		} else {
			error();
		}
	};

	const onDeleteImage = async () => {
		const { success: deleteSuccess } = await deleteFile({ folder, saveName: imageSaveName });
		if (deleteSuccess) {
			success("Image deleted successfully");
			setImageSaveName("");
		} else {
			error();
		}
	};

	return (
		<Grid container display="flex" direction="column" justifyContent="center" alignItems="center">
			<Grid item>
				{!saveName && <Typography color="grey.dark">{"No uploaded file!"}</Typography>}
				{saveName
				&& (
					<Link href={`${REACT_APP_MAIN_SERVER_URL}/uploads/${folder}/${saveName}?token=${jwt.getToken()}`} target="_blank" color="secondary">
						{originalName || "Download File"}
					</Link>
				)}
			</Grid>
			<Grid item mt={2}>
				<FileUpload
					id="file-upload"
					folder={folder}
					component="button"
					oldFile={saveName}
					acceptAttribute="pdf"
					onSuccess={uploadSuccess}
				/>
			</Grid>
			{saveName
			&& (
				<Grid item mt={2}>
					<SecondaryBorderButton
						title="Delete File"
						onClick={onDelete}
					/>
				</Grid>
			)}
			<Grid item mt={4}>
				{!imageSaveName && <Typography color="grey.dark">{"No uploaded image!"}</Typography>}
				{imageSaveName
				&& (
					<Image src={`${REACT_APP_MAIN_SERVER_URL}/uploads/${folder}/${imageSaveName}?token=${jwt.getToken()}`} width="500px" height="400px" fit="contain" />
				)}
			</Grid>
			<Grid item mt={2}>
				<FileUpload
					id="image-upload"
					folder={folder}
					component="button"
					oldFile={imageSaveName}
					acceptAttribute="image"
					onSuccess={uploadSuccessImage}
				/>
			</Grid>
			{imageSaveName
			&& (
				<Grid item mt={2}>
					<SecondaryBorderButton
						title="Delete Image"
						onClick={onDeleteImage}
					/>
				</Grid>
			)}
		</Grid>
	);
};

export default memo(ButtonsExample);
