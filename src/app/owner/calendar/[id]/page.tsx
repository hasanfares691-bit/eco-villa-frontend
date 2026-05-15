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

  const [user, setUser] = useState<any>(null);
  const [farmData, setFarmData] = useState<any>(null);
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async (token: string) => {
    try {
      const [farmRes, calendarRes] = await Promise.all([
        api.getFarmDetails(farmId),
        api.getFarmCalendar(farmId, token) 
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

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const blanks = Array.from({ length: firstDay }, (_, i) => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1));
  const allCells = [...blanks, ...days];

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

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

  const updateDayStatus = async (newStatus: string) => {
    if (!selectedDate) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('eco_villa_token') || '';
      const offset = selectedDate.getTimezoneOffset();
      const adjustedDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
      const dateString = adjustedDate.toISOString().split('T')[0];
      
      await api.toggleCalendarDay(farmId, dateString, newStatus, token); 
      await fetchData(token);
      setShowStatusModal(false);
    } catch (error: any) {
      alert("خطأ أثناء التحديث: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="min-h-screen w-full bg-[#F8F9FA] flex items-center justify-center font-bold text-gray-500">جاري تحميل الروزنامة...</div>;

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  return (
    // 🔴 تم إزالة القيود وجعلها w-full مع وضع القيود فقط على المحتوى الداخلي
    <div dir="rtl" className="w-full mx-auto min-h-screen bg-[#F8F9FA] font-sans relative overflow-x-hidden shadow-2xl flex flex-col">
      
      {/* --- الهيدر العلوي --- */}
      <header className="bg-[#1E1E2D] text-white p-6 md:px-10 lg:px-16 shadow-lg shrink-0 w-full">
        <div className="max-w-5xl mx-auto flex items-center gap-4 w-full">
          <button onClick={() => router.back()} className="p-2 md:p-3 bg-white/10 rounded-full hover:bg-white/20 transition active:scale-95">
            <BackIcon />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-[#7CB342] leading-tight">الروزنامة والأسعار</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2">{farmData?.name || 'جاري التحميل...'}</p>
          </div>
        </div>
      </header>

      {/* --- مساحة التقويم --- */}
      <main className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-10 pb-20 w-full max-w-5xl mx-auto">
        
        <div className="bg-white p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 mb-6 md:mb-10 flex justify-between items-center">
           <div>
              <p className="text-[10px] md:text-sm font-bold text-gray-400 mb-1">السعر العادي (Available)</p>
              <p className="font-black text-lg md:text-2xl text-gray-800">{farmData?.price_weekday?.toLocaleString()} <span className="text-[10px] md:text-sm">ل.س</span></p>
           </div>
           <div className="h-10 md:h-14 w-px bg-gray-200"></div>
           <div>
              <p className="text-[10px] md:text-sm font-bold text-purple-600 mb-1">سعر العطلة (Holiday/Weekend)</p>
              <p className="font-black text-lg md:text-2xl text-purple-700">{farmData?.price_weekend?.toLocaleString()} <span className="text-[10px] md:text-sm">ل.س</span></p>
           </div>
        </div>

        <div className="bg-white p-5 md:p-8 lg:p-10 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-gray-100">
          
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <button onClick={prevMonth} className="p-2 md:p-3 bg-gray-50 rounded-full text-gray-600 active:scale-95 hover:bg-gray-100 transition"><ChevronRight /></button>
            <h2 className="text-lg md:text-2xl font-black text-[#232528]">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={nextMonth} className="p-2 md:p-3 bg-gray-50 rounded-full text-gray-600 active:scale-95 hover:bg-gray-100 transition"><ChevronLeft /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-3 mb-2 md:mb-4 text-center">
            {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
              <div key={day} className="text-[10px] md:text-sm font-bold text-gray-400 py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-4 lg:gap-5">
            {allCells.map((date, index) => {
              if (!date) return <div key={`blank-${index}`} className="h-12 md:h-20 lg:h-24"></div>;
              
              const status = getDayStatus(date);
              
              let bgColor = "bg-gray-50 hover:bg-gray-100";
              let textColor = "text-gray-800";
              let border = "border border-gray-100";
              
              if (status === 'booked') {
                bgColor = "bg-red-50 hover:bg-red-100"; textColor = "text-red-600"; border = "border border-red-200";
              } else if (status === 'hold' || status === 'pending_hold') {
                bgColor = "bg-orange-50 hover:bg-orange-100"; textColor = "text-orange-600"; border = "border border-orange-200";
              } else if (status === 'holiday') {
                bgColor = "bg-purple-50 hover:bg-purple-100"; textColor = "text-purple-700"; border = "border border-purple-200 shadow-sm";
              }

              const isToday = new Date().toDateString() === date.toDateString();
              if (isToday && status === 'available') {
                 border = "border-2 border-blue-400 shadow-md";
              }

              return (
                <motion.button
                  key={date.toISOString()}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDayClick(date)}
                  className={`h-12 md:h-20 lg:h-24 rounded-xl md:rounded-2xl flex flex-col items-center justify-center font-bold text-sm md:text-xl lg:text-2xl transition-colors cursor-pointer ${bgColor} ${textColor} ${border}`}
                >
                  {date.getDate()}
                  {status === 'holiday' && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-500 mt-1"></span>}
                  {status === 'booked' && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 mt-1"></span>}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-8 md:mt-12 pt-4 md:pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
             <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-600"><span className="w-3 h-3 md:w-4 md:h-4 rounded-md bg-gray-100 border border-gray-200"></span> متاح (عادي)</div>
             <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-purple-700"><span className="w-3 h-3 md:w-4 md:h-4 rounded-md bg-purple-100 border border-purple-200"></span> عطلة (مرتفع)</div>
             <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-red-600"><span className="w-3 h-3 md:w-4 md:h-4 rounded-md bg-red-100 border border-red-200"></span> محجوز (مغلق)</div>
             <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-orange-600"><span className="w-3 h-3 md:w-4 md:h-4 rounded-md bg-orange-100 border border-orange-200"></span> معلق (بالدفع)</div>
          </div>

        </div>
      </main>

      {/* --- نافذة تحديد الحالة (Modal) - معدلة لتكون في المنتصف على الشاشات الكبيرة --- */}
      <AnimatePresence>
        {showStatusModal && selectedDate && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none pb-safe md:pb-0 px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setShowStatusModal(false)} />
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} 
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="w-full md:max-w-md lg:max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl relative z-10 p-6 md:p-8 flex flex-col pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-6 md:mb-8">
                 <div>
                   <h3 className="text-xl md:text-2xl font-black text-gray-800">إدارة يوم محدد</h3>
                   <p className="text-sm md:text-base text-gray-500 font-bold mt-1">تاريخ: {selectedDate.toLocaleDateString('ar-SY')}</p>
                 </div>
                 <button onClick={() => setShowStatusModal(false)} className="bg-gray-100 p-2 md:p-3 rounded-full text-gray-500 hover:bg-gray-200 transition active:scale-95"><CloseIcon /></button>
              </div>

              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                
                {/* أزرار الإدارة */}
                {(user?.role === 'super_admin' || user?.role === 'team_admin') && (
                  <>
                    <button 
                      onClick={() => updateDayStatus('available')}
                      disabled={isUpdating}
                      className="w-full text-right p-4 md:p-5 rounded-xl md:rounded-2xl border-2 border-gray-100 bg-gray-50 hover:border-[#7CB342] transition flex items-center gap-3 md:gap-4"
                    >
                      <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gray-300"></span>
                      <div>
                        <div className="font-bold text-gray-800 md:text-lg">يوم عادي (متاح)</div>
                        <div className="text-[10px] md:text-xs text-gray-500">يتم تطبيق السعر العادي للمزرعة</div>
                      </div>
                    </button>

                    <button 
                      onClick={() => updateDayStatus('holiday')}
                      disabled={isUpdating}
                      className="w-full text-right p-4 md:p-5 rounded-xl md:rounded-2xl border-2 border-purple-100 bg-purple-50 hover:border-purple-400 transition flex items-center gap-3 md:gap-4"
                    >
                      <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-purple-500"></span>
                      <div>
                        <div className="font-bold text-purple-800 md:text-lg">يوم عطلة / عيد (Holiday)</div>
                        <div className="text-[10px] md:text-xs text-purple-600">يتم تطبيق السعر المرتفع (سعر العطلة)</div>
                      </div>
                    </button>
                  </>
                )}

                {/* زر الإغلاق */}
                {((user?.role === 'super_admin' || user?.role === 'team_admin') || 
                  (user?.role === 'owner' && (getDayStatus(selectedDate) === 'available' || getDayStatus(selectedDate) === 'holiday'))) && (
                  <button 
                    onClick={() => updateDayStatus('booked')}
                    disabled={isUpdating}
                    className="w-full text-right p-4 md:p-5 rounded-xl md:rounded-2xl border-2 border-red-100 bg-red-50 hover:border-red-400 transition flex items-center gap-3 md:gap-4"
                  >
                    <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-red-500 shadow-sm shadow-red-200"></span>
                    <div>
                      <div className="font-bold text-red-800 md:text-lg">إغلاق اليوم (محجوز)</div>
                      <div className="text-[10px] md:text-xs text-red-600">استخدم هذا إذا تم تأجير المزرعة خارج المنصة</div>
                    </div>
                  </button>
                )}

                {/* رسالة توضيحية للمالك */}
                {user?.role === 'owner' && (getDayStatus(selectedDate) === 'booked' || getDayStatus(selectedDate) === 'hold' || getDayStatus(selectedDate) === 'pending_hold') && (
                  <div className="p-4 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl text-center border border-gray-200">
                    <p className="text-sm md:text-base font-bold text-gray-500">هذا اليوم محجوز أو قيد الدفع.</p>
                    <p className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2 leading-relaxed">لا يمكنك تعديل حالة هذا اليوم. يرجى التواصل مع الإدارة عند الضرورة.</p>
                  </div>
                )}

              </div>

              {isUpdating && <div className="text-center text-sm md:text-base font-bold text-blue-600 mb-2 animate-pulse">جاري تحديث الروزنامة...</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}