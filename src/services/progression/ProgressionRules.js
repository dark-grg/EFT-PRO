export const PROGRESSION_COST_RULES = [
    { maxLevel: 4, costPerLevel: 1 },
    { maxLevel: 8, costPerLevel: 2 },
    { maxLevel: 12, costPerLevel: 3 },
    { maxLevel: 16, costPerLevel: 4 },
    { maxLevel: 99, costPerLevel: 5 } // Fallback for 17+
];
export function calculateCategoryCost(levels) {
    if (levels <= 0)
        return 0;
    let totalCost = 0;
    let remainingLevels = levels;
    let currentLevel = 0;
    for (const rule of PROGRESSION_COST_RULES) {
        const levelsInThisTier = rule.maxLevel - currentLevel;
        if (remainingLevels <= levelsInThisTier) {
            totalCost += remainingLevels * rule.costPerLevel;
            break;
        }
        else {
            totalCost += levelsInThisTier * rule.costPerLevel;
            remainingLevels -= levelsInThisTier;
            currentLevel = rule.maxLevel;
        }
    }
    return totalCost;
}
export const CATEGORY_MAPPINGS = {
    shooting: ['finishing', 'placeKicking', 'curl'],
    passing: ['lowPass', 'loftedPass'],
    dribbling: ['ballControl', 'dribbling', 'tightPossession'],
    dexterity: ['offensiveAwareness', 'acceleration', 'balance'],
    lowerBody: ['speed', 'kickingPower', 'stamina'],
    aerial: ['heading', 'jump', 'physicalContact'], // 'jump' is used in the app, sometimes 'jumping'
    defending: ['defensiveAwareness', 'tackling', 'aggression', 'defensiveEngagement'],
    gk1: ['gkAwareness', 'jump'],
    gk2: ['gkParrying', 'gkClearing', 'gkReach'],
    gk3: ['gkCatching', 'gkReflexes']
};
