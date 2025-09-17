import { Pagination, Typography, Box } from "@mui/material";

const PaginationControls = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) => {
	const startItem = currentPage * itemsPerPage + 1;
	const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				gap: 1,
				margin: "16px 0",
			}}
		>
			<Pagination
				showFirstButton
				showLastButton
				hidePrevButton
				hideNextButton
				count={totalPages}
				page={currentPage + 1}
				// variant="outlined"
				color="primary"
				size="small"
				siblingCount={1}
				boundaryCount={1}
				onChange={(event, value) => onPageChange(value - 1)}
			/>
			<Typography
				variant="body2"
				color="text.secondary"
				sx={{ fontSize: "0.875rem" }}
			>
				{"Showing "}
				{startItem}
				{"-"}
				{endItem}
				{" "}
				{"of"}
				{totalItems}
				{" "}
				{"items"}
			</Typography>
		</Box>
	);
};

export default PaginationControls;
