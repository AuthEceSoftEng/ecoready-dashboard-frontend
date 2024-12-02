export class TimerManager {
	constructor(fetchCallback, updateMinutesCallback) {
		this.fetchInterval = 30 * 60 * 1000; // 30 minutes
		this.minuteInterval = 60 * 1000; // 1 minute
		this.fetchTimer = null;
		this.minuteTimer = null;
		this.fetchCallback = fetchCallback;
		this.updateMinutesCallback = updateMinutesCallback;
	}

	start() {
		// Initial fetch
		this.fetchCallback();

		// Setup timers
		this.fetchTimer = setInterval(this.fetchCallback, this.fetchInterval);
		this.minuteTimer = setInterval(this.updateMinutesCallback, this.minuteInterval);
	}

	stop() {
		clearInterval(this.fetchTimer);
		clearInterval(this.minuteTimer);
	}

	reset() {
		this.stop();
		this.start();
	}
}

export const timeUtils = {
	getTimeUntilNextFetch: (lastFetchTime) => {
		const now = new Date();
		const nextFetch = new Date(lastFetchTime.getTime() + 30 * 60 * 1000);
		return Math.max(0, nextFetch - now);
	},

	formatMinutesAgo: (minutes) => {
		if (minutes < 1) return "just now";
		if (minutes === 1) return "1 minute ago";
		return `${minutes} minutes ago`;
	},

	shouldFetch: (lastFetchTime) => {
		if (!lastFetchTime) return true;
		return Date.now() - lastFetchTime.getTime() >= 30 * 60 * 1000;
	},
};
