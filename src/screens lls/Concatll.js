import { Grid, linearProgressClasses, Typography } from "@mui/material";
import { memo, useRef, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import useInit from "../utils/screen-init.js";
import Footer from "../components/Footer.js";
import colors from "../_colors.scss";
import { sumByKey, groupByKey, getMaxValuesByProperty, getSumValuesByProperty, getCustomDateTime, calculateDates } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter, LoadingIndicator, DataWarning } from "../utils/rendering-items.js";

const CONCATLL = () => (
	<Grid container spacing={2} justifyContent="center" alignItems="center">
		<Grid item xs={12}>
			<DataWarning message="This screen is currently under construction" />
		</Grid>
		<Footer
			sticky
			customImages={[
				{
					src: "../ll_images/CONCATLL.png",
					alt: "CONCATLL Logo",
					link: { url: "https://www.irta.cat/en/noticia/concat-ll-project-starts-development-phase/", target: "_blank", rel: "noopener" },
				},
				{
					src: "../ll_images/IRTA.png",
					alt: "IRTA Logo",
					link: { url: "https://www.irta.cat/en/", target: "_blank", rel: "noopener" },
				},

			]}
			customMessage={(
				<>
					<Typography component="span" sx={{ fontWeight: "bold", fontSize: "0.975rem" }}>
						{"Disclaimer:"}
					</Typography>
					{" "}
					{"These materials have been generated using the CONCAT Wheat Production Dataset developed by IRTA. Each wheat variety has been anonymized using a unique numerical identifier. Users requiring the actual variety names may request this information from the dataset authors (marta.dasilva@irta.cat)."}
					<br />
				</>
			)}
			showDefaultCopyright={false}
		/>
	</Grid>
);

export default memo(CONCATLL);
