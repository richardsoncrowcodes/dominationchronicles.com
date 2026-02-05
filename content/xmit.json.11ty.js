import { collectRedirects, formatXmitConfig } from "../_config/redirects.js";

export default class XmitConfig {
	data() {
		return {
			permalink: "xmit.json",
			eleventyExcludeFromCollections: true,
		};
	}

	render(data) {
		const redirects = collectRedirects({
			collections: data.collections,
			manual: data.redirects?.manual ?? [],
		});
		return formatXmitConfig({ redirects }) + "\n";
	}
}
