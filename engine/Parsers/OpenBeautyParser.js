/**
 * Parser for Open Beauty Facts JSON Payloads
 */
const OpenBeautyParser = {
    /**
     * Extracts summarized ingredient property data from the Open Food/Beauty Facts JSON
     * @param {Object} data - The raw JSON response
     * @param {string} queryTerm - The ingredient that was searched
     * @returns {Object} Summarized findings
     */
    extractIngredientInfo(data, queryTerm) {
        if (!data || !data.products || !Array.isArray(data.products)) {
            console.warn("Invalid Open Beauty Facts JSON payload formt.");
            return null;
        }

        const ingredientsFound = new Set();
        let totalOccurrences = 0;
        const brandSet = new Set();

        data.products.forEach(p => {
            // Some products use `ingredients_text`, others use `ingredients` array
            if (p.ingredients_text) {
                totalOccurrences++;
                
                // Track brands using this ingredient
                if (p.brands) {
                    p.brands.split(',').forEach(b => brandSet.add(b.trim()));
                }

                // Parse out neighboring ingredients for context
                const list = p.ingredients_text.split(',');
                list.forEach(i => {
                    const clean = i.trim().toLowerCase()
                                   .replace(/[^a-z0-9\s-]/g, '')
                                   .replace(/\s+/g, ' ');
                    if (clean.includes(queryTerm.toLowerCase()) || clean.length > 3) {
                         ingredientsFound.add(clean);
                    }
                });
            }
        });

        return {
            searched: queryTerm,
            productsFoundIn: data.products.length,
            confirmedOccurrences: totalOccurrences,
            associatedIngredients: [...ingredientsFound].slice(0, 10), // Top 10 correlated
            topBrands: [...brandSet].slice(0, 5) // 5 sample brands using this
        };
    }
};
