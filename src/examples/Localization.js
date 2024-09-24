import { Grid, Typography } from "@mui/material";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import {
	SecondaryBackgroundButton,
	SecondaryBorderButton,
} from "../components/Buttons.js";

const lngs = {
	en: { nativeName: "English" },
	gr: { nativeName: "Ελληνικά" },
};

const LocalizationExample = () => {
	const { t, i18n } = useTranslation();
	return (
		<Grid container display="flex" direction="column" justifyContent="center" alignItems="center">
			<Grid item>
				<Typography align="center" variant="h6" color="white.main">{t("examples.example1")}</Typography>
			</Grid>
			<Grid item mt={2}>
				<Typography align="center" variant="h6" color="white.main">{t("examples.example2")}</Typography>
			</Grid>
			<Grid item mt={2} display="flex" justifyContent="space-between" width="500px">
				{Object.keys(lngs).map((lng) => (
					<span key={lng}>
						{i18n.resolvedLanguage === lng
						&& (
							<SecondaryBorderButton
								key={lng}
								title={lngs[lng].nativeName}
								onClick={() => { i18n.changeLanguage(lng); }}
							>
								{lngs[lng].nativeName}
							</SecondaryBorderButton>
						)}
						{i18n.resolvedLanguage !== lng
						&& (
							<SecondaryBackgroundButton key={lng} title={lngs[lng].nativeName} onClick={() => { i18n.changeLanguage(lng); }}>
								{lngs[lng].nativeName}
							</SecondaryBackgroundButton>
						)}
					</span>
				))}
			</Grid>
		</Grid>
	);
};

export default memo(LocalizationExample);
