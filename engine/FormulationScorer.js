/**
 * Formulation Scorer Module
 * Takes an array of parsed ingredients and calculates overall metrics,
 * accounting for synergistic and antagonistic rules defined in the Database.
 */
const FormulationScorer = {
    /**
     * @param {Array} parsedIngredients - Array output from IngredientParser
     * @returns {Object} Comprehensive analysis of the formulation
     */
    score(parsedIngredients) {
        if (!parsedIngredients || parsedIngredients.length === 0) {
            return {
                safetyScore: 0,
                trendScore: 0,
                warnings: [],
                insights: [],
                recognizedCount: 0,
                totalCount: 0
            };
        }

        const recognized = parsedIngredients.filter(i => i.recognized);
        const unrecog = parsedIngredients.filter(i => !i.recognized);
        
        // Base Averages (weighted equally for this engine version)
        let totalSafety = 0;
        let totalTrend = 0;

        recognized.forEach(ing => {
            totalSafety += ing.safety;
            totalTrend += ing.trend;
        });

        let baseSafety = recognized.length ? Math.round(totalSafety / recognized.length) : 0;
        let baseTrend = recognized.length ? Math.round(totalTrend / recognized.length) : 0;

        // Apply Rules
        const warnings = [];
        const insights = [];
        
        if (typeof Database !== 'undefined' && Database.rules) {
            const ingIds = recognized.map(i => i.id);

            // Check Antagonists
            Database.rules.antagonists.forEach(rule => {
                const hasAll = rule.ingredients.every(id => ingIds.includes(id));
                if (hasAll) {
                    baseSafety += rule.penalty;
                    warnings.push(rule.warning);
                }
            });

            // Check Synergists
            Database.rules.synergists.forEach(rule => {
                const hasAll = rule.ingredients.every(id => ingIds.includes(id));
                if (hasAll) {
                    baseSafety += rule.bonus; // Synergies usually improve safety/efficacy
                    baseTrend += Math.floor(rule.bonus / 2); // Synergies are trending
                    insights.push(rule.insight);
                }
            });
        }

        // Penalty for too many unrecognized ingredients (unknown safety profile)
        if (unrecog.length > 0) {
            const penalty = unrecog.length * 2;
            baseSafety = Math.max(0, baseSafety - penalty);
            warnings.push(`${unrecog.length} unrecognized ingredient(s) dragged down the safety score confidence.`);
        }

        return {
            safetyScore: Math.min(100, Math.max(0, baseSafety)),
            trendScore: Math.min(100, Math.max(0, baseTrend)),
            recognizedCount: recognized.length,
            unrecognizedCount: unrecog.length,
            totalCount: parsedIngredients.length,
            warnings,
            insights,
            ingredients: parsedIngredients
        };
    }
};
