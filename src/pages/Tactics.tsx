import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const Tactics = () => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-8">
      <div className="w-full flex items-center relative py-2 justify-center">
        <button className="absolute left-0 text-white"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-bold text-white">الخطط التكتيكية</h2>
      </div>

      {/* Pitch Image Representation */}
      <Card className="w-full aspect-[4/3] bg-green-900 overflow-hidden relative border-2 border-white/10 rounded-2xl">
         <div className="absolute inset-4 border-2 border-white/20 rounded-md pointer-events-none" />
         <div className="absolute left-1/2 top-4 bottom-4 w-0 border-l-2 border-white/20 pointer-events-none" />
         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-white/20 pointer-events-none" />
         <div className="absolute left-4 top-1/2 -translate-y-1/2 h-40 w-24 border-2 border-white/20 rounded-r-md pointer-events-none" />
         <div className="absolute right-4 top-1/2 -translate-y-1/2 h-40 w-24 border-2 border-white/20 rounded-l-md pointer-events-none" />
         
         {/* Formation nodes & arrows matching image */}
         <div className="absolute w-6 h-6 bg-blue-500 rounded-full right-[10%] top-1/2 -translate-y-1/2 border-2 border-white" />
         <div className="absolute w-6 h-6 bg-blue-500 rounded-full right-[30%] top-[20%] border-2 border-white" />
         <div className="absolute w-6 h-6 bg-blue-500 rounded-full right-[30%] top-[80%] border-2 border-white" />
         
         <div className="absolute w-6 h-6 bg-blue-500 rounded-full left-[40%] top-1/2 -translate-y-1/2 border-2 border-white" />
         <div className="absolute w-6 h-6 bg-blue-500 rounded-full left-[25%] top-[25%] border-2 border-white" />
         <div className="absolute w-6 h-6 bg-blue-500 rounded-full left-[25%] top-[75%] border-2 border-white" />
         
         <div className="absolute w-6 h-6 bg-white rounded-full left-[10%] top-1/2 -translate-y-1/2 border-2 border-black" />
         <span className="absolute top-4 left-6 text-white font-bold text-lg">4-3-3</span>
      </Card>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-white text-right">تعليمات الفريق</h3>
        
        <div className="flex items-center justify-between p-3 bg-[#0B1221] border border-white/5 rounded-xl">
          <span className="text-sm font-bold text-white">الأسلوب الهجومي</span>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-xs text-gray-300">هجمات مرتدة</span>
            <ChevronLeft size={14} className="text-gray-400 rotate-180" />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#0B1221] border border-white/5 rounded-xl">
          <span className="text-sm font-bold text-white">الأسلوب الدفاعي</span>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-xs text-gray-300">متوازن</span>
            <ChevronLeft size={14} className="text-gray-400 rotate-180" />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#0B1221] border border-white/5 rounded-xl">
          <span className="text-sm font-bold text-white">الضغط</span>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-xs text-gray-300">مرتفع</span>
            <ChevronLeft size={14} className="text-gray-400 rotate-180" />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#0B1221] border border-white/5 rounded-xl">
          <span className="text-sm font-bold text-white">التمركز</span>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-xs text-gray-300">أمام</span>
            <ChevronLeft size={14} className="text-gray-400 rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
};
