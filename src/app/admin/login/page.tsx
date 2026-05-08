"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [phoneWa, setPhoneWa] = useState('963900000000'); // حساب المدير العام
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.login({ phoneWa, password });
      if (response.token) {
        // حماية: يمنع دخول أي شخص ليس من الإدارة
        if (response.user.role !== 'super_admin' && response.user.role !== 'team_admin') {
          throw new Error('ليس لديك صلاحيات إدارية للدخول هنا');
        }
        localStorage.setItem('eco_villa_token', response.token);
        localStorage.setItem('eco_villa_user', JSON.stringify(response.user));
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-900 flex justify-center items-center px-6 font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-800">غرفة العمليات 🛡️</h1>
          <p className="text-gray-500 mt-2 font-bold">بوابة الدخول الحصرية لفريق العمل</p>
        </div>
        {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-6 text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
            <input type="text" dir="ltr" value={phoneWa} onChange={e => setPhoneWa(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-blue-500 font-bold text-right" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
            <input type="password" dir="ltr" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-blue-500 font-bold text-right" />
          </div>
          <button disabled={isLoading} type="submit" className="w-full h-14 bg-blue-600 text-white rounded-xl font-black text-lg mt-4 shadow-lg hover:bg-blue-700 transition">
            {isLoading ? "جاري التحقق..." : "تسجيل الدخول للنظام"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
