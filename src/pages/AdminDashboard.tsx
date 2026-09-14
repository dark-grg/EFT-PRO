import React, { useState, useEffect } from 'react';
import { Users, Trophy, Settings, Activity, Database, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { userRepo, tournamentRepo, matchRepo } from '../repositories';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    tournaments: 0,
    matches: 0
  });

  const fetchStats = async () => {
    const u = await userRepo.getAll();
    const t = await tournamentRepo.getAll();
    const m = await matchRepo.getAll();
    setStats({
      users: u.length,
      tournaments: t.length,
      matches: m.length
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="text-gray-400" />
          لوحة الإدارة
        </h2>
        <button onClick={fetchStats} className="p-2 bg-surface rounded-full text-gray-400 hover:text-white transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Users size={16} className="text-blue-500" />
            <span className="text-xs font-bold">اللاعبين</span>
          </div>
          <span className="text-3xl font-black text-white">{stats.users}</span>
        </Card>
        
        <Card className="p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-xs font-bold">البطولات</span>
          </div>
          <span className="text-3xl font-black text-white">{stats.tournaments}</span>
        </Card>

        <Card className="p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Activity size={16} className="text-green-500" />
            <span className="text-xs font-bold">المباريات</span>
          </div>
          <span className="text-3xl font-black text-white">{stats.matches}</span>
        </Card>

        <Card className="p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Database size={16} className="text-purple-500" />
            <span className="text-xs font-bold">النظام</span>
          </div>
          <span className="text-sm font-bold text-green-400">متصل (Local)</span>
        </Card>
      </div>

      <Card className="p-4 mt-4">
        <h3 className="text-sm font-bold text-white mb-4">إدارة سريعة</h3>
        <div className="flex flex-col gap-2 text-sm">
          <button 
            onClick={() => window.location.href = '/owner/player-developments'}
            className="w-full text-right p-3 bg-gradient-to-r from-blue-950/60 to-purple-950/60 hover:from-blue-900/60 hover:to-purple-900/60 border border-blue-500/30 rounded-xl text-white font-bold transition-all flex items-center justify-between"
          >
            <span>إدارة تطويرات اللاعبين (Player Developments)</span>
            <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">جديد</span>
          </button>
          <button className="w-full text-right p-3 bg-surface hover:bg-surface-hover rounded-lg text-gray-300 transition-colors">
            إدارة المستخدمين
          </button>
          <button className="w-full text-right p-3 bg-surface hover:bg-surface-hover rounded-lg text-gray-300 transition-colors">
            إدارة البطولات
          </button>
          <button className="w-full text-right p-3 bg-surface hover:bg-surface-hover rounded-lg text-gray-300 transition-colors">
            إعدادات العجلة
          </button>
        </div>
      </Card>

    </div>
  );
};
