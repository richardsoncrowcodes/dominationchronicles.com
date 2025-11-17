import fetch from 'node-fetch';
import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

const METADATA_PATH = path.join(process.cwd(), '_data', 'metadata.yaml');

export default async function() {
    let metadata = {};
    try {
        const metadataContent = await fs.readFile(METADATA_PATH, 'utf8');
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

    try {
        const parser = new Parser({
            customFields: {
                item: [
                    ['itunes:image', 'episodeImage', {keepArray: true}],
                ]
            }
        });

        const feedResponse = await fetch(REDCIRCLE_RSS_URL); 

        if (!feedResponse.ok) {
            throw new Error(`Gagal mengambil feed. HTTP Status: ${feedResponse.status}`);
        }

        const feedText = await feedResponse.text();
        const feed = await parser.parseString(feedText);

    // Build initial episode objects
    const episodes = feed.items.map(item => {
            let episodeImageUrl = 'placeholder.png';
            if (item.episodeImage && item.episodeImage.length > 0) {
                episodeImageUrl = item.episodeImage[0].href || item.episodeImage[0].url || 'placeholder.png';
            }
            if (episodeImageUrl === 'placeholder.png' && feed.image && feed.image.url) {
                episodeImageUrl = feed.image.url;
            }

            // Base slug from title (fallback to link if missing)
            const slugSource = item.title || item.link || '';
            const baseSlug = slugSource.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');

            return {
                title: item.title,
                originalUrl: item.link,
                image: episodeImageUrl,
                pubDate: item.pubDate,
                slug: baseSlug,
                guid: item.guid || item.id || item.link // keep potential unique identifiers
            };
        });

        // Ensure slug uniqueness by appending an incrementing occurrence counter for duplicates.
    // De-duplicate slugs by appending an occurrence counter (>1) to subsequent duplicates.
    // Example: "epstein-files" => first occurrence "epstein-files", second "epstein-files-2", etc.
    const slugSeen = {};
        for (const ep of episodes) {
            slugSeen[ep.slug] = (slugSeen[ep.slug] || 0) + 1;
            const occurrence = slugSeen[ep.slug];
            ep.uniqueSlug = occurrence === 1 ? ep.slug : `${ep.slug}-${occurrence}`;
            ep.url = `/episodes/${ep.uniqueSlug}/`;
        }

        console.log(`✅ SUCCESS: Load ${episodes.length} episode from RedCircle. as 'podcast'.`);
        return episodes;

    } catch (error) {
        console.error("❌ FATAL ERROR: Parsing/Fetch RSS RedCircle failed:", error.message);
        return [];
    }
}