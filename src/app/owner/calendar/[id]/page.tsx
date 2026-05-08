"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../../lib/api';

// --- Icons ---
const ChevronLeft = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRight = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const BackIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>; 
const CloseIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function FarmCalendar() {
  const router = useRouter();
  const params = useParams();
  const farmId = params.id as string;

  const [user, setUser] = useState<any>(null); // لحفظ بيانات المستخدم ومعرفة صلاحياته
  const [farmData, setFarmData] = useState<any>(null);
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // جلب البيانات
  const fetchData = async (token: string) => {
    try {
      const [farmRes, calendarRes] = await Promise.all([
        api.getFarmDetails(farmId),
        api.getFarmCalendar(farmId, token) // ✅ تمرير الـ token هنا
      ]);
      setFarmData(farmRes);
      setCalendarDays(calendarRes || []);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      alert("حدث خطأ في جلب بيانات الروزنامة.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('eco_villa_token') : null;
    const userDataStr = typeof window !== 'undefined' ? localStorage.getItem('eco_villa_user') : null;
    
    if (!token || !userDataStr) {
      router.push('/owner/login');
      return;
    }
    
    setUser(JSON.parse(userDataStr));
    fetchData(token);
  }, [farmId]);

  // منطق توليد أيام التقويم
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const blanks = Array.from({ length: firstDay }, (_, i) => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1));
  const allCells = [...blanks, ...days];

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // البحث عن حالة اليوم (مع أتمتة العطل للجمعة والسبت)
  const getDayStatus = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    const dateString = adjustedDate.toISOString().split('T')[0];
    
    const found = calendarDays.find(d => {
      const dbDate = new Date(d.date);
      const dbAdjusted = new Date(dbDate.getTime() - (dbDate.getTimezoneOffset() * 60 * 1000));
      return dbAdjusted.toISOString().split('T')[0] === dateString;
    });

    if (found) return found.status; 

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return 'holiday'; 
    }

    return 'available'; 
  };

  const handleDayClick = (date: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    if (date < today) {
      alert("لا يمكن تعديل الأيام الماضية.");
      return;
    }
    setSelectedDate(date);
    setShowStatusModal(true);
  };

  // دالة تحديث حالة اليوم
  const updateDayStatus = async (newStatus: string) => {
    if (!selectedDate) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('eco_villa_token') || '';
      const offset = selectedDate.getTimezoneOffset();
      const adjustedDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
      const dateString = adjustedDate.toISOString().split('T')[0];
      
      await api.toggleCalendarDay(farmId, dateString, newStatus, token); // ✅ تمرير الـ token هنا
      await fetchData(token);
      setShowStatusModal(false);
    } catch (error: any) {
      alert("خطأ أثناء التحديث: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-bold text-gray-500">جاري تحميل الروزنامة...</div>;

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  return (
    <div dir="rtl" className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] font-sans relative overflow-x-hidden shadow-2xl border-x border-gray-200 flex flex-col">
      
      {/* --- الهيدر العلوي --- */}
      <header className="bg-[#1E1E2D] text-white p-6 shadow-lg shrink-0 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition active:scale-95">
          <BackIcon />
        </button>
        <div>
          <h1 className="text-xl font-black text-[#7CB342] leading-tight">الروزنامة والأسعار</h1>
          <p className="text-xs text-gray-400 mt-1">{farmData?.name || 'جاري التحميل...'}</p>
        </div>
      </header>

      {/* --- مساحة التقويم --- */}
      <main className="flex-1 overflow-y-auto p-5 pb-20">
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
           <div>
              <p className="text-[10px] font-bold text-gray-400">السعر العادي (Available)</p>
              <p className="font-black text-gray-800">{farmData?.price_weekday?.toLocaleString()} ل.س</p>
           </div>
           <div className="h-8 w-px bg-gray-200"></div>
           <div>
              <p className="text-[10px] font-bold text-purple-600">سعر العطلة (Holiday/Weekend)</p>
              <p className="font-black text-purple-700">{farmData?.price_weekend?.toLocaleString()} ل.س</p>
           </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          
          <div className="flex justify-between items-center mb-6">
            <button onClick={prevMonth} className="p-2 bg-gray-50 rounded-full text-gray-600 active:scale-95"><ChevronRight /></button>
            <h2 className="text-lg font-black text-[#232528]">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={nextMonth} className="p-2 bg-gray-50 rounded-full text-gray-600 active:scale-95"><ChevronLeft /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
              <div key={day} className="text-[10px] font-bold text-gray-400 py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {allCells.map((date, index) => {
              if (!date) return <div key={`blank-${index}`} className="h-10"></div>;
              
              const status = getDayStatus(date);
              
              let bgColor = "bg-gray-50";
              let textColor = "text-gray-800";
              let border = "border border-gray-100";
              
              if (status === 'booked') {
                bgColor = "bg-red-50"; textColor = "text-red-600"; border = "border border-red-200";
              } else if (status === 'hold' || status === 'pending_hold') {
                bgColor = "bg-orange-50"; textColor = "text-orange-600"; border = "border border-orange-200";
              } else if (status === 'holiday') {
                bgColor = "bg-purple-50"; textColor = "text-purple-700"; border = "border border-purple-200 shadow-sm";
              }

              const isToday = new Date().toDateString() === date.toDateString();
              if (isToday && status === 'available') {
                 border = "border-2 border-blue-400";
              }

              return (
                <motion.button
                  key={date.toISOString()}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleDayClick(date)}
                  className={`h-12 rounded-xl flex flex-col items-center justify-center font-bold text-sm transition-colors ${bgColor} ${textColor} ${border}`}
                >
                  {date.getDate()}
                  {status === 'holiday' && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-0.5"></span>}
                  {status === 'booked' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-0.5"></span>}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><span className="w-3 h-3 rounded-md bg-gray-100 border border-gray-200"></span> متاح (سعر عادي)</div>
             <div className="flex items-center gap-2 text-xs font-bold text-purple-700"><span className="w-3 h-3 rounded-md bg-purple-100 border border-purple-200"></span> عطلة (سعر مرتفع)</div>
             <div className="flex items-center gap-2 text-xs font-bold text-red-600"><span className="w-3 h-3 rounded-md bg-red-100 border border-red-200"></span> محجوز (مغلق)</div>
             <div className="flex items-center gap-2 text-xs font-bold text-orange-600"><span className="w-3 h-3 rounded-md bg-orange-100 border border-orange-200"></span> معلق (جاري الدفع)</div>
          </div>

        </div>
      </main>

      {/* --- نافذة تحديد الحالة (Modal) --- */}
      <AnimatePresence>
        {showStatusModal && selectedDate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowStatusModal(false)} />
            
            <motion.div 
              initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} 
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                 <div>
                   <h3 className="text-xl font-black text-gray-800">إدارة يوم محدد</h3>
                   <p className="text-sm text-gray-500 font-bold mt-1">تاريخ: {selectedDate.toLocaleDateString('ar-SY')}</p>
                 </div>
                 <button onClick={() => setShowStatusModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 active:scale-95"><CloseIcon /></button>
              </div>

              <div className="space-y-3 mb-6">
                
                {/* 1. أزرار تظهر فقط لفريق الإدارة (Super Admin / Team Admin) */}
                {(user?.role === 'super_admin' || user?.role === 'team_admin') && (
                  <>
                    <button 
                      onClick={() => updateDayStatus('available')}
                      disabled={isUpdating}
                      className="w-full text-right p-4 rounded-xl border-2 border-gray-100 bg-gray-50 hover:border-[#7CB342] transition flex items-center gap-3"
                    >
                      <span className="w-4 h-4 rounded-full bg-gray-300"></span>
                      <div>
                        <div className="font-bold text-gray-800">يوم عادي (متاح)</div>
                        <div className="text-[10px] text-gray-500">يتم تطبيق السعر العادي للمزرعة</div>
                      </div>
                    </button>

                    <button 
                      onClick={() => updateDayStatus('holiday')}
                      disabled={isUpdating}
                      className="w-full text-right p-4 rounded-xl border-2 border-purple-100 bg-purple-50 hover:border-purple-400 transition flex items-center gap-3"
                    >
                      <span className="w-4 h-4 rounded-full bg-purple-500"></span>
                      <div>
                        <div className="font-bold text-purple-800">يوم عطلة / عيد (Holiday)</div>
                        <div className="text-[10px] text-purple-600">يتم تطبيق السعر المرتفع (سعر العطلة)</div>
                      </div>
                    </button>
                  </>
                )}

                {/* 2. زر الإغلاق: يظهر للإدارة دائماً، ويظهر للمالك فقط إذا كان اليوم متاحاً أو عطلة (أخضر أو بنفسجي) */}
                {((user?.role === 'super_admin' || user?.role === 'team_admin') || 
                  (user?.role === 'owner' && (getDayStatus(selectedDate) === 'available' || getDayStatus(selectedDate) === 'holiday'))) && (
                  <button 
                    onClick={() => updateDayStatus('booked')}
                    disabled={isUpdating}
                    className="w-full text-right p-4 rounded-xl border-2 border-red-100 bg-red-50 hover:border-red-400 transition flex items-center gap-3"
                  >
                    <span className="w-4 h-4 rounded-full bg-red-500 shadow-sm shadow-red-200"></span>
                    <div>
                      <div className="font-bold text-red-800">إغلاق اليوم (محجوز)</div>
                      <div className="text-[10px] text-red-600">استخدم هذا إذا تم تأجير المزرعة خارج المنصة</div>
                    </div>
                  </button>
                )}

                {/* رسالة توضيحية للمالك إذا كان اليوم محجوزاً */}
                {user?.role === 'owner' && (getDayStatus(selectedDate) === 'booked' || getDayStatus(selectedDate) === 'hold' || getDayStatus(selectedDate) === 'pending_hold') && (
                  <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-200">
                    <p className="text-sm font-bold text-gray-500">هذا اليوم محجوز أو قيد الدفع.</p>
                    <p className="text-xs text-gray-400 mt-1">لا يمكنك تعديل حالة هذا اليوم. يرجى التواصل مع الإدارة عند الضرورة.</p>
                  </div>
                )}

              </div>

              {isUpdating && <div className="text-center text-sm font-bold text-blue-600 mb-2 animate-pulse">جاري تحديث الروزنامة...</div>}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
