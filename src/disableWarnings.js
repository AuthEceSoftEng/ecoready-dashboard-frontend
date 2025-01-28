const originalConsoleError = console.error;

console.error = (message, ...args) => {
  console.log("Intercepted console.error:", message); // Debug log
  if (
    typeof message === "string" &&
    message.includes(
      "Support for defaultProps will be removed from function components in a future major release."
    )
  ) {
    return;
  }

  originalConsoleError(message, ...args);
};
