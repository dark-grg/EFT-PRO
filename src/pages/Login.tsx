import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LogIn, Gamepad2, Sparkles } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    try {
      setIsLoggingIn(true);
      await login(username);
      navigate('/');
    } catch (err) {
      // Error is handled in context via Toast
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuest = async () => {
    try {
      setIsLoggingIn(true);
      await guestLogin();
      navigate('/');
    } catch (err) {
      // Handled
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in zoom-in duration-500">
      
      <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] border border-white/20">
        <Gamepad2 size={40} className="text-white" />
      </div>

      <h1 className="text-3xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 neon-text-blue mb-2">
        EFT PRO
      </h1>
      <p className="text-gray-400 text-sm mb-6">قاعدة بيانات محلية</p>

      <Card className="w-full max-w-sm p-6 bg-surface/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400">اسم المستخدم</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-right"
              placeholder="أدخل اسمك المسجل..."
              required
            />
          </div>

          <Button type="submit" size="lg" disabled={isLoggingIn} className="w-full mt-1 gap-2">
            <LogIn size={20} />
            دخول بالاسم
          </Button>

        </form>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <span className="relative bg-surface px-4 text-xs text-gray-500">خيارات أخرى</span>
        </div>

        <Button variant="secondary" size="lg" disabled={isLoggingIn} className="w-full mb-3" onClick={() => navigate('/register')}>
          إنشاء حساب جديد
        </Button>

        <Button variant="ghost" size="md" disabled={isLoggingIn} className="w-full text-gray-400 hover:text-white" onClick={handleGuest}>
          الدخول كزائر سريع
        </Button>
      </Card>

    </div>
  );
};

