/**
 * Parser for TikTok's Unofficial API JSON Payloads
 */
const TikTokParser = {
    /**
     * Parses the RapidAPI/TikTok JSON payload to extract trending hashtags
     * @param {Object} data - The raw JSON `data` object containing `videos` array
     * @returns {Array} Processed trend objects
     */
    extractTrends(data) {
        if (!data || !data.videos || !Array.isArray(data.videos)) {
            console.warn("Invalid TikTok JSON payload format.");
            return [];
        }

        const tagCounts = {};
        
        data.videos.forEach(v => {
            const desc = v.title || v.desc || (v.content_desc ? v.content_desc.join(' ') : '');
            
            // Extract hashtags
            const tags = desc.match(/#\w+/g) || [];
            
            // Extract view counts
            const views = parseInt(v.play_count || (v.stats ? v.stats.playCount : 0));
            
            tags.forEach(tag => {
                const lowerTag = tag.toLowerCase();
                if (!tagCounts[lowerTag]) {
                    tagCounts[lowerTag] = { 
                        hashtag: tag, // Preserve original casing of first encounter
                        views: 0, 
                        count: 0 
                    };
                }
                tagCounts[lowerTag].views += isNaN(views) ? 0 : views;
                tagCounts[lowerTag].count++;
            });
        });

        // Convert the aggregate map to a sorted array
        return Object.values(tagCounts)
            .sort((a, b) => b.views - a.views)
            .map((t, i) => ({
                rank: i + 1,
                hashtag: t.hashtag,
                viewsRaw: t.views,
                mentions: t.count
            }));
    }
};
