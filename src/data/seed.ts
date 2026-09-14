import { userRepo, tournamentRepo, rewardRepo, newsRepo } from '../repositories';

export const seedDatabase = async () => {
  try {
    const existingTournaments = await tournamentRepo.getAll();
    if (existingTournaments && existingTournaments.length > 0) {
      return;
    }

    console.log('Seeding initial Firestore database data...');

    // 1. Admin User
    await userRepo.create({
      username: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      level: 99,
      xp: 99000,
      rating: 20000,
      coins: 99999,
      tickets: 999,
      wins: 500,
      draws: 50,
      losses: 10,
      winRate: 89,
      goals: 1500,
      isAdmin: true,
      createdAt: new Date().toISOString()
    });

    // 2. Demo Tournaments
    await tournamentRepo.create({
      name: 'بطولة الأبطال',
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop',
      description: 'أقوى بطولات الموسم تنافس على اللقب.',
      participants: 0,
      maxParticipants: 16,
      entryFee: 100,
      prize: '10,000 Coins',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      status: 'upcoming',
      type: 'Knockout'
    });

    await tournamentRepo.create({
      name: 'دوري المحترفين',
      image: 'https://images.unsplash.com/photo-1518605368461-1ee790ab223a?q=80&w=600&auto=format&fit=crop',
      description: 'دوري طويل يجمع أفضل اللاعبين.',
      participants: 0,
      maxParticipants: 10,
      entryFee: 50,
      prize: '5,000 Coins + 20 Tickets',
      startDate: new Date(Date.now() - 86400000).toISOString(),
      status: 'active',
      type: 'League'
    });

    // 3. Wheel Rewards
    const rewardsData = [
      { name: '1000 Coins', type: 'coins' as const, value: 1000, color: '#f59e0b', probability: 0.1 },
      { name: '100 XP', type: 'xp' as const, value: 100, color: '#3b82f6', probability: 0.2 },
      { name: 'تذكرة بطولة', type: 'tickets' as const, value: 1, color: '#8b5cf6', probability: 0.1 },
      { name: '500 Coins', type: 'coins' as const, value: 500, color: '#f59e0b', probability: 0.3 },
      { name: 'لاعب مميز', type: 'player' as const, value: 1, color: '#ef4444', probability: 0.05 },
      { name: 'لا شيء', type: 'nothing' as const, value: 0, color: '#6b7280', probability: 0.25 },
    ];

    for (const reward of rewardsData) {
      await rewardRepo.create({ ...reward, enabled: true });
    }

    // 4. News
    await newsRepo.create({
      title: 'تحديث الموسم الجديد متاح الآن',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
      date: new Date().toISOString(),
      category: 'تحديثات',
      content: 'تم ربط منصة EFT PRO بقاعدة بيانات Firebase السحابية بنجاح لمزامنة البطولات والنتائج وعجلة الحظ لحظياً!'
    });

    localStorage.setItem('pes_arena_seeded', 'true');
    console.log('Firebase seeding complete.');
  } catch (error) {
    console.warn('Firebase seeding skipped or already initialized:', error);
  }
};

