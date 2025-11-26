import {
	IdAttributePlugin,
	InputPathToUrlTransformPlugin,
	HtmlBasePlugin,
} from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import yaml from "js-yaml";
import { execSync } from "child_process";
import markdownIt from "markdown-it";
import pluginFilters from "./_config/filters.js";
import { DateTime } from "luxon";
import embedYouTube from "eleventy-plugin-youtube-embed";
import eleventyPluginYoutubeEmbed from 'eleventy-plugin-youtube-embed';
import { minify } from 'html-minifier-terser';
/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	// Removed manual authors.json loading. Eleventy will auto-load _data/authors.yaml and _data/authors.json as global data.
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
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
		// Copy xmit.json to output root for Xmit hosting
		.addPassthroughCopy({ "./xmit.json": "/xmit.json" })
		.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl")
		.addPassthroughCopy("./public/img/favicons")
		.addPassthroughCopy("./public/pdfs")
		.addPassthroughCopy("./public/citations");
eleventyConfig.setNunjucksEnvironmentOptions({
        trimBlocks: true,
        lstripBlocks: true,
        autoescape: false 
    });
	eleventyConfig.addWatchTarget("css/**/*.css");
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

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
	eleventyConfig.addFilter("timeToSeconds", function(time) {
        if (!time || typeof time !== 'string') return 0;
        const parts = time.split(':').reverse();
        let totalSeconds = (parseInt(parts[0]) || 0);
        if (parts.length > 1) {
            totalSeconds += (parseInt(parts[1]) || 0) * 60;
        }
        if (parts.length > 2) {
            totalSeconds += (parseInt(parts[2]) || 0) * 3600;
        }
        return totalSeconds;
    });
    eleventyConfig.addFilter("truncate", function(text, length) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    });
	eleventyConfig.on("eleventy.after", () => {
		execSync(`npx pagefind --site _site --glob \"**/*.html\"`, {
			encoding: "utf-8",
		});
	});
    eleventyConfig.addPlugin(feedPlugin, {
		type: "atom",
		outputPath: "/feed/feed.xml",
		stylesheet: "pretty-atom-feed.xsl",
		templateData: {
			eleventyNavigation: {
				key: "Feed",
				order: 10,
			},
		},
		collection: {
			// Only include podcast episodes tagged with "episodes"
			name: "episodes",
			limit: 50,
		},
		metadata: {
			language: "en",
			title: "Domination Chronicles Podcast",
			subtitle: "Because domination isn’t a metaphor—it’s a system.",
			base: "https://dominationchronicles.com/",
			author: {
				name: "Domination Chronicles",
			},
		},
	});

	eleventyConfig.addPlugin(pluginFilters);

	eleventyConfig.addPlugin(IdAttributePlugin, {});

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return new Date().toISOString();
	});

	// HTML minification transform
	eleventyConfig.addTransform("htmlmin", async function (content, outputPath) {
		if (outputPath && outputPath.endsWith(".html") && process.env.ELEVENTY_RUN_MODE === "build") {
			return await minify(content, {
				useShortDoctype: true,
				removeComments: true,
				collapseWhitespace: true,
				minifyCSS: true,
				minifyJS: true,
			});
		}
		return content;
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
