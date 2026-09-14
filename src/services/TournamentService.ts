import { tournamentRepo, tournamentPlayerRepo, matchRepo } from '../repositories';
import { Tournament, TournamentPlayer, Match } from '../types';

export class TournamentService {
  
  static async joinTournament(tournamentId: string, userId: string) {
    const tournament = await tournamentRepo.getById(tournamentId);
    if (!tournament) throw new Error('Tournament not found');
    
    if (tournament.status !== 'upcoming') throw new Error('Registration closed');
    
    const players = await tournamentPlayerRepo.query(p => p.tournamentId === tournamentId);
    if (players.length >= tournament.maxParticipants) throw new Error('Tournament is full');

    const existing = players.find(p => p.userId === userId);
    if (existing) throw new Error('Already registered');

    // Register
    await tournamentPlayerRepo.create({
      tournamentId,
      userId,
      points: 0,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      status: 'active'
    });

    // Update participants count
    await tournamentRepo.update(tournamentId, { participants: players.length + 1 });
  }

  static async generateMatches(tournamentId: string) {
    const tournament = await tournamentRepo.getById(tournamentId);
    if (!tournament) throw new Error('Tournament not found');

    const players = await tournamentPlayerRepo.query(p => p.tournamentId === tournamentId);
    
    if (tournament.type === 'League') {
      await this.generateLeagueMatches(tournamentId, players);
    } else if (tournament.type === 'Knockout') {
      await this.generateKnockoutMatches(tournamentId, players);
    }
    
    await tournamentRepo.update(tournamentId, { status: 'active' });
  }

  private static async generateLeagueMatches(tournamentId: string, players: TournamentPlayer[]) {
    // Simple Round Robin (single leg)
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        await matchRepo.create({
          tournamentId,
          player1Id: players[i].userId,
          player2Id: players[j].userId,
          player1Score: null,
          player2Score: null,
          time: 'TBD',
          round: `الجولة ${i + 1}`,
          status: 'scheduled'
        });
      }
    }
  }

  private static async generateKnockoutMatches(tournamentId: string, players: TournamentPlayer[]) {
    // Simplified Knockout logic assuming power of 2 participants for prototyping
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    for (let i = 0; i < shuffled.length; i += 2) {
      if (shuffled[i + 1]) {
        await matchRepo.create({
          tournamentId,
          player1Id: shuffled[i].userId,
          player2Id: shuffled[i + 1].userId,
          player1Score: null,
          player2Score: null,
          time: 'TBD',
          round: 'ربع النهائي', // hardcoded demo round
          status: 'scheduled'
        });
      }
    }
  }
}
