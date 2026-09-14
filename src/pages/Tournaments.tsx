import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';

const MOCK_TOURNAMENTS = [
  { id: 1, name: 'دوري العراق', players: 16, status: 'active', icon: 'S' },
  { id: 2, name: 'بطولة الأصدقاء', players: 8, status: 'upcoming', icon: '★' },
  { id: 3, name: 'كأس التحدي', players: 16, status: 'completed', icon: '🛡️' },
];

export const Tournaments = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-8">
      
      <div className="w-full flex items-center relative py-2 justify-center">
        <button className="absolute left-0 text-white"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-bold text-white">البطولات</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#0B1221] rounded-xl border border-white/5">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'active' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400'
          }`}
        >
          جارية
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'upcoming' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400'
          }`}
        >
          قادمة
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'completed' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400'
          }`}
        >
          مكتملة
        </button>
      </div>

      {/* Hero Tournament */}
      <Card className="overflow-hidden relative border-white/10 rounded-2xl bg-[#0B1221]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] to-transparent z-10" />
        <img src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop" alt="Hero" className="w-full h-48 object-cover opacity-80" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col items-center">
          <h3 className="text-2xl font-black text-white text-center mb-1 drop-shadow-md">بطولة الأبطال</h3>
          <p className="text-xs text-gray-300 font-bold mb-1">عدد اللاعبين: 32</p>
          <p className="text-xs text-gray-300 font-bold mb-4">الجوائز: 10,000 كوينز</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-full text-sm transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            التفاصيل
          </button>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-white text-right">البطولات المتاحة</h3>
        
        {MOCK_TOURNAMENTS.map(t => (
          <Card key={t.id} className="flex items-center p-3 gap-4 bg-[#0B1221] border border-white/5 cursor-pointer hover:bg-white/5">
            <div className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xl shadow-inner">
              {t.icon}
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-1">
              <h4 className="font-bold text-sm text-white">{t.name}</h4>
              <p className="text-[10px] text-gray-400">عدد اللاعبين: {t.players}</p>
            </div>
            
            <div className="flex items-center">
              <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${
                t.status === 'active' ? 'bg-green-500 text-white' : 
                t.status === 'upcoming' ? 'bg-yellow-500 text-white' : 
                'bg-gray-500 text-white'
              }`}>
                {t.status === 'active' ? 'جارية' : t.status === 'upcoming' ? 'قادمة' : 'مكتملة'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
