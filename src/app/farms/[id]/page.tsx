"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../lib/api';

// --- Icons ---
const ChevronLeft = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRight = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const BackIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
const CloseIconX = () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ZoomIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>;
const MapIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BedIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 11v6a2 2 0 002 2h14a2 2 0 002-2v-6M3 11h18M5 15h14M8 7h8" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const AreaIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>;
const TelegramIcon = () => <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.03-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.23.29-.48.78-.73 3.02-1.31 5.05-2.18 6.08-2.61 2.89-1.2 3.49-1.38 3.89-1.39.09 0 .28.02.39.11.09.07.13.17.15.28 0 .04.01.19.01.27z"/></svg>;
const StarIcon = ({ solid = true }) => <svg className={`w-5 h-5 ${solid ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;

export default function FarmDetailsCustomer() {
  const router = useRouter();
  const params = useParams();
  const farmId = params?.id as string;

  const [farmData, setFarmData] = useState<any>(null);
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  // --- حالة معرض الصور الكامل (Fullscreen Viewer) ---
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- حالات الحجز بنقرة واحدة ---
  const [selectedDateForBooking, setSelectedDateForBooking] = useState<Date | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  // --- تقويم العرض ---
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- حالات فورم التقييم ---
  const [reviewForm, setReviewForm] = useState({ tenantName: '', invoiceId: '', stars: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if(!farmId) return;
    const fetchDetails = async () => {
      try {
        const [fData, calData, revData] = await Promise.all([
          api.getFarmDetails(farmId),
          api.getFarmCalendar(farmId),
          api.getFarmReviewsPublic(farmId).catch(() => []) 
        ]);
        
        setFarmData(fData);
        setCalendarDays(calData || []);
        setReviews(revData || []); 
        
      } catch (err) {
        console.error("Error fetching farm details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [farmId]);

  // --- دوال السلايدر ---
  const images = farmData?.media?.map((m: any) => m.url) || ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"];
  const nextImg = (e: any) => { e?.stopPropagation(); setImgIndex((prev) => (prev + 1) % images.length); };
  const prevImg = (e: any) => { e?.stopPropagation(); setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); };

  // --- دوال التقويم ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const blanks = Array.from({ length: firstDay }, () => null);
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
      const dbOffset = dbDate.getTimezoneOffset();
      const dbAdjusted = new Date(dbDate.getTime() - (dbOffset * 60 * 1000));
      return dbAdjusted.toISOString().split('T')[0] === dateString;
    });
    
    if (found) return found.status;
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) return 'holiday';
    return 'available';
  };

  const handleDayClick = (date: Date, status: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (date < today) return; 

    if (status === 'booked' || status === 'hold' || status === 'pending_hold') {
      setSelectedDateForBooking(null);
      setCalculatedPrice(null);
      return; 
    }

    setSelectedDateForBooking(date);
    if (status === 'holiday') {
      setCalculatedPrice(farmData.price_weekend);
    } else {
      setCalculatedPrice(farmData.price_weekday);
    }
  };

  // 🚀 دالة توليد رسالة الحجز وإرسالها عبر واتساب
  const handleBookNow = () => {
    if (!selectedDateForBooking || !calculatedPrice || !farmData) return;

    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = selectedDateForBooking.toLocaleDateString('ar-SY', dateOptions);

    const message = `مرحباً فريق إيكو فيلا،\nأنا مهتم بحجز: *${farmData.name}* ( ${farmData.region} ).\nالتاريخ المطلوب: *${formattedDate}*.\nالسعر المعروض: *${calculatedPrice.toLocaleString()} ل.س*.\nهل يمكنكم تأكيد التوافر وإخباري بخطوات الدفع؟`;

    const whatsappNumber = "963940457043";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // 🚀 دالة إرسال التقييم
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.invoiceId || !reviewForm.comment) {
      alert("يرجى تعبئة رقم الفاتورة والتعليق لتتمكن من إضافة التقييم.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const cleanInvoiceId = reviewForm.invoiceId.replace(/#/g, '').trim();

      await api.submitPublicReview({
        farm_id: farmId,
        invoice_id: cleanInvoiceId,
        tenant_name: reviewForm.tenantName || 'ضيف',
        stars: reviewForm.stars,
        comment: reviewForm.comment
      });
      
      alert("تم استلام تقييمك بنجاح! سيتم نشره بعد التحقق من رقم الفاتورة من قبل الإدارة.");
      setReviewForm({ tenantName: '', invoiceId: '', stars: 5, comment: '' });
    } catch (err: any) {
      alert("حدث خطأ أثناء إرسال التقييم: " + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };
  

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">جاري تجهيز المزرعة...</div>;
  if (!farmData) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">المزرعة غير موجودة</div>;

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  return (
    // 🔴 تم إزالة القيود الضيقة ليأخذ العرض الكامل 
    <div dir="rtl" className="min-h-screen bg-[#F8F9FA] relative font-sans overflow-x-hidden pb-32 md:pb-40">
      
      {/* 1. سلايدر الصور (متجاوب مع الشاشات الكبيرة) */}
      <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[65vh] bg-gray-200 cursor-pointer lg:max-w-7xl lg:mx-auto lg:mt-6 lg:rounded-3xl overflow-hidden shadow-sm" onClick={() => setIsFullscreen(true)}>
        <button onClick={(e) => { e.stopPropagation(); router.back(); }} className="absolute top-6 right-5 md:top-8 md:right-8 z-20 bg-black/30 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-black/50 transition">
          <BackIcon />
        </button>

        {farmData.classification && (
          <div className="absolute top-6 left-5 md:top-8 md:left-8 z-20 bg-white/95 backdrop-blur-sm text-purple-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-black shadow-lg">
            {farmData.classification}
          </div>
        )}

        <div className="absolute bottom-6 right-5 md:bottom-8 md:right-8 z-20 bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-1.5">
          <ZoomIcon /> تكبير الصور
        </div>

        <AnimatePresence initial={false} mode="wait">
          <motion.img 
            key={imgIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            src={images[imgIndex]} alt={farmData.name} className="absolute inset-0 w-full h-full object-cover" 
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button onClick={nextImg} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md p-2 md:p-3 rounded-full text-white z-10 hover:bg-black/40 transition"><ChevronLeft /></button>
            <button onClick={prevImg} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md p-2 md:p-3 rounded-full text-white z-10 hover:bg-black/40 transition"><ChevronRight /></button>
            <div className="absolute bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10">
              {images.map((_: any, idx: number) => (
                <div key={idx} className={`h-1.5 md:h-2 rounded-full transition-all ${idx === imgIndex ? 'w-5 md:w-8 bg-white' : 'w-2 md:w-3 bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* 2. قسم المعلومات (كارد يطفو فوق الصورة عاللابتوب) */}
      <div className="bg-white rounded-t-3xl lg:rounded-3xl -mt-6 lg:-mt-16 relative z-20 p-6 md:p-8 lg:p-10 shadow-sm lg:shadow-xl lg:max-w-5xl lg:mx-auto md:mx-6 mx-0">
        
        {/* الاسم والكود والمنطقة */}
        <div className="mb-6 lg:mb-8">
           <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-800 leading-tight">{farmData.name}</h1>
              <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider">{farmData.admin_code}</span>
           </div>
           <p className="text-sm md:text-base font-bold text-gray-500 flex items-center gap-1.5">
             <MapIcon /> {farmData.region}
           </p>
        </div>

        {/* الأسعار في الوجه */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 mb-6 md:mb-8 bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100">
           <div className="flex-1">
              <div className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">السعر (أيام عادية)</div>
              <div className="text-lg md:text-2xl font-black text-green-600">{farmData.price_weekday?.toLocaleString()} <span className="text-[10px] md:text-sm">ل.س</span></div>
           </div>
           <div className="w-full md:w-px h-px md:h-auto bg-gray-200"></div>
           <div className="flex-1">
              <div className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">السعر (عطل وأعياد)</div>
              <div className="text-lg md:text-2xl font-black text-purple-600">{farmData.price_weekend?.toLocaleString()} <span className="text-[10px] md:text-sm">ل.س</span></div>
           </div>
        </div>

        {/* شبكة المواصفات 🔴 تتمدد لتصبح 4 أعمدة على الشاشات المتوسطة والكبيرة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-8">
           <div className="bg-white rounded-xl p-3 md:p-5 flex flex-col items-center justify-center text-center border border-gray-100 shadow-sm">
             <BedIcon />
             <span className="text-xs md:text-sm font-bold text-gray-700 mt-2">{farmData.rooms_count} غرف نوم</span>
           </div>
           <div className="bg-white rounded-xl p-3 md:p-5 flex flex-col items-center justify-center text-center border border-gray-100 shadow-sm">
             <AreaIcon />
             <span className="text-xs md:text-sm font-bold text-gray-700 mt-2">{farmData.area_size} متر مربع</span>
           </div>
           <div className="bg-white rounded-xl p-3 md:p-5 flex flex-col items-center justify-center text-center border border-gray-100 shadow-sm">
             <UsersIcon />
             <span className="text-xs md:text-sm font-bold text-gray-700 mt-2">تتسع {farmData.max_capacity} شخص</span>
           </div>
           <div className="bg-blue-50 rounded-xl p-3 md:p-5 flex flex-col items-center justify-center text-center border border-blue-100">
             <span className="text-lg md:text-2xl mb-1">👨‍👩‍👧‍👦</span>
             <span className="text-[10px] md:text-xs font-black text-blue-700 leading-tight">
               {farmData.guest_type === 'families' ? 'عائلات فقط' : 'عائلات وكروبات'}
             </span>
           </div>
        </div>

        {/* الوصف التفصيلي والخريطة (جنب بعض عالشاشات الكبيرة) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
          <div>
             <h3 className="text-lg md:text-xl font-black text-gray-800 mb-3">التفاصيل والمرافق</h3>
             <p className="text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-wrap font-medium bg-gray-50 p-5 rounded-2xl border border-gray-100 h-full">
               {farmData.description}
             </p>
          </div>

          <div>
             <h3 className="text-lg md:text-xl font-black text-gray-800 mb-3">الموقع على الخريطة</h3>
             <div className="w-full h-56 md:h-64 rounded-2xl overflow-hidden shadow-sm border border-gray-200 mb-3 relative">
               <iframe width="100%" height="100%" frameBorder={0} style={{ border: 0 }} src={`https://maps.google.com/maps?q=${encodeURIComponent(farmData.name + ' ' + farmData.region)}&t=&z=13&ie=UTF8&iwloc=&output=embed`} allowFullScreen></iframe>
             </div>
             {farmData.google_maps_url && (
               <a href={farmData.google_maps_url} target="_blank" rel="noreferrer" className="w-full py-3.5 md:py-4 bg-gray-100 text-gray-700 rounded-xl text-sm md:text-base font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                 <MapIcon /> فتح في تطبيق الخرائط الرسمي
               </a>
             )}
          </div>
        </div>
      </div>

      {/* 🔴 الأقسام السفلية: عاللابتوب بتصير مقسومة نصين (التقويم يمين، التقييمات يسار) */}
      <div className="lg:max-w-5xl lg:mx-auto md:mx-6 mx-0 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-8 px-6 md:px-0">
        
        {/* العمود الأيمن: الروزنامة التفاعلية */}
        <div>
          <h3 className="text-lg md:text-xl font-black text-gray-800 mb-4">اختر يوماً للحجز 👇</h3>
          <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <button onClick={prevMonth} className="p-2 md:p-3 bg-gray-50 rounded-full text-gray-600 active:scale-95 hover:bg-gray-100"><ChevronRight /></button>
              <h2 className="text-sm md:text-base font-black text-[#232528]">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <button onClick={nextMonth} className="p-2 md:p-3 bg-gray-50 rounded-full text-gray-600 active:scale-95 hover:bg-gray-100"><ChevronLeft /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center">
              {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
                <div key={day} className="text-[10px] md:text-xs font-bold text-gray-400 py-1">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 md:gap-2 relative">
              {allCells.map((date, index) => {
                if (!date) return <div key={`blank-${index}`} className="h-10 md:h-12"></div>;
                
                const status = getDayStatus(date);
                const today = new Date();
                today.setHours(0,0,0,0);
                const isPast = date < today;
                const isSelected = selectedDateForBooking?.toDateString() === date.toDateString();
                
                let bgColor = "bg-gray-50 hover:bg-gray-100"; 
                let textColor = "text-gray-800"; 
                let border = "border border-gray-100";
                let cursor = "cursor-pointer active:scale-90 transition-transform";

                if (isPast) {
                  bgColor = "bg-transparent"; textColor = "text-gray-300"; border = "border-transparent"; cursor = "cursor-default";
                } else if (status === 'booked' || status === 'hold' || status === 'pending_hold') {
                  bgColor = "bg-red-50 opacity-50"; textColor = "text-red-400 line-through"; border = "border border-red-100"; cursor = "cursor-not-allowed";
                } else if (status === 'holiday') {
                  bgColor = "bg-purple-50 hover:bg-purple-100"; textColor = "text-purple-700"; border = "border border-purple-200";
                }

                if (isSelected) {
                  bgColor = "bg-blue-600";
                  textColor = "text-white";
                  border = "border-blue-700 shadow-md scale-105 z-10";
                }

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => !isPast && handleDayClick(date, status)}
                    className={`h-11 md:h-12 rounded-xl flex items-center justify-center font-bold text-sm md:text-base ${bgColor} ${textColor} ${border} ${cursor}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-5 md:mt-6 pt-4 border-t border-gray-100 flex justify-between px-2">
               <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-gray-600"><span className="w-2.5 h-2.5 rounded-sm bg-gray-100 border border-gray-200"></span> متاح</div>
               <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-purple-700"><span className="w-2.5 h-2.5 rounded-sm bg-purple-100 border border-purple-200"></span> عطلة</div>
               <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-red-400"><span className="w-2.5 h-2.5 rounded-sm bg-red-50 border border-red-100"></span> محجوز</div>
            </div>
          </div>
        </div>

        {/* العمود الأيسر: التقييمات وإضافة تقييم */}
        <div className="space-y-6 md:space-y-8">
          
          {/* قسم التقييمات */}
          <div>
             <h3 className="text-lg md:text-xl font-black text-gray-800 mb-4">آراء الزوار</h3>
             {reviews.length === 0 ? (
               <div className="bg-white p-6 md:p-8 rounded-2xl text-center border border-gray-100 shadow-sm">
                 <div className="text-3xl md:text-4xl mb-3 opacity-50">⭐</div>
                 <div className="text-sm md:text-base font-bold text-gray-500">لا يوجد تقييمات حالياً.</div>
                 <p className="text-[10px] md:text-xs text-gray-400 mt-2">كن أول من يشاركنا تجربته بعد الحجز!</p>
               </div>
             ) : (
               <div className="space-y-3 md:space-y-4 max-h-[300px] overflow-y-auto pr-2">
                 {reviews.map((rev: any, i: number) => (
                   <div key={i} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100">
                     <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-sm md:text-base text-gray-800">{rev.tenant_name || rev.tenantName}</span>
                       <div className="flex gap-0.5">{[...Array(5)].map((_, idx) => <StarIcon key={idx} solid={idx < rev.stars} />)}</div>
                     </div>
                     <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{rev.comment}</p>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* قسم إضافة تقييم جديد */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7CB342] to-[#2AABEE]"></div>
             <h4 className="text-base md:text-lg font-black text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
               <span className="text-xl md:text-2xl">✍️</span> أضف تقييمك للمزرعة
             </h4>
             <form onSubmit={handleReviewSubmit} className="space-y-4 md:space-y-5">
               <div>
                 <label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 md:mb-2 block">الاسم (اختياري)</label>
                 <input type="text" value={reviewForm.tenantName} onChange={e => setReviewForm({...reviewForm, tenantName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm focus:border-[#7CB342] outline-none transition" placeholder="اسمك الكريم" />
               </div>
               <div>
                 <label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 md:mb-2 block">رقم الفاتورة (مطلوب للتحقق)</label>
                 <input type="text" required value={reviewForm.invoiceId} onChange={e => setReviewForm({...reviewForm, invoiceId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm font-bold text-gray-800 focus:border-[#7CB342] outline-none transition" placeholder="مثال: EV-20260412-0001" dir="ltr" />
               </div>
               <div>
                  <label className="text-xs md:text-sm font-bold text-gray-600 mb-2 block">كم نجمة تستحق المزرعة؟</label>
                  <div className="flex gap-2 justify-end bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100" dir="ltr">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button type="button" key={star} onClick={() => setReviewForm({...reviewForm, stars: star})} className="focus:outline-none hover:scale-110 transition-transform active:scale-90">
                        <StarIcon solid={star <= reviewForm.stars} />
                      </button>
                    ))}
                  </div>
               </div>
               <div>
                 <label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 md:mb-2 block">رأيك بالمزرعة</label>
                 <textarea required value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm md:text-base h-24 md:h-32 focus:border-[#7CB342] outline-none transition resize-none leading-relaxed" placeholder="كيف كانت تجربتك؟ نرجو كتابة رأيك بصراحة..."></textarea>
               </div>
               <button type="submit" disabled={isSubmittingReview} className="w-full py-4 md:py-5 mt-2 bg-[#232528] text-white rounded-xl font-black text-sm md:text-base hover:bg-black transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                 {isSubmittingReview ? 'جاري الإرسال...' : 'نشر التقييم'}
               </button>
             </form>
          </div>

        </div>
      </div>

      {/* 6. فقاعة التلغرام */}
      {farmData.telegram_video_url && (
        <a href={farmData.telegram_video_url} target="_blank" rel="noreferrer" className="fixed bottom-[90px] md:bottom-28 right-5 lg:right-10 z-40 bg-[#2AABEE] text-white px-4 py-3 md:px-5 md:py-4 rounded-full font-bold text-sm md:text-base shadow-[0_8px_20px_rgba(42,171,238,0.4)] flex items-center gap-2 hover:scale-105 transition-transform border-2 border-white">
          <TelegramIcon /> فيديو وتفاصيل أكثر
        </a>
      )}

      {/* 7. 🔴 شريط الحجز السفلي: عاللابتوب بصير بنص الشاشة كـ (Floating Dock) فخم */}
      <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl bg-white border-t md:border border-gray-100 px-6 py-4 md:py-5 z-50 flex items-center justify-between pb-safe md:rounded-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:shadow-[0_20px_50px_rgb(0,0,0,0.15)] transition-all">
        {selectedDateForBooking ? (
          <>
            <div>
              <div className="text-[10px] md:text-xs text-gray-500 font-bold mb-0.5 md:mb-1">
                حجز يوم {selectedDateForBooking.toLocaleDateString('ar-SY')}
              </div>
              <div className="text-xl md:text-2xl font-black text-green-600 leading-none">
                {calculatedPrice?.toLocaleString()} <span className="text-[10px] md:text-sm text-gray-400">ل.س</span>
              </div>
            </div>
            <button onClick={handleBookNow} className="px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-black text-white bg-[#7CB342] hover:bg-[#689f38] transition-all shadow-lg active:scale-95 text-sm md:text-base">
              احجز الآن
            </button>
          </>
        ) : (
          <>
            <div>
              <div className="text-[10px] md:text-xs text-gray-500 font-bold mb-0.5 md:mb-1">الأسعار تبدأ من</div>
              <div className="text-lg md:text-2xl font-black text-gray-800 leading-none">
                {farmData.price_weekday?.toLocaleString()} <span className="text-[10px] md:text-sm text-gray-400">ل.س</span>
              </div>
            </div>
            <div className="px-6 md:px-10 py-3.5 md:py-4 rounded-xl font-bold text-gray-400 bg-gray-100 text-sm md:text-base">
              اختر يوماً للحجز
            </div>
          </>
        )}
      </div>

      {/* 8. شاشة تكبير الصور (Fullscreen Modal) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black flex flex-col">
            <div className="flex justify-between items-center p-5 z-20">
              <span className="text-white/70 font-bold text-sm md:text-base">{imgIndex + 1} / {images.length}</span>
              <button onClick={() => setIsFullscreen(false)} className="text-white p-2 md:p-3 bg-white/10 rounded-full hover:bg-white/20 active:scale-95 transition">
                <CloseIconX />
              </button>
            </div>
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
               {images.length > 1 && (
                 <button onClick={prevImg} className="absolute left-4 md:left-8 text-white p-3 md:p-4 bg-black/50 rounded-full z-20 hover:bg-black/80 active:scale-95"><ChevronLeft/></button>
               )}
               <AnimatePresence mode="wait">
                 <motion.img key={imgIndex} src={images[imgIndex]} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="max-w-full max-h-full object-contain" />
               </AnimatePresence>
               {images.length > 1 && (
                 <button onClick={nextImg} className="absolute right-4 md:right-8 text-white p-3 md:p-4 bg-black/50 rounded-full z-20 hover:bg-black/80 active:scale-95"><ChevronRight/></button>
               )}
            </div>
            {images.length > 1 && (
              <div className="p-5 flex gap-3 overflow-x-auto justify-center hide-scrollbar">
                 {images.map((img: string, idx: number) => (
                    <img key={idx} src={img} onClick={() => setImgIndex(idx)} className={`w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl cursor-pointer transition-all duration-300 ${idx === imgIndex ? 'border-2 border-[#7CB342] scale-110 opacity-100' : 'border border-white/20 opacity-50 hover:opacity-80'}`} />
                 ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}