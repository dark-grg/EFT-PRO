import { LocalRepository } from './LocalRepository';
import { User, Tournament, Match, News, WheelReward, WheelSpin, Transaction, Notification, Tactic, TournamentPlayer } from '../types';

// Exporting instances of Local Repositories.
export const userRepo = new LocalRepository<User>('users');
export const tournamentRepo = new LocalRepository<Tournament>('tournaments');
export const tournamentPlayerRepo = new LocalRepository<TournamentPlayer>('tournament_players');
export const matchRepo = new LocalRepository<Match>('matches');
export const newsRepo = new LocalRepository<News>('news');
export const rewardRepo = new LocalRepository<WheelReward>('wheel_rewards');
export const spinRepo = new LocalRepository<WheelSpin>('wheel_spins');
export const transactionRepo = new LocalRepository<Transaction>('transactions');
export const notificationRepo = new LocalRepository<Notification>('notifications');
export const tacticRepo = new LocalRepository<Tactic>('tactics');

