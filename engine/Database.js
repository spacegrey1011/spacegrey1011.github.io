/**
 * Mockable Database Module
 * Holds base ingredient profiles and synergy/antagonist rules.
 */
const Database = {
    ingredients: [
        { id: 'water', names: ['water', 'aqua', 'eau'], safety: 100, trend: 50, function: 'Solvent' },
        { id: 'glycerin', names: ['glycerin', 'glycerol'], safety: 98, trend: 70, function: 'Humectant' },
        { id: 'niacinamide', names: ['niacinamide', 'vitamin b3'], safety: 95, trend: 92, function: 'Brightening' },
        { id: 'retinol', names: ['retinol', 'vitamin a'], safety: 65, trend: 85, function: 'Anti-aging' },
        { id: 'ascorbic_acid', names: ['ascorbic acid', 'vitamin c'], safety: 80, trend: 86, function: 'Antioxidant' },
        { id: 'snail_mucin', names: ['snail mucin', 'snail secretion filtrate'], safety: 90, trend: 96, function: 'Repair' },
        { id: 'salicylic_acid', names: ['salicylic acid', 'bha'], safety: 75, trend: 72, function: 'Exfoliant' }
    ],

    rules: {
        // Antagonists (negative interactions)
        antagonists: [
            {
                ingredients: ['retinol', 'ascorbic_acid'],
                penalty: -15,
                warning: 'High risk of irritation when Vitamin C and Retinol are combined.'
            },
            {
                ingredients: ['retinol', 'salicylic_acid'],
                penalty: -20,
                warning: 'Extreme drying and barrier damage risk combining BHA and Retinol.'
            }
        ],
        // Synergists (positive interactions)
        synergists: [
            {
                ingredients: ['niacinamide', 'retinol'],
                bonus: 10,
                insight: 'Niacinamide helps tolerate Retinol by supporting the skin barrier.'
            },
            {
                ingredients: ['glycerin', 'water'],
                bonus: 5,
                insight: 'Glycerin draws water into the skin for prolonged hydration.'
            }
        ]
    },

    lookup(name) {
        const normalized = name.toLowerCase().trim();
        return this.ingredients.find(ing => ing.names.includes(normalized));
    }
};
