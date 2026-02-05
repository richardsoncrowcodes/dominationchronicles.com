import { collectRedirects, formatNetlifyRedirects } from "../_config/redirects.js";

export default class RedirectsFile {
	data() {
		return {
			permalink: "_redirects",
			eleventyExcludeFromCollections: true,
		};
	}

	render(data) {
		const redirects = collectRedirects({
			collections: data.collections,
			manual: data.redirects?.manual ?? [],
		});
		return formatNetlifyRedirects(redirects) + "\n";
	}
}
