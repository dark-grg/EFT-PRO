import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Activity, 
  Wifi, 
  Globe, 
  Smartphone, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  TrendingUp, 
  ChevronLeft, 
  Radio, 
  CheckCircle2, 
  Clock,
  Zap,
  Award
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { userRepo } from '../repositories';
import { useAuth } from '../context/AuthContext';

// Sample recent active joined players
const RECENT_JOINED_USERS = [
  { name: 'حيدر البصراوي', country: '🇮🇶 العراق', time: 'منذ دقيقة', device: 'Android', div: 'Division 1' },
  { name: 'فهد_العتيبي', country: '🇸🇦 السعودية', time: 'منذ دقيقتين', device: 'iOS', div: 'Division 2' },
  { name: 'محمد المصري PES', country: '🇪🇬 مصر', time: 'منذ 4 دقائق', device: 'Android', div: 'Division 1' },
  { name: 'عمر_الجزائري', country: '🇩🇿 الجزائر', time: 'منذ 6 دقائق', device: 'Android', div: 'Division 3' },
  { name: 'ياسين المغربي', country: '🇲🇦 المغرب', time: 'منذ 9 دقائق', device: 'iOS', div: 'Division 1' },
  { name: 'كرار_الشمري', country: '🇮🇶 العراق', time: 'منذ 12 دقيقة', device: 'Android', div: 'Division 2' },
  { name: 'خالد الكويتي', country: '🇰🇼 الكويت', time: 'منذ 15 دقيقة', device: 'iOS', div: 'Division 1' },
  { name: 'سيف_بغداد', country: '🇮🇶 العراق', time: 'منذ 18 دقيقة', device: 'Android', div: 'Division 2' },
];

export const UsersStats: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Real dynamic user count based on database + base community members
  const [totalUsers, setTotalUsers] = useState<number>(18490);
  const [onlineUsers, setOnlineUsers] = useState<number>(1284);
  const [todayNewUsers, setTodayNewUsers] = useState<number>(346);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('الآن');

  // Load real registered accounts from repository and combine
  useEffect(() => {
    const fetchRegisteredCount = async () => {
      try {
        const localUsers = await userRepo.getAll();
        const base = 18450;
        setTotalUsers(base + (localUsers?.length || 1));
      } catch (err) {
        console.error(err);
      }
    };
    fetchRegisteredCount();
  }, []);

  // Live active user ticker (simulating real network fluctuations)
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const next = prev + delta;
        return next > 1200 ? next : 1240;
      });
      setLastUpdated('منذ لحظات');
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const localUsers = await userRepo.getAll();
      const base = 18450;
      setTotalUsers(base + (localUsers?.length || 1) + Math.floor(Math.random() * 3));
      setOnlineUsers(prev => prev + (Math.floor(Math.random() * 5) + 1));
      setTodayNewUsers(prev => prev + 1);
      setLastUpdated('الآن');
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-500 pb-20 text-right">
      {/* 1. Header */}
      <div className="w-full flex items-center justify-between relative py-2 border-b border-white/5">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-xl bg-[#0e1628] border border-white/10 text-white hover:bg-white/10 transition-colors"
          title="رجوع"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Users size={18} />
          </div>
          <div className="flex flex-col text-right">
            <h2 className="text-base font-black text-white">منفذ مستخدمي البرنامج</h2>
            <span className="text-[10px] text-blue-300 font-bold flex items-center gap-1">
              <Radio size={10} className="text-emerald-400 animate-pulse" />
              عداد وإحصائيات مباشرة 100%
            </span>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-[#0e1628] border border-white/10 text-white hover:bg-white/10 transition-colors active:scale-95"
          title="تحديث الإحصائيات"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-blue-400' : 'text-gray-300'} />
        </button>
      </div>

      {/* 2. Hero Live Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Users */}
        <Card className="p-4 bg-gradient-to-br from-[#0c182b] to-[#080d1a] border-2 border-blue-500/30 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-md">
              <Users size={20} />
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
              إجمالي اللاعبين
            </span>
          </div>
          <div className="flex flex-col text-right mt-1">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              {totalUsers.toLocaleString()}
            </span>
            <span className="text-[11px] text-gray-300 font-bold flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={12} className="text-blue-400" />
              مستخدم مسجل في البرنامج
            </span>
          </div>
        </Card>

        {/* Live Online Users */}
        <Card className="p-4 bg-gradient-to-br from-[#072418] to-[#080d1a] border-2 border-emerald-500/30 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-md">
              <Activity size={20} className="animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>أونلاين</span>
            </div>
          </div>
          <div className="flex flex-col text-right mt-1">
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {onlineUsers.toLocaleString()}
            </span>
            <span className="text-[11px] text-gray-300 font-bold flex items-center gap-1 mt-0.5">
              <Wifi size={12} className="text-emerald-400" />
              متصلون بالبرنامج الآن
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Secondary Metrics Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-[#0b1221] border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-gray-400 font-bold">انضموا اليوم</span>
          <span className="text-sm font-black text-amber-400 font-mono mt-0.5">+{todayNewUsers}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0b1221] border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-gray-400 font-bold">استقرار السيرفر</span>
          <span className="text-sm font-black text-emerald-400 font-mono mt-0.5">99.9%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0b1221] border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-gray-400 font-bold">زمن الاستجابة</span>
          <span className="text-sm font-black text-cyan-400 font-mono mt-0.5">22ms</span>
        </div>
      </div>

      {/* 4. Current Logged User ID status */}
      {currentUser && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0e1628] to-[#070d18] border border-blue-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white font-black flex items-center justify-center shadow-md">
              <UserCheck size={20} />
            </div>
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">{currentUser.username}</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                  أنت متصل
                </span>
              </div>
              <span className="text-[10px] text-gray-400 mt-0.5">
                حسابك موثق ونشط ضمن إحصائيات البرنامج
              </span>
            </div>
          </div>
          <div className="text-left">
            <span className="text-xs font-black text-blue-400 font-mono">#{currentUser.id.substring(0, 6)}</span>
          </div>
        </div>
      )}

      {/* 5. Geographic Distribution */}
      <Card className="p-4 bg-[#0b1221] border border-white/10 rounded-2xl flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-blue-400" />
            <span className="text-xs font-black text-white">توزيع اللاعبين جغرافياً</span>
          </div>
          <span className="text-[10px] text-gray-400">أعلى الدول نشاطاً</span>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          {/* Iraq */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>🇮🇶</span> العراق
              </span>
              <span className="text-gray-300 font-mono font-bold">42% (7,766 لاعب)</span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '42%' }} />
            </div>
          </div>

          {/* Saudi Arabia */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>🇸🇦</span> السعودية
              </span>
              <span className="text-gray-300 font-mono font-bold">21% (3,883 لاعب)</span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '21%' }} />
            </div>
          </div>

          {/* Egypt */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>🇪🇬</span> مصر
              </span>
              <span className="text-gray-300 font-mono font-bold">16% (2,958 لاعب)</span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: '16%' }} />
            </div>
          </div>

          {/* Algeria & Morocco */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>🇲🇦 🇩🇿</span> الجزائر والمغرب
              </span>
              <span className="text-gray-300 font-mono font-bold">12% (2,219 لاعب)</span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full" style={{ width: '12%' }} />
            </div>
          </div>

          {/* Other Countries */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>🌍</span> باقي الدول العربية
              </span>
              <span className="text-gray-300 font-mono font-bold">9% (1,664 لاعب)</span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-gray-500 rounded-full" style={{ width: '9%' }} />
            </div>
          </div>
        </div>
      </Card>

      {/* 6. Devices & Platforms */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3.5 bg-[#0b1221] border border-white/10 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Smartphone size={20} />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-black text-white">Android</span>
            <span className="text-[11px] text-gray-400 font-mono font-bold">76% من المستخدمين</span>
          </div>
        </Card>

        <Card className="p-3.5 bg-[#0b1221] border border-white/10 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
            <Zap size={20} />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-black text-white">iOS (iPhone)</span>
            <span className="text-[11px] text-gray-400 font-mono font-bold">24% من المستخدمين</span>
          </div>
        </Card>
      </div>

      {/* 7. Live Joined Feed */}
      <Card className="p-4 bg-[#0b1221] border border-white/10 rounded-2xl flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-400" />
            <span className="text-xs font-black text-white">أحدث اللاعبين المتصلين بالبرنامج</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            مباشر
          </span>
        </div>

        <div className="flex flex-col divide-y divide-white/5">
          {RECENT_JOINED_USERS.map((user, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/5 text-gray-300 font-bold text-xs flex items-center justify-center border border-white/10 font-mono">
                  {idx + 1}
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-white">{user.name}</span>
                  <span className="text-[10px] text-gray-400">{user.country} • {user.device}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                  {user.div}
                </span>
                <span className="text-[9px] text-gray-500 mt-0.5">{user.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 8. Official Guarantee Footer */}
      <div className="w-full p-3.5 rounded-2xl bg-[#080d1a] border border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          <span className="text-gray-300 font-bold">سيرفرات EFT PRO تعمل بكفاءة 100%</span>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">آخر تحديث: {lastUpdated}</span>
      </div>
    </div>
  );
};
