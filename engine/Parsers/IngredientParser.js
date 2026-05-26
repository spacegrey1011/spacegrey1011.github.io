/**
 * Ingredient Parser Module
 * Handles raw ingredient strings (like from a label or the web)
 * and normalizes them into an array of recognized ingredients.
 */
const IngredientParser = {
    /**
     * @param {string} rawString 
     * @returns {Array} List of normalized ingredient objects from Database
     */
    parseString(rawString) {
        if (!rawString) return [];

        // Split by common delimiters (comma, bullet points, strict commas)
        const parts = rawString.split(/,|•|\n/);

        const parsed = [];
        parts.forEach(part => {
            const clean = part.trim().toLowerCase();
            if (clean) {
                // Remove trailing dots, parentheticals like (vitamin c), asterisks
                const normalized = clean.replace(/\u00A0/g, ' ')
                                        .replace(/\.$/, '')
                                        .replace(/\*+/g, '')
                                        .replace(/\([^)]*\)/g, '')
                                        .trim();
                
                // Check if we know it in our DB
                const dbMatch = typeof Database !== 'undefined' ? Database.lookup(normalized) : null;
                
                if (dbMatch) {
                    parsed.push({
                        id: dbMatch.id,
                        name: dbMatch.names[0],
                        safety: dbMatch.safety,
                        trend: dbMatch.trend,
                        function: dbMatch.function,
                        recognized: true
                    });
                } else {
                    parsed.push({
                        name: normalized,
                        recognized: false
                    });
                }
            }
        });

        return parsed;
    }
};
