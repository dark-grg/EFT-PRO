import { userRepo } from '../repositories';
import { User } from '../types';

export class AuthService {
  static async login(username: string): Promise<User> {
    const users = await userRepo.query(u => u.username.toLowerCase() === username.toLowerCase());
    if (users.length === 0) {
      throw new Error('المستخدم غير موجود، يرجى التسجيل أولاً');
    }
    const user = users[0];
    localStorage.setItem('auth_session', user.id);
    return user;
  }

  static async register(username: string, isGuest = false): Promise<User> {
    const existing = await userRepo.query(u => u.username.toLowerCase() === username.toLowerCase());
    if (existing.length > 0) {
      throw new Error('اسم المستخدم مسجل مسبقاً، يرجى اختيار اسم آخر');
    }

    const newUser = await userRepo.create({
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
      level: 1,
      xp: 0,
      rating: 1000,
      coins: 500,
      tickets: 5,
      wins: 0,
      draws: 0,
      losses: 0,
      winRate: 0,
      goals: 0,
      championships: 0,
      isAdmin: username === 'admin', // Simple admin setup for local
      isGuest,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem('auth_session', newUser.id);
    return newUser;
  }

  static async guestLogin(): Promise<User> {
    const guestName = `Guest_${Math.floor(Math.random() * 10000)}`;
    return this.register(guestName, true);
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('auth_session');
  }

  static async getCurrentUser(): Promise<User | null> {
    let id = localStorage.getItem('auth_session');
    
    // If there is an existing session, try to get user
    if (id) {
      const user = await userRepo.getById(id);
      if (user) return user;
    }

    // If no session exists or user was removed, look for existing users or create/load the default player account
    const allUsers = await userRepo.getAll();
    if (allUsers.length > 0) {
      // Pick first non-admin user or first user available
      const defaultUser = allUsers.find(u => u.username !== 'admin') || allUsers[0];
      localStorage.setItem('auth_session', defaultUser.id);
      return defaultUser;
    }

    // If no users exist at all, automatically create a default ready-to-play profile
    const defaultPlayer = await userRepo.create({
      username: 'لاعب eFootball',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=efootball_champion',
      level: 1,
      xp: 250,
      rating: 1200,
      coins: 1500,
      tickets: 10,
      wins: 14,
      draws: 3,
      losses: 2,
      winRate: 74,
      goals: 42,
      championships: 2,
      isAdmin: false,
      isGuest: false,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem('auth_session', defaultPlayer.id);
    return defaultPlayer;
  }

  static async updateUser(id: string, data: Partial<User>): Promise<User> {
    return await userRepo.update(id, data);
  }
}

