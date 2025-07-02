import { createWithEqualityFn } from "zustand/traditional";
import { persist } from "zustand/middleware";

export default createWithEqualityFn(persist(
	(setState) => ({
		name: "",
		setName: (name) => setState({ name }),
		defaultPageSize: 5,
		setDefaultPageSize: (defaultPageSize) => setState({ defaultPageSize }),
	}),
	{
		name: "template-frontend",
	},
));
