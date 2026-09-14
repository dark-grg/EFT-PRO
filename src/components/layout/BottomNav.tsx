import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Scan, Gift, Gauge, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { openTelegramAndWheel } from '../../lib/telegramRedirect';

export const BottomNav = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'الرئيسية', path: '/' },
    { icon: Scan, label: 'حلل تشكيلتك', path: '/formation-reader' },
    { icon: Gift, label: 'عجلة الحظ', path: '/wheel' },
    { icon: Gauge, label: 'فحص الجهاز', path: '/device-check' },
  ];

  if (currentUser?.isAdmin) {
    navItems.push({ icon: Settings, label: 'الإدارة', path: '/admin' });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-2 bg-background/80 backdrop-blur-xl border-t border-white/10">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={(e) => {
              if (item.path === '/wheel') {
                e.preventDefault();
                openTelegramAndWheel(navigate);
              }
            }}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center p-2 rounded-xl transition-all duration-300",
                isActive ? "text-primary neon-text-blue" : "text-gray-400 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-300 mb-1",
                  isActive ? "bg-primary/20" : "bg-transparent"
                )}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
