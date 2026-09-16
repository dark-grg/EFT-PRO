/**
 * Authentic eFHUB (eFootball Hub) Calculation & Progression Engine
 * Source: https://efhub.com/tr
 * 
 * Re-implemented directly from eFHUB's official client-side progression algorithms,
 * rating calculation matrix, and auto-allocation solvers.
 */

import { PlayerCard, ProgressionAllocation, PlayerBaseStats } from '../types/playerCard';

export const POSITION_MAP: Record<string, number> = {
  GK: 0,
  CB: 1,
  LB: 2,
  RB: 3,
  DMF: 4,
  CMF: 5,
  LMF: 6,
  RMF: 7,
  AMF: 8,
  LWF: 9,
  RWF: 10,
  SS: 11,
  CF: 12
};

// Official weights matrix from eFHUB
export const EFHUB_WEIGHTS: number[] = [
  186,136,49,49,61,37,12,12,37,49,49,62,99,0,14,61,61,61,98,98,98,171,159,159,173,210,
  13,27,86,86,122,171,171,171,196,159,159,210,123,0,14,61,61,37,98,110,122,122,159,159,
  123,62,0,0,37,37,24,49,73,61,73,86,86,86,37,27,41,61,61,122,208,135,135,196,73,73,99,
  37,40,68,147,147,122,159,196,196,159,98,98,74,12,0,27,24,24,37,73,86,86,184,159,159,
  284,358,0,14,24,24,12,12,24,24,12,12,12,12,12,0,14,24,24,12,12,24,24,12,12,12,12,12,
  0,55,24,24,61,24,12,12,24,24,24,25,62,13,286,147,147,220,86,49,49,24,12,12,0,0,0,191,
  86,86,122,86,24,24,24,12,12,12,12,0,82,37,37,98,37,12,12,12,12,12,12,12,53,27,24,24,
  49,73,24,24,73,61,61,99,123,13,136,220,220,61,61,196,196,98,220,220,86,99,40,150,184,
  184,61,86,159,159,86,159,159,99,123,80,204,98,98,122,49,24,24,24,37,37,37,86,0,0,24,
  24,12,24,61,61,24,73,73,74,86,133,109,37,37,37,12,12,12,12,24,24,37,62,279,0,0,0,0,0,
  0,0,0,0,0,0,0,226,0,0,0,0,0,0,0,0,0,0,0,0,226,0,0,0,0,0,0,0,0,0,0,0,0,173,0,0,0,0,0,
  0,0,0,0,0,0,0,173,0,0,0,0,0,0,0,0,0,0,0,0,0,68,196,196,196,196,147,147,86,49,49,49,
  37,4,4,4,4,4,4,4,4,4,4,4,4,4,0,14,24,24,24,24,24,24,24,24,24,12,12
];

function r(e: number): number {
  return e > 25 ? e - 25 : 0;
}

export interface RatingCalculationParams {
  position: string;
  height?: number;
  weakFootAccuracy?: number;
  stats: Record<string, number> | PlayerBaseStats;
}

export function computeOverallRatingDecimal(params: RatingCalculationParams): number {
  const { position, height = 175, weakFootAccuracy = 2, stats } = params;
  const col = POSITION_MAP[position];
  if (col === undefined) return 70;

  const c = (idx: number) => EFHUB_WEIGHTS[idx + col] || 0;
  const s = (k: string) => (stats as any)[k] ?? 40;

  const sum =
    c(0) * r(height - 111) +
    c(13) * r(s('offensiveAwareness')) +
    c(26) * r(s('ballControl')) +
    c(39) * r(s('dribbling')) +
    c(52) * r(s('tightPossession')) +
    c(65) * r(s('lowPass')) +
    c(78) * r(s('loftedPass')) +
    c(91) * r(s('finishing')) +
    c(104) * r(s('setPieceTaking') || s('placeKicking')) +
    c(117) * r(s('curl')) +
    c(130) * r(s('heading')) +
    c(143) * r(s('defensiveAwareness')) +
    c(156) * r(s('ballWinning') || s('tackling')) +
    c(169) * r(s('aggression')) +
    c(182) * r(s('kickingPower')) +
    c(195) * r(s('speed')) +
    c(208) * r(s('acceleration')) +
    c(221) * r(s('physicalContact')) +
    c(234) * r(s('balance')) +
    c(247) * r(s('jump')) +
    c(260) * r(s('gkAwareness')) +
    c(273) * r(s('gkReach')) +
    c(286) * r(s('gkCatching')) +
    c(299) * r(s('gkClearing') || s('gkParrying')) +
    c(312) * r(s('gkReflexes')) +
    c(325) * r(s('stamina')) +
    c(338) * r(Math.floor((59 * weakFootAccuracy) / 3 + 40)) +
    c(351) * r(s('defensiveEngagement'));

  return Math.round(100 * Math.max((sum + 500) / 1000, 40)) / 100;
}

export function computeOverallRating(params: RatingCalculationParams): number {
  return Math.floor(computeOverallRatingDecimal(params));
}

export interface SliderCategory {
  key: keyof ProgressionAllocation;
  label: string;
  affectedStats: string[];
}

export const SLIDERS_DEF: SliderCategory[] = [
  { key: 'shooting', label: 'Shooting', affectedStats: ['finishing', 'setPieceTaking', 'placeKicking', 'curl'] },
  { key: 'passing', label: 'Passing', affectedStats: ['lowPass', 'loftedPass'] },
  { key: 'dribbling', label: 'Dribbling', affectedStats: ['ballControl', 'dribbling', 'tightPossession'] },
  { key: 'dexterity', label: 'Dexterity', affectedStats: ['offensiveAwareness', 'acceleration', 'balance'] },
  { key: 'lowerBody', label: 'Lower Body Str.', affectedStats: ['speed', 'kickingPower', 'stamina'] },
  { key: 'aerial', label: 'Aerial Strength', affectedStats: ['heading', 'jump', 'physicalContact'] },
  { key: 'defending', label: 'Defending', affectedStats: ['defensiveAwareness', 'ballWinning', 'tackling', 'aggression', 'defensiveEngagement'] },
  { key: 'gk1', label: 'GK 1', affectedStats: ['gkAwareness', 'jump'] },
  { key: 'gk2', label: 'GK 2', affectedStats: ['gkClearing', 'gkParrying', 'gkReach'] },
  { key: 'gk3', label: 'GK 3', affectedStats: ['gkCatching', 'gkReflexes'] }
];

export function stepCost(sliderValue: number): number {
  return Math.ceil(sliderValue / 4);
}

export function totalCostForSlider(sliderValue: number): number {
  let cost = 0;
  for (let i = 1; i <= sliderValue; i++) {
    cost += stepCost(i);
  }
  return cost;
}

export function applyProgression(
  baseStats: Record<string, number> | PlayerBaseStats,
  sliders: ProgressionAllocation
): Record<string, number> {
  const result: Record<string, number> = { ...(baseStats as any) };

  for (const slider of SLIDERS_DEF) {
    const val = sliders[slider.key] || 0;
    if (val > 0) {
      for (const statName of slider.affectedStats) {
        if (result[statName] !== undefined) {
          result[statName] = Math.min(99, result[statName] + val);
        }
      }
    }
  }

  return result;
}

/**
 * eFHUB's official greedy solver to allocate available progression points
 * to maximize card overall rating.
 */
