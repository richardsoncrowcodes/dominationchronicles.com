import { promises as fs } from "node:fs";
import path from "node:path";

const EPISODES_DIR = path.join(process.cwd(), "content", "episodes");

export default async function () {
	try {
		const entries = await fs.readdir(EPISODES_DIR, { withFileTypes: true });
		return entries
			.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
			.map((entry) => entry.name.replace(/\.md$/i, ""));
	} catch (error) {
		console.warn("[localEpisodes] Unable to read episodes directory:", error.message);
		return [];
	}
}
