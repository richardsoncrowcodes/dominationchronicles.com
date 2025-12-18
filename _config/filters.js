import { DateTime } from "luxon";

export default function(eleventyConfig) {
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat('yyyy-LL-dd');
	});
	eleventyConfig.addFilter("absoluteUrl", (path, baseUrl) => {
		if (!path) {
			return "";
		}
		if (/^https?:\/\//i.test(path)) {
			return path;
		}
		const base = (baseUrl || "").replace(/\/$/, "");
		const normalizedPath = path.startsWith("/") ? path : `/${path}`;
		return `${base}${normalizedPath}`;
	});
	eleventyConfig.addFilter("htmlBaseUrl", (path, baseUrl) => {
		if (!path) {
			return "";
		}
		return eleventyConfig.getFilter("absoluteUrl")(path, baseUrl);
	});
	eleventyConfig.addNunjucksFilter("limit", (arr, limit) => arr.slice(0, limit));
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if( n < 0 ) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	eleventyConfig.addFilter("getKeys", target => {
		return Object.keys(target);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all","episodes"].indexOf(tag) === -1);
	});

	eleventyConfig.addFilter("sortAlphabetically", strings =>
		(strings || []).sort((b, a) => b.localeCompare(a))
	);

	// Sort Eleventy collection items by data.publishDate (desc), fallback to item.date
	eleventyConfig.addNunjucksFilter("sortEpisodesByPublishDate", (arr) => {
		if(!Array.isArray(arr)) return arr;
		return arr.slice().sort((a, b) => {
			const ad = a?.data?.publishDate ? new Date(a.data.publishDate) : (a.date ? new Date(a.date) : new Date(0));
			const bd = b?.data?.publishDate ? new Date(b.data.publishDate) : (b.date ? new Date(b.date) : new Date(0));
			return bd - ad;
		});
	});

	// Sort plain objects (e.g., podcast items) by publishDate (desc)
	eleventyConfig.addNunjucksFilter("sortPodcastByPublishDate", (arr) => {
		if(!Array.isArray(arr)) return arr;
		return arr.slice().sort((a, b) => {
			const ad = a?.publishDate ? new Date(a.publishDate) : new Date(0);
			const bd = b?.publishDate ? new Date(b.publishDate) : new Date(0);
			return bd - ad;
		});
	});
};
