import { PlayerBuild } from '../../types/player';

// Production: No mock data or seed data allowed
export const allPlayerBuilds: PlayerBuild[] = [];

export const getPlayersByCategory = (category: 'ALL' | 'FW' | 'MF' | 'DF' | 'GK') => {
  if (category === 'ALL') return allPlayerBuilds;
  return allPlayerBuilds.filter(p => p.category === category);
};

export const searchPlayers = (query: string, category: 'ALL' | 'FW' | 'MF' | 'DF' | 'GK' = 'ALL') => {
  const normalizedQuery = query.toLowerCase().trim();
  let list = getPlayersByCategory(category);
  if (!normalizedQuery) return list;
  return list.filter(p => 
    p.name.toLowerCase().includes(normalizedQuery) ||
    p.arabicName.toLowerCase().includes(normalizedQuery) ||
    p.club.toLowerCase().includes(normalizedQuery) ||
    p.nationality.toLowerCase().includes(normalizedQuery) ||
    p.position.toLowerCase().includes(normalizedQuery)
  );
};
