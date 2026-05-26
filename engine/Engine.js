/**
 * Core Engine Layer
 * Coordinates the flow between parsers, the database, and the scorer.
 */
const Engine = {
    init() {
        console.log('✅ TrendLab Engine Initialized');
        // Initialize databases or pre-load rules if necessary
        if(typeof Database !== 'undefined') {
            console.log(`Loaded ${Database.ingredients.length} base ingredients from Dictionary.`);
        }
    },

    /**
     * Parses a raw ingredient list and returns a scored formulation.
     * @param {string} rawString - Comma-separated ingredients (e.g. "Water, Glycerin, Retinol")
     * @returns {Object} The analysis object including scored metrics
     */
    analyzeFormulation(rawString) {
        if (!rawString || typeof rawString !== 'string') {
            throw new Error("Invalid formulation strict provided.");
        }

        // 1. Parse the string into identified ingredients
        const parsedIngredients = IngredientParser.parseString(rawString);

        // 2. Pass to scorer
        const analysis = FormulationScorer.score(parsedIngredients);

        return analysis;
    },

    /**
     * Processes a raw TikTok JSON payload to extract trends
     * @param {Object} payload 
     * @returns {Array} List of standardized trend objects
     */
    processTikTokData(payload) {
        return TikTokParser.extractTrends(payload);
    },

    /**
     * Processes Open Beauty Facts JSON to extract ingredient properties
     * @param {Object} payload 
     * @param {string} query 
     * @returns {Object} Standardized ingredient object
     */
    processBeautyFactsData(payload, query) {
        return OpenBeautyParser.extractIngredientInfo(payload, query);
    }
};

// Auto-init for test harness
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => Engine.init());
}
