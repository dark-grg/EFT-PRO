import { rewardRepo, spinRepo } from '../repositories';
import { EconomyService } from './EconomyService';
import { wheelApi, WheelStatusResponse } from '../api/wheelApi';

export class WheelService {
  static readonly SPIN_COST = 0; // Daily free spin
  static readonly COOLDOWN_HOURS = 24;
  static readonly COOLDOWN_MS = 24 * 60 * 60 * 1000;

  static async fetchServerStatus(): Promise<WheelStatusResponse> {
    return await wheelApi.getStatus();
  }

  static getCooldownStatus(): {
    canSpin: boolean;
    remainingMs: number;
    nextSpinDate: Date | null;
    formattedCountdown: string;
    hours: number;
    minutes: number;
    seconds: number;
  } {
    const status = wheelApi.getLocalFallbackStatus();

    if (status.canSpin || status.remainingMs <= 0) {
      return {
        canSpin: true,
        remainingMs: 0,
        nextSpinDate: null,
        formattedCountdown: '00:00:00',
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }

    const hours = Math.floor(status.remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((status.remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((status.remainingMs % (1000 * 60)) / 1000);

    const formattedCountdown = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return {
      canSpin: false,
      remainingMs: status.remainingMs,
      nextSpinDate: status.nextSpinAt ? new Date(status.nextSpinAt) : null,
      formattedCountdown,
      hours,
      minutes,
      seconds
    };
  }

  static async canSpin(_userId?: string): Promise<{ canSpin: boolean; waitTimeHours?: number; remainingMs?: number }> {
    try {
      const serverStatus = await wheelApi.getStatus();
      if (!serverStatus.canSpin) {
        return {
          canSpin: false,
          waitTimeHours: Math.ceil(serverStatus.remainingMs / (1000 * 60 * 60)),
          remainingMs: serverStatus.remainingMs
        };
      }
      return { canSpin: true };
    } catch {
      const status = this.getCooldownStatus();
      return {
        canSpin: status.canSpin,
        waitTimeHours: Math.ceil(status.remainingMs / (1000 * 60 * 60)),
        remainingMs: status.remainingMs
      };
    }
  }

  static async executeSpin(userId: string = 'guest') {
    // 1. Authoritative API Spin
    const spinRes = await wheelApi.spin();

    // 2. Log Spin in local repository if available
    try {
      await spinRepo.create({
        userId,
        rewardId: spinRes.prizeId,
        timestamp: new Date().toISOString()
      });

      if (spinRes.prizeId === 'coins_150') {
        await EconomyService.addCoins(userId, 150, 'Wheel Reward');
      }
    } catch {
      // Non-blocking
    }

    return spinRes;
  }
}

