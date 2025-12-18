import {
	IdAttributePlugin,
	InputPathToUrlTransformPlugin,
	HtmlBasePlugin,
} from "@11ty/eleventy";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import fontAwesomePlugin from "@11ty/font-awesome";
import yaml from "js-yaml";
import { execSync } from "child_process";
import markdownIt from "markdown-it";
import pluginFilters from "./_config/filters.js";
import {
	registerHtmlMinifier,
	registerInlineCssShortcode,
} from "./_config/minify.js";
import { DateTime } from "luxon";
import embedYouTube from "eleventy-plugin-youtube-embed";
import eleventyPluginYoutubeEmbed from "eleventy-plugin-youtube-embed";
/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	const isProduction = process.env.ELEVENTY_ENV === "production";
	const isBuild = process.env.ELEVENTY_RUN_MODE === "build";
	// Removed manual authors.json loading. Eleventy will auto-load _data/authors.yaml and _data/authors.json as global data.
	eleventyConfig.addPreprocessor("drafts", "*", (data) => {
		const isDraft = data?.draft === true;
		const isExplicitlyUnpublished = data?.published === false;
		if (isExplicitlyUnpublished) {
			return false;
		}
		if (isDraft && isBuild) {
			return false;
		}
	});
	eleventyConfig.addPlugin(embedYouTube, {
		lite: true,
	});
	eleventyConfig.addPlugin(eleventyPluginYoutubeEmbed);
	eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));
	eleventyConfig
		.addPassthroughCopy({
			"./public/": "/",
			"./public/img/favicon/favicon.ico": "/favicon.ico"
		})
		// Copy xmit.json (JSON) to output root for Xmit hosting
		.addPassthroughCopy({ "./xmit.json": "/xmit.json" })
		.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl")
		.addPassthroughCopy("./public/img/favicons")
		.addPassthroughCopy("./public/pdfs")
		.addPassthroughCopy("./public/citations");
	eleventyConfig.setNunjucksEnvironmentOptions({
		trimBlocks: true,
		lstripBlocks: true,
		autoescape: false,
	});
	eleventyConfig.addWatchTarget("css/**/*.css");
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");
	eleventyConfig.addWatchTarget("./content/");
	eleventyConfig.setBrowserSyncConfig({
		files: ["./public/**/*", "./css/**/*.css"],
	});

	eleventyConfig.addBundle("css", {
		toFileDirectory: "dist",
		bundleHtmlContentFromSelector: "style",
	});
	eleventyConfig.addBundle("js", {
		toFileDirectory: "dist",
		bundleHtmlContentFromSelector: 'script[type="module"]',
	});

	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 },
	});
	// FontAwesome plugin
	eleventyConfig.addPlugin(fontAwesomePlugin, {
		transform: "i[class]",
		shortcode: false,
		failOnError: true,
		defaultAttributes: {
			class: "icon-svg",
		},
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
	const md = new markdownIt({
		html: true,
		breaks: true,
		linkify: true,
	});
	eleventyConfig.addFilter("md", function (content) {
		return md.render(content);
	});
	eleventyConfig.addFilter("timeToSeconds", function (time) {
		if (!time || typeof time !== "string") return 0;
		const parts = time.split(":").reverse();
		let totalSeconds = parseInt(parts[0]) || 0;
		if (parts.length > 1) {
			totalSeconds += (parseInt(parts[1]) || 0) * 60;
		}
		if (parts.length > 2) {
			totalSeconds += (parseInt(parts[2]) || 0) * 3600;
		}
		return totalSeconds;
	});
	eleventyConfig.addFilter("truncate", function (text, length) {
		if (!text) return "";
		if (text.length <= length) return text;
		return text.substring(0, length) + "...";
	});
	eleventyConfig.addFilter("take", function(items, count) {
		if (!Array.isArray(items)) {
			return [];
		}
		if (!count || count <= 0) {
			return items;
		}
		return items.slice(0, count);
	});
	eleventyConfig.addFilter("toFeedDate", function (value) {
		const fallback = new Date();
		if (!value) {
			return fallback.toISOString();
		}
		const date = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(date.valueOf())) {
			return fallback.toISOString();
		}
		return date.toISOString();
	});
	eleventyConfig.on("eleventy.after", () => {
		if (isBuild) {
			execSync(`npx pagefind --site _site --glob "**/*.html"`, {
				encoding: "utf-8",
			});
		} else {
			console.log("Skipping Pagefind indexing outside of build mode.");
		}
	});
	eleventyConfig.addPlugin(pluginFilters);
	registerInlineCssShortcode(eleventyConfig);
	registerHtmlMinifier(eleventyConfig, isBuild);

	eleventyConfig.addPlugin(IdAttributePlugin, {});

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return new Date().toISOString();
	});

}

export const config = {
	templateFormats: ["md", "njk", "html", "liquid", "11ty.js"],

	markdownTemplateEngine: "njk",

	htmlTemplateEngine: "njk",

	dir: {
		input: "content", // default: "."
		includes: "../_includes", // default: "_includes" (`input` relative)
		data: "../_data", // default: "_data" (`input` relative)
		output: "_site",
	},
};
