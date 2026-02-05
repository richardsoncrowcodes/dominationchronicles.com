function toArray(value) {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}

function normalizeFrom(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (trimmed.startsWith("^")) {
		return trimmed;
	}
	if (trimmed.startsWith("/")) {
		return trimmed;
	}
	return `/${trimmed}`;
}

export function collectRedirects({ collections, manual = [] }) {
	const redirects = [];
	const seen = new Map();
	const conflicts = [];

	const addRedirect = ({ from, to, permanent = true, source }) => {
		if (!from || !to) return;
		const existing = seen.get(from);
		if (existing) {
			if (existing.to !== to || existing.permanent !== permanent) {
				conflicts.push({
					from,
					existing,
					incoming: { to, permanent, source },
				});
			}
			return;
		}
		const entry = { from, to, permanent, source };
		seen.set(from, entry);
		redirects.push(entry);
	};

	for (const entry of manual) {
		if (!entry) continue;
		const from = normalizeFrom(entry.from);
		addRedirect({
			from,
			to: entry.to,
			permanent: entry.permanent !== false,
			source: "manual",
		});
	}

	const items = collections?.all ?? [];
	for (const item of items) {
		const redirectFrom = item?.data?.redirect_from;
		if (!redirectFrom) continue;
		const to = item.url || item?.data?.page?.url;
		if (!to) continue;
		for (const rawFrom of toArray(redirectFrom)) {
			const from = normalizeFrom(rawFrom);
			addRedirect({
				from,
				to,
				permanent: true,
				source: item?.data?.page?.inputPath || item?.inputPath,
			});
		}
	}

	if (conflicts.length) {
		const details = conflicts
			.map(
				(conflict) =>
					`${conflict.from} -> ${conflict.existing.to} (existing) vs ${conflict.incoming.to} (incoming)`
			)
			.join("\n");
		throw new Error(`Redirect conflicts detected:\n${details}`);
	}

	return redirects;
}

export function formatNetlifyRedirects(redirects) {
	return redirects
		.map((entry) => {
			const status = entry.permanent ? 301 : 302;
			return `${entry.from} ${entry.to} ${status}`;
		})
		.join("\n");
}

export function formatXmitConfig({ redirects, notFound = "404.html" }) {
	return JSON.stringify(
		{
			"404": notFound,
			redirects: redirects.map(({ from, to, permanent }) => ({
				from,
				to,
				permanent: Boolean(permanent),
			})),
		},
		null,
		2
	);
}
