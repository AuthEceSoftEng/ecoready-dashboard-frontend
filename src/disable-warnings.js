const originalConsoleError = console.error;

console.error = (message, ...args) => {
	if (typeof message === "string"
    && message.includes("Support for defaultProps will be removed from function components in a future major release.")
	) {
		return;
	}

	originalConsoleError(message, ...args);
};
