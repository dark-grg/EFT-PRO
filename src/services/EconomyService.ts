import { userRepo, transactionRepo, notificationRepo } from '../repositories';
import { User } from '../types';

export class EconomyService {
  static async processTransaction(userId: string, type: 'earn' | 'spend', currency: 'coins' | 'tickets' | 'xp', amount: number, reason: string) {
    const user = await userRepo.getById(userId);
    if (!user) throw new Error('User not found');

    if (type === 'spend' && user[currency] < amount) {
      throw new Error(`Not enough ${currency}`);
    }

    // Update user balance
    const newBalance = type === 'earn' ? user[currency] + amount : user[currency] - amount;
    
    // Check for level up if it's XP
    let newLevel = user.level;
    if (currency === 'xp' && type === 'earn') {
      const neededXp = user.level * 1000;
      if (newBalance >= neededXp) {
        newLevel += 1;
        await notificationRepo.create({
          userId,
          title: 'ارتقاء مستوى!',
          message: `مبروك! لقد وصلت إلى المستوى ${newLevel}`,
          type: 'system',
          read: false,
          timestamp: new Date().toISOString()
        });
      }
    }

    const updatedUser = await userRepo.update(userId, {
      [currency]: newBalance,
      level: newLevel
    });

    // Log transaction
    await transactionRepo.create({
      userId,
      type,
      currency,
      amount,
      reason,
      timestamp: new Date().toISOString()
    });

    return updatedUser;
  }

  static async addCoins(userId: string, amount: number, reason: string) {
    return this.processTransaction(userId, 'earn', 'coins', amount, reason);
  }

  static async spendCoins(userId: string, amount: number, reason: string) {
    return this.processTransaction(userId, 'spend', 'coins', amount, reason);
  }

  static async addTickets(userId: string, amount: number, reason: string) {
    return this.processTransaction(userId, 'earn', 'tickets', amount, reason);
  }
}
