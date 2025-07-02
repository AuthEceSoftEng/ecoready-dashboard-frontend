module.exports = {
	apps: [{
		name: "client",
		script: "npm",
		args: ["run", "serve"],
		instances: 2,
		exec_mode: "cluster",
	}],
};
