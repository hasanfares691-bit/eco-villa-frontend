"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

// --- Colors ---
const ECO_GREEN = "#7CB342"; 
const BASALT = "#232528";
const PERSIMMON = "#FF7E5F";

// --- Icons ---
const WalletIcon = () => <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const ClockIcon = () => <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckCircleIcon = () => <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ChevronLeft = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRight = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

export default function OwnerDashboard() {
  const router = useRouter();
  const [farmData, setFarmData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('eco_villa_token');
    
    if (!token) {
      router.push('/owner/login');
      return;
    }

    // جلب مزارع المالك الخاصة به عبر الدالة المخصصة
    api.getMyFarms(token)
      .then((farms: any[]) => {
        if (farms && farms.length > 0) {
          const data = farms[0];
          setFarmData({
            id: data.id,
            title: data.name,
            location: data.region,
            price: data.price_weekday?.toLocaleString() || "0",
            images: data.media?.length > 0 ? data.media.map((m:any) => m.url) : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"],
            maxCapacity: data.max_capacity,
          });
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching farm", err);
        setIsLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('eco_villa_token');
    localStorage.removeItem('eco_villa_user');
    router.push('/');
  };

  const nextImg = (e: any) => { e.preventDefault(); e.stopPropagation(); setImgIndex((prev) => (prev + 1) % (farmData?.images.length || 1)); };
  const prevImg = (e: any) => { e.preventDefault(); e.stopPropagation(); setImgIndex((prev) => (prev === 0 ? farmData.images.length - 1 : prev - 1)); };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold">جاري تأمين الاتصال...</p>
      </div>
    );
  }

  return (
    // 🔴 إزالة القيود الصارمة للموبايل وجعلها تتمدد
    <div dir="rtl" className="w-full min-h-screen bg-[#F8F9FA] relative font-sans overflow-x-hidden selection:bg-[#7CB342]/30 pb-20">
      
      {/* Header */}
      <header className="pt-12 pb-6 px-6 md:px-12 md:pt-16 md:pb-10 bg-[#232528] text-white rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-xl relative z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-1 md:mb-2">أهلاً بك 👋</h1>
            <p className="text-gray-400 text-sm md:text-base font-medium">لوحة تحكم المالك</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-12 h-12 md:w-14 md:h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
            title="تسجيل الخروج"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 pt-8 md:px-8 md:pt-12 max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-5 md:mb-8">
           <h2 className="text-lg md:text-2xl font-black text-[#232528]">مزارعك الحالية</h2>
           <span className="text-xs md:text-sm font-bold text-[#0288D1] bg-blue-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-blue-100">نشطة</span>
        </div>

        {farmData ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            // 🔴 الكرت يصبح بالعرض (أفقي) على الشاشات الكبيرة
            className="bg-white rounded-[2rem] lg:rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] transition-all overflow-hidden relative mb-8 border border-gray-100 flex flex-col md:flex-row"
          >
            {/* قسم الصورة */}
            <div className="relative w-full md:w-1/2 lg:w-[55%] aspect-video md:aspect-auto md:min-h-[350px] bg-gray-200 group shrink-0">
              <AnimatePresence initial={false} mode="wait">
                <motion.img 
                  key={imgIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                  src={farmData.images[imgIndex]} alt={farmData.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </AnimatePresence>

              {farmData.images.length > 1 && (
                <>
                  <button onClick={nextImg} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md p-1.5 md:p-2.5 rounded-full text-white hover:bg-black/40 transition z-10 shadow-sm"><ChevronLeft /></button>
                  <button onClick={prevImg} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md p-1.5 md:p-2.5 rounded-full text-white hover:bg-black/40 transition z-10 shadow-sm"><ChevronRight /></button>
                </>
              )}
            </div>

            {/* قسم المعلومات */}
            <div className="p-5 md:p-8 lg:p-10 flex flex-col grow justify-center w-full md:w-1/2 lg:w-[45%]">
              <h2 style={{ color: PERSIMMON }} className="text-[28px] md:text-[32px] font-black leading-none mb-2">
                {farmData.price} <span className="text-sm md:text-base font-bold opacity-70">ل.س / ليلة</span>
              </h2>
              <h3 className="text-xl md:text-2xl font-bold text-[#232528] mt-2 leading-tight">{farmData.title}</h3>
              <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8">{farmData.location}</p>

              {/* Owner Action Buttons */}
              <div className="flex gap-3 md:gap-4 mt-auto">
                 <Link href={`/owner/calendar/${farmData.id}`} className="flex-1">
                   <motion.button whileTap={{ scale: 0.96 }} className="w-full h-[50px] md:h-[60px] bg-[#232528] hover:bg-black transition-colors text-white rounded-xl font-bold text-[15px] md:text-lg shadow-md flex justify-center items-center gap-2">
                     📅 إدارة الروزنامة
                   </motion.button>
                 </Link>
                 
                 <Link href={`/farms/${farmData.id}`}>
                   <motion.button 
                     whileTap={{ scale: 0.96 }} 
                     className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] bg-gray-100 text-[#0288D1] rounded-xl flex justify-center items-center shadow-sm hover:bg-[#0288D1] hover:text-white transition-colors text-lg md:text-xl"
                     title="مشاهدة صفحة المزرعة كاملة"
                   >
                     👁️
                   </motion.button>
                 </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center text-gray-400 mt-10 md:mt-20 font-bold text-lg">لا يوجد مزارع مضافة حتى الآن.</div>
        )}
      </main>
    </div>
  );
}