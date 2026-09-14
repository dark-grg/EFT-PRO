import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Scan, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Formations = () => {
  const [activeTab, setActiveTab] = useState<'mine' | 'ready'>('mine');
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-8">
      
      <div className="w-full flex items-center relative py-2 justify-center">
        <button onClick={() => navigate(-1)} className="absolute left-0 text-white"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-bold text-white">التشكيلات</h2>
      </div>

      {/* Formation Reader Banner */}
      <div 
        onClick={() => navigate('/formation-reader')}
        className="p-3 bg-gradient-to-r from-cyan-950/60 via-blue-950/50 to-[#0B1221] border border-cyan-500/30 rounded-xl flex items-center justify-between cursor-pointer hover:border-cyan-400/60 transition-all shadow-md group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Scan size={16} />
          </div>
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors">قارئ التشكيلة الذكي</span>
              <span className="text-[9px] bg-cyan-500 text-black font-black px-1 rounded">جديد</span>
            </div>
            <span className="text-[10px] text-gray-400">فحص الأخطاء والثغرات وتقديم النصائح</span>
          </div>
        </div>
        <span className="text-xs font-bold text-cyan-400 flex items-center gap-0.5">
          <span>افحص الآن</span>
          <ChevronLeft size={14} />
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#0B1221] rounded-xl border border-white/5">
        <button
          onClick={() => setActiveTab('mine')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'mine' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400'
          }`}
        >
          تشكيلاتي
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'ready' 
              ? 'bg-[#0B1221] text-gray-400' 
              : 'text-gray-400'
          }`}
        >
          تشكيلات جاهزة
        </button>
      </div>

      <div className="flex items-center gap-2 px-2">
        <h3 className="font-bold text-white text-lg flex-1">4-3-3</h3>
      </div>

      {/* Pitch Representation */}
      <Card className="w-full aspect-[3/4] bg-[#0d5929] overflow-hidden relative border-2 border-white/10 rounded-2xl mx-auto shadow-2xl">
         <div className="absolute inset-4 border border-white/30 rounded-sm pointer-events-none" />
         <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0 border-t border-white/30 pointer-events-none" />
         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/30 pointer-events-none" />
         <div className="absolute left-1/2 top-4 -translate-x-1/2 w-48 h-32 border border-white/30 rounded-b-sm pointer-events-none" />
         <div className="absolute left-1/2 bottom-4 -translate-x-1/2 w-48 h-32 border border-white/30 rounded-t-sm pointer-events-none" />
         
         {/* GK */}
         <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=gk" alt="Player" className="w-8 h-8 rounded-full border-2 border-green-400 bg-black/50" />
         </div>
         
         {/* Defenders */}
         <div className="absolute bottom-[25%] left-[15%] -translate-x-1/2 flex flex-col items-center">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=lb" alt="Player" className="w-8 h-8 rounded-full border-2 border-gray-400 bg-black/50" />
         </div>
         <div className="absolute bottom-[22%] left-[38%] -translate-x-1/2 flex flex-col items-center">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=cb1" alt="Player" className="w-8 h-8 rounded-full border-2 border-gray-400 bg-black/50" />
         </div>
         <div className="absolute bottom-[22%] left-[62%] -translate-x-1/2 flex flex-col items-center">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=cb2" alt="Player" className="w-8 h-8 rounded-full border-2 border-gray-400 bg-black/50" />
         </div>
         <div className="absolute bottom-[25%] left-[85%] -translate-x-1/2 flex flex-col items-center">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=rb" alt="Player" className="w-8 h-8 rounded-full border-2 border-gray-400 bg-black/50" />
         </div>

         {/* Midfielders */}
         <div className="absolute bottom-[50%] left-[30%] -translate-x-1/2 flex flex-col items-center">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=cm1" alt="Player" className="w-8 h-8 rounded-full border-2 border-yellow-400 bg-black/50" />
         </div>
         <div className="absolute bottom-[45%] left-[50%] -translate-x-1/2 flex flex-col items-center">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=cdm" alt="Player" className="w-8 h-8 rounded-full border-2 border-yellow-400 bg-black/50" />
         </div>
         <div className="absolute bottom-[50%] left-[70%] -translate-x-1/2 flex flex-col items-center">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=cm2" alt="Player" className="w-8 h-8 rounded-full border-2 border-yellow-400 bg-black/50" />
         </div>

         {/* Forwards */}
         <div className="absolute top-[20%] left-[25%] -translate-x-1/2 flex flex-col items-center">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=lw" alt="Player" className="w-8 h-8 rounded-full border-2 border-red-400 bg-black/50" />
         </div>
         <div className="absolute top-[15%] left-[50%] -translate-x-1/2 flex flex-col items-center">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=st" alt="Player" className="w-8 h-8 rounded-full border-2 border-red-400 bg-black/50" />
         </div>
         <div className="absolute top-[20%] left-[75%] -translate-x-1/2 flex flex-col items-center">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=rw" alt="Player" className="w-8 h-8 rounded-full border-2 border-red-400 bg-black/50" />
         </div>
      </Card>

      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">حفظ</button>
        <button className="flex-1 bg-[#0B1221] border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 font-bold py-3 rounded-xl transition-colors">تعديل</button>
        <button className="flex-1 bg-[#0B1221] border border-white/10 text-gray-300 hover:bg-white/5 font-bold py-3 rounded-xl transition-colors">مشاركة</button>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <h3 className="text-sm font-bold text-white text-right">التشكيلات الأخرى</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 flex flex-col items-center gap-2 bg-[#0B1221] border-white/5 cursor-pointer hover:border-blue-500/50">
            <span className="text-sm font-bold text-white">4-2-3-1</span>
            <div className="w-full aspect-[3/4] bg-green-900/50 rounded flex items-center justify-center opacity-60 border border-green-500/20">
               <span className="text-[10px] text-green-300">Pitch Preview</span>
            </div>
          </Card>
          <Card className="p-3 flex flex-col items-center gap-2 bg-[#0B1221] border-white/5 cursor-pointer hover:border-blue-500/50">
            <span className="text-sm font-bold text-white">4-4-2</span>
            <div className="w-full aspect-[3/4] bg-green-900/50 rounded flex items-center justify-center opacity-60 border border-green-500/20">
               <span className="text-[10px] text-green-300">Pitch Preview</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
