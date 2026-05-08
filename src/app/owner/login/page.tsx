"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

const PERSIMMON = "#FF7E5F";

export default function UnifiedLogin() {
  const router = useRouter();
  const [phoneWa, setPhoneWa] = useState('963900000000'); // حساب المدير العام للتجربة
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.login({ phoneWa, password });
      
      // حفظ التوكن في المتصفح للاستخدام اللاحق
      if (response.token) {
        localStorage.setItem('eco_villa_token', response.token);
        localStorage.setItem('eco_villa_user', JSON.stringify(response.user));
        
        // 🔮 السحر البرمجي (Smart Routing)
        // التحقق من الصلاحية، إذا كان أدمن أو سوبر أدمن يذهب لغرفة العمليات
        if (response.user.role === 'super_admin' || response.user.role === 'team_admin') {
          router.push('/admin/dashboard');
        } else {
          // وإلا فهو مالك، يذهب للوحة تحكم المزارع
          router.push('/owner/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول، تأكد من البيانات.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center px-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
             <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-black text-[#232528] tracking-tight">تسجيل الدخول</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">بوابة الشركاء وفريق العمل</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">رقم الواتساب</label>
            <input 
              type="text" 
              dir="ltr"
              value={phoneWa}
              onChange={(e) => setPhoneWa(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#7CB342] transition font-bold text-gray-700 text-right"
              placeholder="مثال: 963900000000"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
            <input 
              type="password" 
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#7CB342] transition font-bold text-gray-700 text-right"
              placeholder="••••••"
            />
          </div>

          <motion.button 
            whileTap={{ scale: 0.96 }}
            disabled={isLoading}
            type="submit"
            style={{ backgroundColor: isLoading ? '#ccc' : PERSIMMON }}
            className="w-full h-[60px] text-white rounded-xl font-black text-[17px] shadow-[0_8px_20px_rgba(255,126,95,0.3)] flex justify-center items-center mt-2 transition-colors"
          >
            {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "دخول آمن"}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => router.push('/')} className="text-gray-400 text-sm font-bold hover:text-gray-600 transition">
             العودة للصفحة الرئيسية
          </button>
        </div>
      </motion.div>
    </div>
  );
}
