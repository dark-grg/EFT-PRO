import React from 'react';
import { Trophy } from 'lucide-react';

export const TopBar = () => {
  return (
    <div className="sticky top-0 z-40 w-full px-4 pt-[calc(0.625rem+env(safe-area-inset-top,0px))] pb-2.5 bg-background/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-center">
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md border border-white/10">
          <Trophy size={16} className="text-yellow-400" />
        </div>
        <h1 className="text-xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-gray-400 italic">
          EFT PRO
        </h1>
      </div>
    </div>
  );
};
