/**
 * URL Parser Utility
 * Parses social media URLs to extract source, creator info, and metadata
 */

const URL_PATTERNS = {
    instagram: {
        pattern: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(reel|p)\/([A-Za-z0-9_-]+)/i,
        profilePattern: /instagram\.com\/([^\/\?]+)/i,
        name: 'instagram',
        label: 'Instagram',
    },
    youtube: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]+)/i,
        name: 'youtube',
        label: 'YouTube',
    },
    tiktok: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/@([^\/]+)\/video\/(\d+)|(?:vm|vt)\.tiktok\.com\/([A-Za-z0-9]+))/i,
        name: 'tiktok',
        label: 'TikTok',
    },
    naver: {
        pattern: /(?:https?:\/\/)?(?:m\.)?(?:tv\.)?naver\.com\/(?:v|clip)\/(\d+)/i,
        name: 'naver',
        label: 'Naver',
    },
};

/**
 * Fetch Instagram post metadata using RapidAPI
 * Returns { title, description, authorName, thumbnail } or null if failed
 * 
 * Export for external use in RecipeDetailPage and other components
 */
// Helper to extract username from URL if present
export const extractInstagramUsername = (url) => {
    const match = url.match(/instagram\.com\/([^\/\?]+)/i);
    // Filter out 'reel', 'p', 'reels', etc. if they are captured as username
    if (match && match[1]) {
        const candidate = match[1];
        if (['reel', 'p', 'reels', 'explore', 'stories'].includes(candidate.toLowerCase())) {
            return '';
        }
        return candidate;
    }
    return '';
};

// Helper to extract Instagram media ID
export const extractInstagramId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(reel|p)\/([A-Za-z0-9_-]+)/i);
    return match ? match[2] : null;
};

// Helper to extract TikTok Video ID
export const extractTikTokVideoId = (url) => {
    if (!url) return null;
    // Standard URL: tiktok.com/@user/video/1234567890
    const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/i);
    if (match && match[1]) return match[1];

    // Short URL (might not have ID directly, but some do redirection params)
    // If it's a short URL like vt.tiktok.com/AbCdEf/, we can't extract ID without expansion.
    // But if the URL was already expanded to the canonical one (which we try to do), it works.
    return null;
};

export async function fetchInstagramMetadata(postId, apifyApiToken) {
    // 1. Apify API (If token provided)
    if (apifyApiToken) {
        console.log(`🔍 Instagram Scraper: Attempting to fetch metadata for post ID: ${postId} via Apify`);
        try {
            // Apify Instagram Scraper Actor (apify/instagram-scraper)
            // Using the synchronous run-sync-get-dataset-items endpoint for immediate results
            const apiUrl = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${apifyApiToken}`;

            // Construct direct URL from postId
            const directUrl = `https://www.instagram.com/p/${postId}/`;

            console.log(`📡 Apify API: Calling ${apiUrl}`);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "directUrls": [directUrl],
                    "resultsType": "details",
                    "searchType": "hashtag", // Default required field
                    "searchLimit": 1,
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // Apify returns an array of items
                if (data && data.length > 0) {
                    const item = data[0];
                    console.log('✅ Apify API Success:', item);

                    const caption = item.caption || '';
                    const ownerUsername = item.ownerUsername || '';
                    const displayUrl = item.displayUrl || item.thumbnailUrl;

                    return {
                        title: caption ? caption.split('\n')[0].substring(0, 100) : `Instagram Post by ${ownerUsername || 'Unknown'}`,
                        description: caption,
                        authorName: ownerUsername ? `@${ownerUsername}` : '',
                        thumbnail: displayUrl || `https://www.instagram.com/p/${postId}/media/?size=l`,
                        source: 'instagram'
                    };
                } else {
                    console.warn('⚠️ Apify API returned empty results');
                }
            } else {
                console.warn(`⚠️ Apify API failed (${response.status})`);
            }
        } catch (error) {
            console.error('❌ Apify API Request Failed:', error);
        }
    } else {
        console.log('Instagram: No Apify API token provided, skipping API fetch');
    }

    // 2. Fallback (Manual Construction)
    // If API fails or no token, just give the link
    return {
        title: `Instagram Post (${postId})`,
        description: '',
        authorName: '',
        thumbnail: `https://www.instagram.com/p/${postId}/media/?size=l`,
        source: 'instagram'
    };
}

/**
 * Fetch YouTube video metadata using oEmbed API
 * Returns { title, author_name } or null if failed
 */
const INVIDIOUS_INSTANCES = [
    'https://inv.tux.pizza',
    'https://invidious.jing.rocks',
    'https://vid.puffyan.us',
    'https://inv.bp.projectsegfau.lt',
    'https://invidious.nerdvpn.de'
];

/**
 * Helper to fetch from Invidious with failover
 */
async function fetchFromInvidious(videoId) {
    for (const base of INVIDIOUS_INSTANCES) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout per instance

            const response = await fetch(`${base}/api/v1/videos/${videoId}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            // Continue to next instance
        }
    }
    return null; // Return null instead of throwing to allow graceful fallback
}

/**
     * Fetch from YouTube Data API if user has provided API key
     */
async function fetchFromYouTubeAPI(videoId, apiKey) {
    if (!apiKey) return null;

    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) return null;

        const data = await response.json();
        if (!data.items || data.items.length === 0) return null;

        const snippet = data.items[0].snippet;
        return {
            title: snippet.title,
            authorName: snippet.channelTitle,
            description: snippet.description,
            thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };
    } catch (e) {
        console.error('YouTube Data API error:', e);
        return null;
    }
}

/**
 * Fallback to oEmbed (title and author only, no description)
 */
async function fetchFromOEmbed(videoId) {
    try {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;

        const response = await fetch(oEmbedUrl);
        if (!response.ok) return null;

        const data = await response.json();
        return {
            title: data.title || null,
            authorName: data.author_name || null,
            description: '',
            thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };
    } catch (e) {
        return null;
    }
}

/**
 * Fetch YouTube video metadata with multi-tier fallback
 * Priority: 1. Invidious (free, no setup) → 2. YouTube API (if key provided) → 3. oEmbed (basic)
 * Returns { title, authorName, description, thumbnail, source } or null
 * 
 * Export for external use in RecipeDetailPage and other components
 */
export async function fetchYouTubeMetadata(videoId, youtubeApiKey = null, apifyApiToken = null) {
    // 1. Apify API (Priority 1)
    if (apifyApiToken) {
        console.log(`🔍 YouTube Scraper: Attempting to fetch metadata for video ID: ${videoId} via Apify`);
        try {
            // User-provided YouTube Scraper Actor: YeXkAgbTOgDckE39s
            // User-provided Actor: h7sDV53CddomktSi5
            const actorId = 'h7sDV53CddomktSi5';
            const apiUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apifyApiToken}`;
            const directVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;

            console.log(`📡 Apify API: Calling ${apiUrl}`);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "startUrls": [{ "url": directVideoUrl }], // Using startUrls for direct video link
                    "maxResults": 1,
                    "subtitlesLanguage": "en",
                    "subtitlesFormat": "srt"
                }),
            });

            if (response.ok) {
                const data = await response.json();

                if (data && data.length > 0) {
                    const item = data[0];
                    console.log('✅ Apify YouTube Response:', item);

                    // Check if item contains error or missing necessary fields
                    if (item.error || !item.title) {
                        console.warn(`⚠️ Apify Actor returned error or incomplete data: ${JSON.stringify(item)}`);
                        // Do not return here, let it fall through to other methods below
                    } else {
                        return {
                            title: item.title,
                            description: item.description || item.text || item.shortDescription || item.metaDescription || item.videoDescription || item.desc || '',
                            authorName: item.channelName || item.author || item.channelTitle || item.uploader || '',
                            thumbnail: item.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                            source: 'apify_youtube'
                        };
                    }
                } else {
                    console.warn(`⚠️ Apify YouTube API returned empty results`);
                }
            } else {
                console.warn(`⚠️ Apify YouTube API failed (${response.status}) - Proceeding to fallback`);
            }
        } catch (error) {
            console.error('❌ Apify YouTube Request Failed:', error);
        }
    }

    // Try 2: Invidious (free, includes description)
    console.log('Trying Invidious...');
    const invidiousData = await fetchFromInvidious(videoId);
    if (invidiousData) {
        console.log('✓ Invidious success');
        return { ...invidiousData, source: 'invidious' };
    }

    // Try 3: YouTube Data API (if user provided key)
    if (youtubeApiKey) {
        console.log('Invidious failed, trying YouTube Data API...');
        const apiData = await fetchFromYouTubeAPI(videoId, youtubeApiKey);
        if (apiData) {
            console.log('✓ YouTube API success');
            return { ...apiData, source: 'youtube_api' };
        }
    }

    // Try 4: oEmbed (last resort, no description)
    console.log('Trying oEmbed fallback...');
    const oEmbedData = await fetchFromOEmbed(videoId);
    if (oEmbedData) {
        console.log('✓ oEmbed success (no description)');
        return { ...oEmbedData, source: 'oembed' };
    }

    console.log('✗ All methods failed');
    return null;
}

/**
 * Fetch TikTok metadata using Apify
 * Returns { title, description, authorName, thumbnail } or null if failed
 */
export async function fetchTikTokMetadata(url, apifyApiToken) {
    if (!apifyApiToken) {
        console.log('TikTok: No Apify API token provided, skipping API fetch');
        // Return minimal info parsed from URL
        const parsed = parseUrl(url);
        return {
            title: parsed?.suggestedTitle || 'TikTok Video',
            description: '',
            authorName: parsed?.creatorHandle || '',
            thumbnail: '', // TikTok doesn't have an easy public thumbnail URL without API
            source: 'tiktok'
        };
    }

    console.log(`🔍 TikTok Scraper: Attempting to fetch metadata for URL: ${url} via Apify`);
    try {
        // Apify TikTok Scraper Actor: S5h7zRLfKFEr8pdj7
        const actorId = 'S5h7zRLfKFEr8pdj7';
        const apiUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apifyApiToken}`;

        console.log(`📡 Apify API: Calling ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "postURLs": [url],
                "scrapeRelatedVideos": false,
                "resultsPerPage": 1,
                "shouldDownloadVideos": false,
                "shouldDownloadCovers": false,
                "shouldDownloadSubtitles": false,
                "shouldDownloadSlideshowImages": false
            }),
        });

        if (response.ok) {
            const data = await response.json();

            if (data && data.length > 0) {
                const item = data[0];
                console.log('✅ Apify TikTok Response:', item);

                // Extract relevant fields
                // Note: Actual field names depend on the specific actor's output.
                // Based on common Apify TikTok actors, usually 'text', 'authorMeta.name', 'videoMeta.coverUrl'
                const title = item.text || item.desc || 'TikTok Video';
                const author = item.authorMeta?.name || item.authorMeta?.nickName || item.author || '';
                const description = item.text || ''; // TikTok descriptions are usually the caption
                // Use the cover URL from the actor, or fallback to a default if missing
                const thumbnail = item.videoMeta?.coverUrl || item.imageUrl || item.video?.cover || '';

                // Extract canonical Video ID (numeric)
                // Short URLs (vt.tiktok.com) resolve to full URLs with new IDs.
                // We must use the canonical ID for embeds to work.
                const canonicalVideoId = item.id || (item.webVideoUrl ? item.webVideoUrl.split('/').pop() : null);

                // Get canonical URL to use for the embed 'cite' attribute
                const canonicalUrl = item.webVideoUrl || `https://www.tiktok.com/@${author}/video/${canonicalVideoId}`;

                return {
                    title: title.substring(0, 100),
                    description: description,
                    authorName: author ? `@${author}` : '',
                    thumbnail: thumbnail,
                    source: 'tiktok',
                    videoId: canonicalVideoId,
                    canonicalUrl: canonicalUrl, // Return the full web URL
                    // Store the full item if we want to use the video URL later (e.g. item.videoMeta.downloadAddr)
                    originalData: item
                };
            } else {
                console.warn(`⚠️ Apify TikTok API returned empty results`);
            }
        } else {
            console.warn(`⚠️ Apify TikTok API failed (${response.status})`);
        }
    } catch (error) {
        console.error('❌ Apify TikTok Request Failed:', error);
    }

    // Fallback if API fails
    const parsed = parseUrl(url);
    return {
        title: parsed?.suggestedTitle || 'TikTok Video',
        description: '',
        authorName: parsed?.creatorHandle || '',
        thumbnail: '',
        source: 'tiktok'
    };
}

/**
 * Parse a URL and extract source and video ID
 */
export function parseUrl(url) {
    if (!url) return null;

    const trimmedUrl = url.trim();

    for (const [sourceName, config] of Object.entries(URL_PATTERNS)) {
        const match = trimmedUrl.match(config.pattern);
        if (match) {
            let creatorHandle = '';
            let videoId = '';

            if (sourceName === 'instagram') {
                videoId = match[2];
                const profileMatch = trimmedUrl.match(config.profilePattern);
                if (profileMatch && profileMatch[1] !== 'reel' && profileMatch[1] !== 'p') {
                    creatorHandle = `@${profileMatch[1]}`;
                }
            } else if (sourceName === 'youtube') {
                videoId = match[1];
            } else if (sourceName === 'tiktok') {
                creatorHandle = match[1] ? `@${match[1]}` : '';
                videoId = match[2] || match[3] || '';
            } else if (sourceName === 'naver') {
                videoId = match[1];
            }

            // Generate suggested title based on source and date
            // YouTube and Instagram can fetch real titles
            const today = new Date();
            const dateStr = `${today.getMonth() + 1}/${today.getDate()}`;
            const suggestedTitle = `${config.label} 레시피 (${dateStr})`;

            // isTempTitle: true for platforms that can't fetch real titles
            // YouTube and Instagram can fetch metadata if API keys are provided
            const isTempTitle = sourceName !== 'youtube' && sourceName !== 'instagram';

            return {
                url: trimmedUrl,
                source: config.name,
                sourceLabel: config.label,
                videoId,
                creatorHandle,
                suggestedTitle,
                isTempTitle,
                thumbnail: getThumbnailUrl(config.name, videoId),
            };
        }
    }

    return null;
}

/**
 * Get thumbnail URL for supported platforms
 */
function getThumbnailUrl(source, videoId) {
    if (!videoId) return null;

    switch (source) {
        case 'youtube':
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        default:
            // Instagram and TikTok don't provide easy thumbnail access
            // User will need to add their own image
            return null;
    }
}

/**
 * Get source info by name
 */
export function getSourceInfo(sourceName) {
    const config = URL_PATTERNS[sourceName];
    if (!config) return null;

    return {
        name: config.name,
        label: config.label,
    };
}

/**
 * Get all supported sources
 */
export function getSupportedSources() {
    return Object.values(URL_PATTERNS).map((config) => ({
        name: config.name,
        label: config.label,
    }));
}

/**
 * Validate if a URL is from a supported source
 */
export function isValidUrl(url) {
    return parseUrl(url) !== null;
}
