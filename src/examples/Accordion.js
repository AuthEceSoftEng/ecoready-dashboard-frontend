import { Grid, Typography } from "@mui/material";
import { memo } from "react";

import Accordion from "../components/Accordion.js";

const AccordionExample = () => (
	<Grid container direction="column" alignItems="center">
		<Grid item width="100%">
			<Accordion
				title="Accordion Title"
				subtitle="Accordion Subtitle"
				content="
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                    malesuada lacus ex, sit amet blandit leo lobortis eget.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                    malesuada lacus ex, sit amet blandit leo lobortis eget."
				alwaysExpanded={false}
			/>
		</Grid>
		<Grid item width="100%" mt={5}>
			<Accordion
				title="Accordion Second Title"
				subtitle="Accordion Subtitle"
				content={(
					<Grid container flexDirection="column">
						<Grid item sx={{ background: "red" }}>
							<Typography>{"Example"}</Typography>
						</Grid>
						<Grid item mt={2} sx={{ background: "green" }}>
							<Typography>{"Example"}</Typography>
						</Grid>
					</Grid>
				)}
				alwaysExpanded={false}
			/>
		</Grid>
		<Grid item width="100%" mt={5}>
			<Accordion
				alwaysExpanded
				title="Accordion Always Expanded"
				content="This accordion is always expanded and does not have subtitle"
			/>
		</Grid>
	</Grid>
);

export default memo(AccordionExample);
