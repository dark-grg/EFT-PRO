import { ProgressionCategories } from './types';

export function normalizeProgressionCategories(sourceData: any): ProgressionCategories {
  return {
    shooting: Number(sourceData.shooting) || 0,
    passing: Number(sourceData.passing) || 0,
    dribbling: Number(sourceData.dribbling) || 0,
    dexterity: Number(sourceData.dexterity) || 0,
    // eFHUB might use "lowerBody", eFootball LABO might use "lowerBodyStrength"
    lowerBody: Number(sourceData.lowerBodyStrength ?? sourceData.lowerBody) || 0,
    aerial: Number(sourceData.aerialStrength ?? sourceData.aerial) || 0,
    defending: Number(sourceData.defending) || 0,
    gk1: Number(sourceData.gk1) || 0,
    gk2: Number(sourceData.gk2) || 0,
    gk3: Number(sourceData.gk3) || 0,
  };
}
