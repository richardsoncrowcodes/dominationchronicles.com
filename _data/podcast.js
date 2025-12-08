import EleventyFetch from "@11ty/eleventy-fetch";
import Parser from "rss-parser";
import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import getLocalEpisodes from "./localEpisodes.js";

const METADATA_PATH = path.join(process.cwd(), "_data", "metadata.yaml");

// Tentukan Show Slug secara eksplisit karena URL RSS menggunakan GUID
// Show Slug ini berasal dari https://redcircle.com/shows/dominationchronicles
const REDCIRCLE_SHOW_SLUG = "dominationchronicles";


export default async function () {
	let metadata = {};
	try {
		const metadataContent = await fs.readFile(METADATA_PATH, "utf8");
		metadata = yaml.load(metadataContent);
	} catch (error) {
		console.error("❌ ERROR: can't read metadata.yaml.");
		return [];
	}

	const REDCIRCLE_RSS_URL = metadata.podcast_rss?.url;	
	
	if (!REDCIRCLE_RSS_URL) {
		console.error("❌ ERROR: URL RSS not found on metadata.yaml.");
		return [];
	}

    // Gunakan Slug yang telah didefinisikan secara eksplisit
    const redcircleShowSlug = REDCIRCLE_SHOW_SLUG;
    
	try {
		const cacheDuration = process.env.ELEVENTY_ENV === "production" ? "12h" : "1h";
		const parser = new Parser({
			customFields: {
				item: [
					["itunes:image", "episodeImage", { keepArray: true }],
					["itunes:permalink", "permalinkUrl"], 
					["itunes:episodeUrl", "episodePageUrl"], 
					["content:encoded", "episodeContent"]
				]
			}
		});

		const feedText = await EleventyFetch(REDCIRCLE_RSS_URL, {
			duration: cacheDuration,
			type: "text",
			encoding: "utf-8",
		});
		const feed = await parser.parseString(feedText);

	// Build initial episode objects
	const episodes = feed.items.map(item => {
			let episodeImageUrl = '/img/placeholder.webp';
			if (item.episodeImage && item.episodeImage.length > 0) {
				episodeImageUrl = item.episodeImage[0].href || item.episodeImage[0].url || '/img/placeholder.webp';
			}
			if (episodeImageUrl === '/img/placeholder.webp' && feed.image && feed.image.url) {
				episodeImageUrl = feed.image.url;
			}

			// Base slug from title (fallback to link if missing)
			const slugSource = item.title || item.link || '';
			const baseSlug = slugSource.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');

            let externalLink = null;
            
            // Logika prioritas untuk mencari link terbaik
            if (item.episodePageUrl) { externalLink = item.episodePageUrl; } 
            else if (item.permalinkUrl) { externalLink = item.permalinkUrl; } 
            else if (item.enclosure && item.enclosure.url) { externalLink = item.enclosure.url; } 
            else if (item.guid && (item.guid.startsWith('http') || item.guid.startsWith('https'))) { externalLink = item.guid; } 
            else if (item.content || item.episodeContent) {
                const contentToCheck = item.episodeContent || item.content;
                const urlMatch = contentToCheck.match(/https?:\/\/[^\s"]+/); 
                if (urlMatch && urlMatch[0]) { externalLink = urlMatch[0]; }
            }
            if (!externalLink) { externalLink = item.link; }

			return {
				title: item.title,
				originalUrl: item.link,
				image: episodeImageUrl,
				publishDate: item.publishDate,
				slug: baseSlug,
				guid: item.guid || item.id || item.link, 
				// Menghapus 'finalLink' di sini untuk menghindari kebingungan
			};
		});

		// Ensure slug uniqueness and construct RedCircle Page URL
	    const slugSeen = {};
		for (const ep of episodes) {
			slugSeen[ep.slug] = (slugSeen[ep.slug] || 0) + 1;
			const occurrence = slugSeen[ep.slug];
			ep.uniqueSlug = occurrence === 1 ? ep.slug : `${ep.slug}-${occurrence}`;
			ep.url = `/episodes/${ep.uniqueSlug}/`; 
			
            // KONSTRUKSI URL HALAMAN REDCIRCLE MENGGUNAKAN SLUG YANG KITA DEFENISIKAN
            if (redcircleShowSlug) {
                // Set properti baru: 'redcircleLink'
                const constructedUrl = `https://redcircle.com/shows/${redcircleShowSlug}/episodes/${ep.uniqueSlug}`;
                ep.redcircleLink = constructedUrl; // <-- Properti Baru
            }
		}

		let localSlugs = new Set();
		try {
			const localList = await getLocalEpisodes();
			if (Array.isArray(localList)) {
				localSlugs = new Set(localList);
			}
		} catch (localError) {
			console.warn("[podcast] Unable to load local episode slugs:", localError.message);
		}

		const filteredEpisodes = episodes.filter((episode) => !localSlugs.has(episode.uniqueSlug));
		const skipped = episodes.length - filteredEpisodes.length;
		console.log(`✅ SUCCESS: Load ${filteredEpisodes.length} remote episode(s) from RedCircle as 'podcast'.${skipped ? ` Skipped ${skipped} local episode(s).` : ""}`);
		return filteredEpisodes;

	} catch (error) {
		console.error("❌ FATAL ERROR: Parsing/Fetch RSS RedCircle failed:", error.message);
		return [];
	}
}