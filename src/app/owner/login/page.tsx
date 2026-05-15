"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

const PERSIMMON = "#FF7E5F";
const ECO_GREEN = "#7CB342"; 
const BASALT = "#232528";

export default function UnifiedLogin() {
  const router = useRouter();
  // 🔴 تم تفريغ الخانات تماماً لتكون جاهزة للإنتاج الحقيقي
  const [phoneWa, setPhoneWa] = useState(''); 
  const [password, setPassword] = useState('');
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
    // 🔴 تم إزالة القيود الضيقة ليأخذ العرض بالكامل، مع توسيط المحتوى
    <div dir="rtl" className="min-h-screen bg-[#F8F9FA] flex justify-center items-center p-4 md:p-8 font-sans">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        // 🔴 الكرت يصبح مقسوم (أفقي) على الشاشات الكبيرة
        className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100"
      >
        
        {/* 💻 القسم الجمالي: يختفي عالموبايل ويظهر عاللابتوب */}
        <div className="hidden md:flex md:w-1/2 bg-[#232528] p-12 flex-col justify-center items-center text-white text-center relative overflow-hidden">
           {/* لمسة جمالية علوية */}
           <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-[#7CB342] to-[#FF7E5F]"></div>
           
           <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/10 shadow-lg">
             <span className="text-5xl"><div className="flex flex-col items-center leading-none font-black tracking-tighter">
  <span className="text-[#7CB342] text-[28px] uppercase">Eco</span>
  <span className="text-[#0288D1] text-[28px] -mt-2">Villa</span>
</div></span>
           </div>
           <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight">Eco Villa</h2>
           <p className="text-base lg:text-lg font-medium opacity-70 leading-relaxed max-w-sm">
             مرحباً بك في منصة إيكو فيلا. بوابتك لإدارة أعمالك وحجوزاتك بكل سهولة، أمان، واحترافية.
           </p>
        </div>

        {/* 📱 قسم الفورم: يأخذ العرض كامل عالموبايل، ونصف العرض عاللابتوب */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="text-center md:text-right mb-8 md:mb-10">
            {/* الأيقونة تظهر فقط عالموبايل */}
            <div className="w-16 h-16 bg-gray-50 rounded-2xl mx-auto md:hidden flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
               <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#232528] tracking-tight">تسجيل الدخول</h1>
            <p className="text-sm md:text-base text-gray-500 mt-2 font-medium">بوابة الشركاء وفريق العمل</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 text-center md:text-right">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رقم الواتساب</label>
              <input 
                type="text" 
                dir="ltr"
                value={phoneWa}
                onChange={(e) => setPhoneWa(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#7CB342] transition font-bold text-gray-700 text-right md:text-lg"
                placeholder="مثال: 09XXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
              <input 
                type="password" 
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#7CB342] transition font-bold text-gray-700 text-right md:text-lg"
                placeholder="••••••"
              />
            </div>

            <motion.button 
              whileTap={{ scale: 0.96 }}
              disabled={isLoading}
              type="submit"
              style={{ backgroundColor: isLoading ? '#ccc' : PERSIMMON }}
              className="w-full h-[60px] md:h-[65px] text-white rounded-xl font-black text-[17px] md:text-lg shadow-[0_8px_20px_rgba(255,126,95,0.3)] hover:shadow-[0_12px_25px_rgba(255,126,95,0.4)] flex justify-center items-center mt-2 transition-all"
            >
              {isLoading ? <div className="w-6 h-6 md:w-7 md:h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "دخول آمن"}
            </motion.button>
          </form>

          <div className="mt-8 md:mt-10 text-center md:text-right">
            <button onClick={() => router.push('/')} className="text-gray-400 text-sm font-bold hover:text-gray-600 transition flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
               <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}