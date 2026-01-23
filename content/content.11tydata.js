export default {
	layout: "base.njk",
	published: true,
	eleventyComputed: {
		permalink: (data) => {
			if (data.published === false) {
				return false;
			}
			return data.permalink;
		},
		eleventyExcludeFromCollections: (data) => {
			if (data.published === false) {
				return true;
			}
			return data.eleventyExcludeFromCollections;
		},
	},
};
