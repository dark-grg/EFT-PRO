export type User = {
  id: string;
  username: string;
  avatar: string;
  bio?: string;
  level: number;
  xp: number;
  rating: number;
  coins: number;
  tickets: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goals: number;
  championships?: number;
  isAdmin: boolean;
  isGuest?: boolean;
  createdAt: string;
};

export type Tournament = {
  id: string;
  name: string;
  image: string;
  description: string;
  participants: number;
  maxParticipants: number;
  entryFee: number;
  prize: string;
  startDate: string;
  status: 'upcoming' | 'active' | 'completed';
  type: 'League' | 'Knockout' | 'Group Stage';
};

export type TournamentPlayer = {
  id: string;
  tournamentId: string;
  userId: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  status: 'active' | 'eliminated' | 'champion';
};

export type Match = {
  id: string;
  tournamentId: string;
  player1Id: string;
  player2Id: string;
  player1Score: number | null;
  player2Score: number | null;
  time: string;
  round: string;
  status: 'scheduled' | 'live' | 'finished';
  nextMatchId?: string; // For Knockout Brackets
};

export type News = {
  id: string;
  title: string;
  image: string;
  date: string;
  category: string;
  content: string;
};

export type WheelReward = {
  id: string;
  type: 'coins' | 'tickets' | 'xp' | 'player' | 'training' | 'nothing';
  value: number;
  name: string;
  color: string;
  probability: number; // 0 to 1
  enabled: boolean;
};

export type WheelSpin = {
  id: string;
  userId: string;
  rewardId: string;
  timestamp: string;
};

export type Transaction = {
  id: string;
  userId: string;
  type: 'earn' | 'spend';
  currency: 'coins' | 'tickets' | 'xp';
  amount: number;
  reason: string;
  timestamp: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'tournament' | 'reward' | 'system';
  read: boolean;
  timestamp: string;
};

export type Tactic = {
  id: string;
  userId: string;
  name: string;
  formation: string;
  attackingStyle: string;
  defensiveStyle: string;
  pressure: string;
  defensiveLine: string;
  compactness: string;
  players: any[]; // Position mapped players
};

