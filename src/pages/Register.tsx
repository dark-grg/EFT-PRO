import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UserPlus } from 'lucide-react';

export const Register = () => {
  const [username, setUsername] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    try {
      await register(username);
      navigate('/');
    } catch (err) {
      // Handled in context
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in zoom-in duration-500">
      
      <div className="w-16 h-16 mb-4 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
        <UserPlus size={32} />
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">إنشاء حساب جديد</h2>

      <Card className="w-full max-w-sm p-6 bg-surface/80 backdrop-blur-xl border border-white/10">
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400">اختر اسم مستخدم مميز</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="مثال: EFT_Player"
              required
            />
          </div>

          <Button type="submit" size="lg" className="w-full mt-2 gap-2">
            <UserPlus size={20} />
            إنشاء حساب
          </Button>

        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            لديك حساب بالفعل؟ <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">تسجيل الدخول</button>
          </p>
        </div>
      </Card>

    </div>
  );
};
