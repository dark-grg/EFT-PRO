import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { newsRepo } from '../repositories';
import { News as NewsItem } from '../types';

const DEFAULT_NEWS = [
  { id: '1', title: 'تم ربط المنصة بقاعدة بيانات Firebase السحابية', date: '2025-05-10', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop', category: 'تحديثات', content: 'جميع الحسابات والبيانات والبطولات الآن متصلة سحابياً بنجاح.' },
  { id: '2', title: 'أفضل 5 تشكيلات وتكتيكات هذا الأسبوع', date: '2025-05-09', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop', category: 'استراتيجيات', content: 'تحليل دقيق لأفضل خطط اللعب في الدوري والتصنيف.' },
  { id: '3', title: 'نصائح احترافية للفوز في مباريات eFootball', date: '2025-05-08', image: 'https://images.unsplash.com/photo-1518605368461-1ee790ab223a?q=80&w=300&auto=format&fit=crop', category: 'نصائح', content: 'كيف توازن بين الضغط العالي والتحكم في خط الدفاع.' },
  { id: '4', title: 'حملة الهدايا والمكافآت الأسبوعية في عجلة الحظ', date: '2025-05-07', image: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=300&auto=format&fit=crop', category: 'مكافآت', content: 'جوائز كوينز وتذاكر بطولات ونقاط خبرة مستمرة.' },
];

export const News = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'updates' | 'events'>('all');
  const [newsList, setNewsList] = useState<NewsItem[]>(DEFAULT_NEWS);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const items = await newsRepo.getAll();
        if (items && items.length > 0) {
          setNewsList(items);
        }
      } catch (err) {
        console.warn('Error fetching news from Firestore:', err);
      }
    };
    fetchNews();
  }, []);

  const filteredNews = newsList.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'updates') return item.category === 'تحديثات' || item.category === 'استراتيجيات';
    if (activeTab === 'events') return item.category === 'مكافآت' || item.category === 'Events';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-8">
      <div className="flex items-center justify-center relative py-2">
        <h2 className="text-xl font-bold text-white">الأخبار والفعاليات</h2>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-6 py-2 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-surface text-gray-400'}`}
        >
          كل الأخبار
        </button>
        <button 
          onClick={() => setActiveTab('updates')}
          className={`px-6 py-2 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${activeTab === 'updates' ? 'bg-blue-600 text-white' : 'bg-surface text-gray-400'}`}
        >
          تحديثات
        </button>
        <button 
          onClick={() => setActiveTab('events')}
          className={`px-6 py-2 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${activeTab === 'events' ? 'bg-blue-600 text-white' : 'bg-surface text-gray-400'}`}
        >
          Events
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {filteredNews.map(item => (
          <Card key={item.id} className="flex overflow-hidden bg-[#0B1221]/90 border-white/5 hover:border-blue-500/30 transition-colors cursor-pointer p-0">
            <div className="w-1/3 aspect-square relative">
              <img src={item.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop'} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#0B1221]/90 to-transparent" />
            </div>
            <div className="w-2/3 p-4 flex flex-col justify-center">
              <h3 className="text-sm font-bold text-white mb-2 leading-tight">{item.title}</h3>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{item.date ? item.date.substring(0, 10) : 'الآن'}</span>
                <span className="text-blue-400 font-bold">{item.category}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

