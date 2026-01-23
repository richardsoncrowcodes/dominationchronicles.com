import EleventyFetch from "@11ty/eleventy-fetch";

const REPO = "adamdjbrett/dominationchronicles.com";
const API_ENDPOINT = `https://api.github.com/repos/${REPO}/contributors?per_page=100`;

export default async function () {
	const headers = {
		"User-Agent": "EleventyFetch",
		Accept: "application/vnd.github+json",
	};
	const token = process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN_PUBLIC;
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	try {
		const contributors = await EleventyFetch(API_ENDPOINT, {
			duration: "12h",
			type: "json",
			fetchOptions: {
				headers,
			},
		});

		if (!Array.isArray(contributors)) {
			return [];
		}

		return contributors
			.filter((person) => person && person.login && person.type !== "Bot")
			.map((person) => ({
				login: person.login,
				url: person.html_url,
				contributions: person.contributions,
				avatar: person.avatar_url,
			}));
	} catch (error) {
		console.warn(`[githubContributors] Failed to load contributors: ${error.message}`);
		return [];
	}
}
