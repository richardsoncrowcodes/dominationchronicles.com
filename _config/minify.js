import crypto from "node:crypto";
import path from "node:path";
import { readFile } from "node:fs/promises";
import minifyHtml from "@minify-html/node";

const htmlCache = new Map();
const inlineCssCache = new Map();

const htmlMinifyOptions = {
	keep_closing_tags: true,
	minify_css: true,
	minify_js: true,
	remove_processing_instructions: true,
};

async function memoizedHtmlMinify(content) {
	const key = crypto.createHash("sha1").update(content).digest("hex");
	if (htmlCache.has(key)) {
		return htmlCache.get(key);
	}
	const minifiedBuffer = minifyHtml.minify(Buffer.from(content), htmlMinifyOptions);
	const minified = minifiedBuffer.toString("utf8");
	htmlCache.set(key, minified);
	return minified;
}

export function registerHtmlMinifier(eleventyConfig, shouldMinify) {
	eleventyConfig.addTransform("html-minify", async function (content) {
		const outputPath = this.outputPath;
		if (
			!shouldMinify ||
			typeof outputPath !== "string" ||
			!outputPath.endsWith(".html")
		) {
			return content;
		}
		try {
			return await memoizedHtmlMinify(content);
		} catch (error) {
			console.warn(`[html-minify] Failed for ${outputPath}:`, error.message);
			return content;
		}
	});
}

export function registerInlineCssShortcode(eleventyConfig) {
	// Based on the Eleventy Quick Tip for inlining CSS to avoid extra requests.
	eleventyConfig.addAsyncShortcode("inlineCSS", async function inlineCSS(relativePath) {
		if (!relativePath) {
			throw new Error("inlineCSS shortcode requires a file path argument");
		}
		const normalized = relativePath.startsWith("/")
			? relativePath.slice(1)
			: relativePath;
		const filePath = path.resolve(process.cwd(), normalized);
		if (!inlineCssCache.has(filePath)) {
			const cssContent = await readFile(filePath, "utf-8");
			inlineCssCache.set(filePath, cssContent);
		}
		return inlineCssCache.get(filePath);
	});
}
