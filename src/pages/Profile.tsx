import React, { useState } from 'react';
import { Award, UserCheck, Medal, Edit3, Check, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Profile = () => {
  const { currentUser, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.username || '');

  if (!currentUser) return null;

  const userAvatar = currentUser.avatar && !currentUser.avatar.includes('app-logo')
    ? currentUser.avatar
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.username)}`;

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await updateUser({
      username: nameInput.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nameInput.trim())}`
    });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-8 text-right">
      
      <div className="flex items-center justify-center relative py-2">
        <h2 className="text-xl font-bold text-white">الملف الشخصي للاعب</h2>
      </div>

      {/* Header Profile */}
      <Card className="flex items-center gap-4 p-4 bg-[#0B1221]/90 border border-white/5 relative overflow-hidden">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-surface">
            <img 
              src={userAvatar} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        <div className="flex flex-col justify-center flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2 mb-1.5">
              <input 
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="bg-black/50 border border-blue-500/50 rounded-lg px-2.5 py-1 text-sm text-white font-bold focus:outline-none w-full"
                placeholder="اسم اللاعب"
              />
              <button 
                onClick={handleSaveName}
                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 transition-colors"
                title="حفظ"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white uppercase">{currentUser.username}</h2>
              <button 
                onClick={() => {
                  setNameInput(currentUser.username);
                  setIsEditing(true);
                }}
                className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                title="تعديل الاسم"
              >
                <Edit3 size={14} />
              </button>
            </div>
          )}
          <p className="text-xs text-blue-400 mb-2 font-mono">ID: {currentUser.id.substring(0, 8)}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
              Lv. {currentUser.level}
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold">
              نشط وجاهز
            </span>
          </div>
        </div>
      </Card>

      {/* Level Progress */}
      <div className="flex flex-col gap-1 px-2">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] font-bold text-gray-400">مستوى التقدم للخبرة</span>
          <span className="text-[10px] font-bold text-gray-400 font-mono">{currentUser.xp} / {currentUser.level * 1000} XP</span>
        </div>
        <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
            style={{ width: `${Math.min(100, (currentUser.xp / (currentUser.level * 1000)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Table */}
      <Card className="flex flex-col bg-[#0B1221]/90 border border-white/5 overflow-hidden shadow-lg mt-2">
        <div className="flex border-b border-white/5 divide-x divide-white/5 divide-x-reverse">
          <div className="flex-1 p-3 flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] text-gray-400">التعادل</span>
            <span className="text-lg font-bold text-white font-mono">{currentUser.draws}</span>
          </div>
          <div className="flex-1 p-3 flex flex-col items-center justify-center gap-1 bg-white/5">
            <span className="text-[10px] text-gray-400">الفوز</span>
            <span className="text-lg font-bold text-white font-mono">{currentUser.wins}</span>
          </div>
          <div className="flex-1 p-3 flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] text-gray-400">عدد المباريات</span>
            <span className="text-lg font-bold text-white font-mono">{currentUser.wins + currentUser.draws + currentUser.losses}</span>
          </div>
        </div>
        
        <div className="flex divide-x divide-white/5 divide-x-reverse">
          <div className="flex-1 p-4 flex flex-col items-center justify-center gap-1">
            <span className="text-xs text-gray-400">المركز الحالي</span>
            <span className="text-2xl font-black text-white font-mono">#152</span>
          </div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center gap-1 bg-white/5">
            <span className="text-xs text-gray-400">نسبة الفوز</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">{currentUser.winRate}%</span>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-4 bg-[#0B1221]/90 border border-white/5 flex flex-col gap-4 shadow-lg">
        <h3 className="text-sm font-bold text-white text-right w-full">الإنجازات والبطولات</h3>
        <div className="flex justify-around items-center pt-2">
           {[1, 2, 3, 4].map((i) => (
             <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-2 border-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
               <Award size={24} className="text-yellow-100" />
             </div>
           ))}
        </div>
      </Card>

      {/* Reset/New Profile Button (No login screen, stays seamlessly within app) */}
      <Button 
        variant="outline" 
        className="w-full text-gray-300 border-white/10 hover:bg-white/5 mt-2 bg-[#0B1221]/90 gap-2" 
        onClick={logout}
      >
        <RotateCcw size={16} />
        إعادة تعيين الجلسة الحالية
      </Button>
    </div>
  );
};
