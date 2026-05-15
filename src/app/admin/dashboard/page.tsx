"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../lib/api';

// --- Icons ---
const LogoutIcon = () => <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

const emptyFarmData = {
  adminCode: '', name: '', ownerName: '', ownerPhone: '', ownerPassword: '',
  region: '', googleMapsUrl: '', 
  areaSize: '', roomsCount: '', maxCapacity: '', guestType: 'families',
  description: '', classification: '', telegramVideoUrl: '', contactNumbers: '',
  priceWeekday: '', priceWeekend: '', adminNotes: '', imageUrls: '', lastVerificationDate: ''
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [farmsList, setFarmsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeView, setActiveView] = useState('home'); 

  // --- حالات المزارع (إضافة وتعديل) ---
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);
  const [isSubmittingFarm, setIsSubmittingFarm] = useState(false);
  const [newFarmOwnerCredentials, setNewFarmOwnerCredentials] = useState<any>(null);
  const [farmData, setFarmData] = useState(emptyFarmData);

  // --- حالات التقييمات ---
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedFarmForReviews, setSelectedFarmForReviews] = useState<any>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  
  const emptyReview = { tenant_name: '', stars: 5, comment: '', is_published: true, admin_notes: '' };
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const fetchData = async (token: string) => {
    try {
      const bData = await api.getAdminBookings(token);
      setBookings(bData || []);
    } catch(err: any) {
      console.error("خطأ في جلب الحجوزات:", err.message);
      if (err.statusCode === 401) router.push('/owner/login');
    }
    
    try {
      const fData = await api.getFarms({ startDate: '', endDate: '' } as any); 
      setFarmsList(fData || []);
    } catch(err: any) {
      console.error("خطأ في جلب المزارع:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('eco_villa_token');
    const userDataStr = localStorage.getItem('eco_villa_user');
    if (!token || !userDataStr) return router.push('/owner/login');
    const userData = JSON.parse(userDataStr);
    if (userData.role !== 'super_admin' && userData.role !== 'team_admin') return router.push('/owner/login');
    
    setUser(userData);
    fetchData(token);
  }, [router]);

  const openAddNewFarm = () => {
    setIsEditingFarm(false);
    setEditingFarmId(null);
    setFarmData({ ...emptyFarmData });
    setNewFarmOwnerCredentials(null);
    setShowAddFarmModal(true);
  };

  const handleEditFarmClick = (farm: any) => {
    setIsEditingFarm(true);
    setEditingFarmId(farm.id);
    
    let parsedContacts = '';
    if (Array.isArray(farm.contact_numbers)) parsedContacts = farm.contact_numbers.join(', ');
    else if (Array.isArray(farm.contactNumbers)) parsedContacts = farm.contactNumbers.join(', ');
    else if (typeof farm.contact_numbers === 'string') parsedContacts = farm.contact_numbers;

    let vDate = '';
    const rawDate = farm.last_verification_video_at || farm.lastVerificationDate;
    if (rawDate) { try { vDate = new Date(rawDate).toISOString().split('T')[0]; } catch(e){} }

    setFarmData({
      adminCode: farm.admin_code || farm.adminCode || '',
      name: farm.name || '',
      ownerName: '', ownerPhone: '', ownerPassword: '',
      region: farm.region || '',
      areaSize: farm.area_size?.toString() || farm.areaSize?.toString() || '', 
      priceWeekday: farm.price_weekday?.toString() || farm.priceWeekday?.toString() || '',
      priceWeekend: farm.price_weekend?.toString() || farm.priceWeekend?.toString() || '',
      roomsCount: farm.rooms_count?.toString() || farm.roomsCount?.toString() || '',
      maxCapacity: farm.max_capacity?.toString() || farm.maxCapacity?.toString() || '',
      classification: farm.classification || '',
      guestType: farm.guest_type || farm.guestType || 'families',
      description: farm.description || '',
      contactNumbers: parsedContacts,
      telegramVideoUrl: farm.telegram_video_url || farm.telegramVideoUrl || '',
      googleMapsUrl: farm.google_maps_url || farm.googleMapsUrl || '',
      imageUrls: Array.isArray(farm.media) ? farm.media.map((m:any) => m.url).join(', ') : '',
      adminNotes: farm.admin_notes || farm.adminNotes || '', 
      lastVerificationDate: vDate
    });
    
    setNewFarmOwnerCredentials(null);
    setShowAddFarmModal(true);
  };

  const handleDeleteFarmClick = async (farmId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف/إيقاف هذه المزرعة بشكل نهائي؟')) {
      try {
        const token = localStorage.getItem('eco_villa_token') || '';
        await api.deleteFarmAdmin(farmId, token);
        alert('تم الحذف بنجاح!');
        fetchData(token); 
      } catch (err: any) { alert('حدث خطأ أثناء الحذف: ' + err.message); }
    }
  };

  const handleAddFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFarm(true);
    try {
      const token = localStorage.getItem('eco_villa_token') || '';
      let mediaArray = farmData.imageUrls.split(',').map(u => u.trim()).filter(Boolean);
      if (mediaArray.length === 0) mediaArray = ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"];
      const phonesArray = farmData.contactNumbers.split(',').map(p => p.trim()).filter(Boolean);

      const payload = { 
        adminCode: farmData.adminCode, name: farmData.name, ownerName: farmData.ownerName, ownerPhone: farmData.ownerPhone, ownerPassword: farmData.ownerPassword,
        description: farmData.description, region: farmData.region, areaSize: Number(farmData.areaSize) || 0, roomsCount: Number(farmData.roomsCount) || 0, maxCapacity: Number(farmData.maxCapacity) || 0,
        priceWeekday: Number(farmData.priceWeekday) || 0, priceWeekend: Number(farmData.priceWeekend) || 0, classification: farmData.classification, guestType: farmData.guestType, googleMapsUrl: farmData.googleMapsUrl, media: mediaArray,
        contactNumbers: phonesArray, telegramVideoUrl: farmData.telegramVideoUrl, adminNotes: farmData.adminNotes,
        lastVerificationDate: farmData.lastVerificationDate ? new Date(farmData.lastVerificationDate).toISOString() : null,
        last_verification_video_at: farmData.lastVerificationDate ? new Date(farmData.lastVerificationDate).toISOString() : null,
        admin_notes: farmData.adminNotes
      };

      if (isEditingFarm && editingFarmId) {
        await api.updateFarmAdmin(editingFarmId, payload, token);
        alert('تم تحديث بيانات المزرعة بنجاح!');
        setShowAddFarmModal(false);
      } else {
        await api.createFarmAdmin(payload, token);
        setNewFarmOwnerCredentials({ phone: payload.ownerPhone, password: payload.ownerPassword }); 
      }
      setTimeout(() => { fetchData(token); }, 500);
      if (!isEditingFarm) setFarmData({ ...emptyFarmData });
    } catch (err: any) { alert("خطأ أثناء الحفظ: " + err.message); } finally { setIsSubmittingFarm(false); }
  };

  const fetchReviews = async (farmId: string) => {
    try { setReviewsList(await api.getFarmReviewsAdmin(farmId, localStorage.getItem('eco_villa_token') || '') || []); } 
    catch (err) { console.error('خطأ في جلب التقييمات', err); }
  };

  const handleOpenReviews = (farm: any) => {
    setSelectedFarmForReviews(farm);
    setShowReviewsModal(true);
    setReviewForm(emptyReview);
    setIsEditingReview(false);
    fetchReviews(farm.id);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('eco_villa_token') || '';
      const reviewPayload = {
         tenant_name: reviewForm.tenant_name, tenantName: reviewForm.tenant_name,
         stars: reviewForm.stars, comment: reviewForm.comment,
         is_published: reviewForm.is_published, isPublished: reviewForm.is_published,
         admin_notes: reviewForm.admin_notes, adminNotes: reviewForm.admin_notes
      };

      if (isEditingReview && editingReviewId) {
        await api.updateReviewAdmin(editingReviewId, reviewPayload, token);
        alert('تم تعديل التقييم بنجاح');
      } else {
        await api.createReviewAdmin({ ...reviewPayload, farm_id: selectedFarmForReviews.id, booking_id: "00000000-0000-0000-0000-000000000000" }, token);
        alert('تمت إضافة التقييم بنجاح');
      }
      fetchReviews(selectedFarmForReviews.id); 
      setReviewForm(emptyReview);
      setIsEditingReview(false);
    } catch (err: any) { alert("خطأ: " + err.message); }
  };

  const handleApproveReview = async (review: any) => {
    try {
      const token = localStorage.getItem('eco_villa_token') || '';
      await api.updateReviewAdmin(review.id, { ...review, is_published: true, isPublished: true }, token);
      fetchReviews(selectedFarmForReviews.id);
    } catch (err: any) { alert(err.message); }
  };

  const handleEditReviewClick = (review: any) => {
    setIsEditingReview(true);
    setEditingReviewId(review.id);
    setReviewForm({ 
       tenant_name: review.tenant_name || review.tenantName, 
       stars: review.stars, comment: review.comment || '', 
       is_published: review.is_published !== undefined ? review.is_published : review.isPublished, 
       admin_notes: review.admin_notes || review.adminNotes || '' 
    });
  };

  if (isLoading || !user) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-bold text-gray-500">جاري تجهيز الغرفة...</div>;

  const isSuperAdmin = user.role === 'super_admin';

  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: '🏠' },
    { id: 'bookings', label: 'الرادار', icon: '📡' },
    { id: 'farms', label: 'المزارع', icon: '🏡' },
    ...(isSuperAdmin ? [
      { id: 'partners', label: 'الشركاء', icon: '💼' },
      { id: 'collections', label: 'التحصيل', icon: '🏦' },
      { id: 'team', label: 'الفريق', icon: '👥' }
    ] : [])
  ];

  return (
    // 🔴 إزالة القيود الضيقة ليأخذ الموقع العرض الكامل
    <div dir="rtl" className="w-full min-h-screen bg-[#F8F9FA] relative font-sans overflow-x-hidden flex flex-col">
      <header className="bg-[#1E1E2D] text-white pt-8 md:pt-10 pb-0 shadow-lg relative z-20 shrink-0">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center mb-6 md:mb-8">
          <div><h1 className="text-2xl md:text-4xl font-black text-[#7CB342] leading-none tracking-tight">Eco Villa</h1><span className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1 block">Workspace / {user.role === 'super_admin' ? 'المدير العام' : 'فريق العمل'}</span></div>
          <button onClick={() => { localStorage.removeItem('eco_villa_token'); router.push('/'); }} className="flex items-center gap-1.5 md:gap-2 bg-red-500/10 text-red-400 px-4 py-2 md:px-5 md:py-3 rounded-xl text-xs md:text-sm font-bold hover:bg-red-500 hover:text-white transition active:scale-95"><LogoutIcon /> خروج</button>
        </div>
        <div className="max-w-7xl mx-auto flex overflow-x-auto md:flex-wrap gap-2 md:gap-3 px-4 md:px-10 pb-4 no-scrollbar">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => tab.id === 'bookings' ? router.push('/admin/bookings') : setActiveView(tab.id)} className={`flex items-center gap-2 md:gap-3 whitespace-nowrap px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all shadow-sm ${activeView === tab.id ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              <span className="text-lg md:text-xl">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-10 pb-20 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6 md:mb-8">
           <h2 className="text-xl md:text-3xl font-black text-gray-800">{tabs.find(t => t.id === activeView)?.label} {tabs.find(t => t.id === activeView)?.icon}</h2>
        </div>

        {activeView === 'home' && (
          <div className="space-y-6 md:space-y-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[2rem] shadow-sm border border-gray-100 text-center mb-4"><h3 className="text-xl md:text-3xl font-black text-gray-800 mb-2 md:mb-4">أهلاً بك في غرفة العمليات</h3><p className="text-gray-500 text-sm md:text-base font-medium">اختر القسم الذي تريد إدارته من القائمة أدناه أو من الأعلى</p></motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => router.push('/admin/bookings')} className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition"><div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl md:text-4xl">📡</div><div><h3 className="text-sm md:text-lg font-black text-gray-800">الرادار</h3><p className="text-[10px] md:text-xs text-gray-500 font-bold mt-1">إدارة الحجوزات</p></div></motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveView('farms')} className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition"><div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl md:text-4xl">🏡</div><div><h3 className="text-sm md:text-lg font-black text-gray-800">المزارع</h3><p className="text-[10px] md:text-xs text-gray-500 font-bold mt-1">إضافة وتعديل</p></div></motion.button>
            </div>
          </div>
        )}

        {activeView === 'farms' && (
          <div className="space-y-6">
            <button onClick={openAddNewFarm} className="w-full md:w-auto md:px-10 py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg hover:bg-green-700 transition active:scale-95 flex items-center justify-center gap-2 mb-4 md:text-lg">+ إضافة مزرعة جديدة</button>
            {farmsList.length === 0 ? ( <div className="text-center p-10 md:p-16 text-gray-400 font-bold bg-white rounded-3xl border border-gray-100 text-lg">لا يوجد مزارع مضافة بعد.</div> ) : (
              // 🔴 مزارع الإدارة يتم عرضها في شبكة 2 أعمدة على الشاشات الكبيرة
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {farmsList.map((f, i) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-col ${f.status === 'inactive' ? 'opacity-60 grayscale' : ''}`}>
                    <div className="flex gap-4 md:gap-6 items-center">
                      <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-200 rounded-xl md:rounded-2xl overflow-hidden shrink-0"><img src={f.media?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80"} className="w-full h-full object-cover" /></div>
                      <div className="flex-1">
                         <div className="flex justify-between items-start"><span className="text-xs md:text-sm font-bold text-gray-400 uppercase">{f.admin_code || 'EV_---'}</span><span className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-md ${f.status === 'inactive' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{f.status === 'inactive' ? 'موقوفة' : 'نشط'}</span></div>
                         <h3 className="font-bold text-gray-800 md:text-xl mt-1 leading-tight">{f.name}</h3><p className="text-xs md:text-sm font-black text-gray-800 mt-1 md:mt-2">{f.price_weekday?.toLocaleString()} ل.س</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-50">
                       <button onClick={() => handleEditFarmClick(f)} className="py-2.5 md:py-3 bg-blue-50 text-blue-600 rounded-xl text-xs md:text-sm font-bold active:scale-95 transition hover:bg-blue-100">✏️ تعديل</button>
                       <button onClick={() => handleOpenReviews(f)} className="py-2.5 md:py-3 bg-yellow-50 text-yellow-700 rounded-xl text-xs md:text-sm font-bold active:scale-95 transition hover:bg-yellow-100">⭐️ التقييمات</button>
                       <button onClick={() => handleDeleteFarmClick(f.id)} className="py-2.5 md:py-3 bg-red-50 text-red-600 rounded-xl text-xs md:text-sm font-bold active:scale-95 transition hover:bg-red-100">🗑️ إيقاف</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView !== 'farms' && activeView !== 'home' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 md:p-20 text-center mt-4">
            <div className="text-5xl md:text-6xl mb-4 md:mb-6 opacity-30 animate-pulse">🚧</div><h3 className="text-xl md:text-3xl font-black text-gray-800 mb-2 md:mb-4">قيد التطوير</h3><p className="text-gray-500 font-medium text-sm md:text-lg">سيتم برمجة هذا القسم قريباً.</p>
          </motion.div>
        )}
      </main>

      {/* 🔴 مودال إدارة التقييمات: متمركز في المنتصف على الشاشات الكبيرة */}
      <AnimatePresence>
        {showReviewsModal && selectedFarmForReviews && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none pb-safe md:pb-0 px-0 md:px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setShowReviewsModal(false)} />
            
            <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} className="w-full md:max-w-2xl lg:max-w-3xl bg-gray-50 rounded-t-3xl md:rounded-3xl shadow-2xl relative z-10 flex flex-col pointer-events-auto h-[90vh] md:max-h-[85vh]">
              <div className="bg-white p-5 md:p-6 border-b border-gray-200 flex justify-between items-center shrink-0 md:rounded-t-3xl">
                 <div><h3 className="text-lg md:text-xl font-black text-gray-800">إدارة التقييمات</h3><p className="text-xs md:text-sm text-gray-500 mt-1">{selectedFarmForReviews.name}</p></div>
                 <button onClick={() => setShowReviewsModal(false)} className="text-gray-500 bg-gray-100 p-2 md:p-3 rounded-full active:scale-95 hover:bg-gray-200"><CloseIcon /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
                
                <div className={`p-5 md:p-6 rounded-2xl shadow-sm border ${isEditingReview ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm md:text-base font-bold text-gray-800">{isEditingReview ? '✏️ تعديل التقييم' : '➕ إضافة تقييم يدوي'}</h4>
                    {isEditingReview && <button type="button" onClick={() => { setIsEditingReview(false); setReviewForm(emptyReview); }} className="text-xs md:text-sm text-gray-500 underline">إلغاء التعديل</button>}
                  </div>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <input required value={reviewForm.tenant_name} onChange={e=>setReviewForm({...reviewForm, tenant_name: e.target.value})} type="text" placeholder="اسم الزبون" className="w-full bg-white border border-gray-200 rounded-xl p-3 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none focus:border-blue-500" />
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                      <input required value={reviewForm.stars} onChange={e=>setReviewForm({...reviewForm, stars: Number(e.target.value)})} type="number" min="1" max="5" placeholder="النجوم" className="w-full md:w-1/3 bg-white border border-gray-200 rounded-xl p-3 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none focus:border-blue-500" />
                      <input required value={reviewForm.comment} onChange={e=>setReviewForm({...reviewForm, comment: e.target.value})} type="text" placeholder="التعليق المكتوب..." className="w-full md:w-2/3 bg-white border border-gray-200 rounded-xl p-3 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none focus:border-blue-500" />
                    </div>
                    <label className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-600"><input type="checkbox" checked={reviewForm.is_published} onChange={e=>setReviewForm({...reviewForm, is_published: e.target.checked})} className="w-4 h-4 md:w-5 md:h-5" /> نشر التقييم مباشرة في الموقع</label>
                    <button type="submit" className={`w-full py-3 md:py-4 text-white rounded-xl font-bold text-sm md:text-base ${isEditingReview ? 'bg-blue-600' : 'bg-[#232528] hover:bg-black'}`}>{isEditingReview ? 'حفظ التعديلات 💾' : 'حفظ التقييم'}</button>
                  </form>
                </div>

                <div>
                  <h4 className="text-sm md:text-base font-bold text-gray-800 mb-3 md:mb-4 px-1">التقييمات المسجلة ({reviewsList.length})</h4>
                  {reviewsList.length === 0 ? ( <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 text-gray-400 text-sm md:text-base font-bold">لا يوجد تقييمات.</div>) : (
                    reviewsList.map(r => (
                      <div key={r.id} className={`p-4 md:p-5 rounded-2xl shadow-sm border mb-3 md:mb-4 relative ${r.is_published ? 'bg-white border-gray-200' : 'bg-orange-50 border-orange-200'}`}>
                        <div className="flex justify-between items-start mb-2 md:mb-3">
                          <div>
                            <div className="font-bold text-gray-800 text-sm md:text-base flex items-center gap-2">
                              {r.tenant_name} 
                              {!r.is_published && <span className="bg-orange-100 text-orange-700 text-[9px] md:text-[10px] px-2 py-0.5 rounded-full">بانتظار الموافقة</span>}
                            </div>
                            <div className="text-yellow-500 font-bold text-xs md:text-sm mt-1">{"⭐️".repeat(r.stars)}</div>
                          </div>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 mb-4 leading-relaxed">{r.comment}</p>
                        
                        <div className="flex justify-between items-center border-t border-gray-100 pt-3 md:pt-4">
                          {!r.is_published ? (
                            <button onClick={() => handleApproveReview(r)} className="bg-green-100 text-green-700 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-green-200 active:scale-95 transition">✅ موافقة ونشر</button>
                          ) : ( <span className="text-[10px] md:text-xs text-gray-400 font-mono bg-gray-50 px-2 md:px-3 py-1 rounded">كود: {r.loyalty_code}</span> )}
                          
                          <div className="flex gap-3 md:gap-4">
                            <button onClick={() => handleEditReviewClick(r)} className="text-blue-600 text-xs md:text-sm font-bold hover:underline">تعديل</button>
                            <button onClick={async () => { if(window.confirm('هل تريد حذف التقييم؟')) { try { await api.deleteReviewAdmin(r.id, localStorage.getItem('eco_villa_token') || ''); fetchReviews(selectedFarmForReviews.id); } catch (e:any) { alert(e.message); } } }} className="text-red-500 text-xs md:text-sm font-bold hover:underline">حذف</button>
                          </div>
                        </div>
                      </div>
                    )))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔴 مودال إدارة المزارع: متمركز في المنتصف على الشاشات الكبيرة */}
      <AnimatePresence>
        {showAddFarmModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none pb-safe md:pb-0 px-0 md:px-4 lg:px-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setShowAddFarmModal(false)} />
            
            <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="w-full md:max-w-3xl lg:max-w-5xl bg-[#F8F9FA] rounded-t-3xl md:rounded-3xl shadow-2xl relative z-10 flex flex-col pointer-events-auto h-[95vh] md:max-h-[90vh]">
              <div className="bg-white p-5 md:p-6 border-b border-gray-200 flex justify-between items-center shrink-0 md:rounded-t-3xl">
                 <div><h3 className="text-lg md:text-xl font-black text-gray-800">{isEditingFarm ? 'تعديل بيانات المزرعة' : 'إضافة مزرعة جديدة'}</h3></div>
                 <div className="flex items-center gap-3">
                   {isEditingFarm && editingFarmId && ( <button onClick={() => router.push(`/owner/calendar/${editingFarmId}`)} className="bg-blue-50 text-blue-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold active:scale-95 hover:bg-blue-100 transition">📅 الروزنامة</button> )} 
                   <button onClick={() => setShowAddFarmModal(false)} className="text-gray-500 bg-gray-100 p-2 md:p-3 rounded-full active:scale-95 hover:bg-gray-200"><CloseIcon /></button> 
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 md:p-8 pb-24 md:pb-8">
                {newFarmOwnerCredentials ? (
                  <div className="text-center p-6 md:p-10 bg-green-50 rounded-3xl border border-green-100 mt-4 md:mt-10 max-w-2xl mx-auto"><span className="text-5xl md:text-6xl mb-4 block">✅</span><h4 className="font-black text-green-800 text-xl md:text-2xl mb-2">تم إنشاء المزرعة بنجاح!</h4><p className="text-gray-600 text-sm md:text-base mb-6">انسخ البيانات وأرسلها للمالك فوراً:</p><div className="bg-white p-5 md:p-8 rounded-2xl text-left border border-green-200 shadow-sm"><div className="text-xs md:text-sm text-gray-500 font-bold mb-1">رقم الدخول:</div><div className="font-black text-lg md:text-xl text-gray-800 mb-4" dir="ltr">{newFarmOwnerCredentials.phone}</div><div className="text-xs md:text-sm text-gray-500 font-bold mb-1">كلمة المرور:</div><div className="font-black text-xl md:text-2xl text-blue-600 tracking-widest" dir="ltr">{newFarmOwnerCredentials.password}</div></div><button onClick={() => setShowAddFarmModal(false)} className="mt-6 w-full py-4 md:py-5 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700">العودة للوحة</button></div>
                ) : (
                  <form onSubmit={handleAddFarm} className="space-y-6 md:space-y-8">
                    
                    {/* فورم مقسم لعمودين على الشاشات الكبيرة */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                      {/* العمود الأيمن */}
                      <div className="space-y-6 md:space-y-8">
                        {!isEditingFarm && (
                          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"><h4 className="text-sm md:text-base font-black text-blue-800 mb-2 flex items-center gap-2"><span className="text-lg md:text-xl">🧑‍🌾</span> بيانات المالك</h4><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">اسم المالك الرباعي</label><input required value={farmData.ownerName} onChange={e=>setFarmData({...farmData, ownerName: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 focus:border-blue-500 outline-none" placeholder="مثال: محمد الفارس" /></div><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">رقم الموبايل (حساب الدخول)</label><input required value={farmData.ownerPhone} onChange={e=>setFarmData({...farmData, ownerPhone: e.target.value})} type="text" dir="ltr" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 focus:border-blue-500 outline-none" placeholder="09xxxxxxx" /></div><div><label className="text-xs md:text-sm font-bold text-red-600 mb-1.5 block">كلمة المرور للمالك</label><input required value={farmData.ownerPassword} onChange={e=>setFarmData({...farmData, ownerPassword: e.target.value})} type="text" dir="ltr" className="w-full bg-red-50 border border-red-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 focus:border-red-500 outline-none" placeholder="مثال: pass1234" /></div></div>
                        )}
                        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"><h4 className="text-sm md:text-base font-black text-gray-800 mb-2 flex items-center gap-2"><span className="text-lg md:text-xl">🏡</span> معلومات المزرعة</h4><div className="grid grid-cols-2 gap-4"><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">كود الإدارة (ID)</label><input required value={farmData.adminCode} onChange={e=>setFarmData({...farmData, adminCode: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-blue-600 outline-none" placeholder="EV_151" /></div><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">الاسم التجاري</label><input required value={farmData.name} onChange={e=>setFarmData({...farmData, name: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none" placeholder="مزرعة السعادة" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">المساحة (م²)</label><input required value={farmData.areaSize} onChange={e=>setFarmData({...farmData, areaSize: e.target.value})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none" placeholder="2000" /></div><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">عدد الغرف</label><input required value={farmData.roomsCount} onChange={e=>setFarmData({...farmData, roomsCount: e.target.value})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none" placeholder="3" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">الاستيعاب</label><input required value={farmData.maxCapacity} onChange={e=>setFarmData({...farmData, maxCapacity: e.target.value})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none" placeholder="15" /></div><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">نوع الضيوف</label><select value={farmData.guestType} onChange={e=>setFarmData({...farmData, guestType: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none"><option value="families">عائلات فقط</option><option value="mixed">عائلات وشباب</option></select></div></div><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">الوصف بدقة</label><textarea required={!isEditingFarm} value={farmData.description} onChange={e=>setFarmData({...farmData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm md:text-base font-bold text-gray-900 h-28 md:h-32 outline-none" placeholder="اكتب المواصفات بدقة هنا..."></textarea></div></div>
                      </div>

                      {/* العمود الأيسر */}
                      <div className="space-y-6 md:space-y-8">
                        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"><h4 className="text-sm md:text-base font-black text-gray-800 mb-2 flex items-center gap-2"><span className="text-lg md:text-xl">💰</span> الموقع والتسعير</h4><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">المنطقة الجغرافية</label><input required value={farmData.region} onChange={e=>setFarmData({...farmData, region: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none" placeholder="يعفور" /></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">سعر (عادي)</label><input required value={farmData.priceWeekday} onChange={e=>setFarmData({...farmData, priceWeekday: e.target.value})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none" placeholder="500000" /></div><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">سعر (عطلة)</label><input required value={farmData.priceWeekend} onChange={e=>setFarmData({...farmData, priceWeekend: e.target.value})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-orange-600 outline-none" placeholder="750000" /></div></div><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">التصنيف الاختياري</label><select value={farmData.classification} onChange={e=>setFarmData({...farmData, classification: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-purple-700 outline-none"><option value="">بدون تصنيف</option><option value="الأكثر تفضيلاً 🌟">الأكثر تفضيلاً 🌟</option><option value="عروض اللحظة ⏳">عروض اللحظة ⏳</option></select></div><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">رابط الخرائط</label><input value={farmData.googleMapsUrl} onChange={e=>setFarmData({...farmData, googleMapsUrl: e.target.value})} type="url" dir="ltr" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none" placeholder="http://googleusercontent.com/maps..." /></div></div>
                        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"><h4 className="text-sm md:text-base font-black text-gray-800 mb-2 flex items-center gap-2"><span className="text-lg md:text-xl">🔗</span> الوسائط والاتصال</h4><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">روابط الصور (مفصولة بفاصلة ,)</label><textarea value={farmData.imageUrls} onChange={e=>setFarmData({...farmData, imageUrls: e.target.value})} dir="ltr" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs md:text-sm font-bold text-gray-900 h-24 md:h-28 font-mono leading-relaxed outline-none" placeholder="http://image1.jpg, http://image2.jpg..."></textarea></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">رابط التلغرام</label><input value={farmData.telegramVideoUrl} onChange={e=>setFarmData({...farmData, telegramVideoUrl: e.target.value})} type="url" dir="ltr" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none" placeholder="https://t.me/..." /></div><div><label className="text-xs md:text-sm font-bold text-gray-600 mb-1.5 block">أرقام التواصل</label><input required={!isEditingFarm} value={farmData.contactNumbers} onChange={e=>setFarmData({...farmData, contactNumbers: e.target.value})} type="text" dir="ltr" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none" placeholder="09xxxx, 09yyyy" /></div></div></div>
                        <div className="bg-orange-50 p-5 md:p-6 rounded-2xl border border-orange-100 flex flex-col gap-4"><h4 className="text-sm md:text-base font-black text-orange-800 mb-2 flex items-center gap-2"><span className="text-lg md:text-xl">🕵️‍♂️</span> قسم الإدارة السري</h4><div><label className="text-xs md:text-sm font-bold text-orange-600 block mb-1.5">تاريخ آخر فيديو تحقق</label><input type="date" required={!isEditingFarm} value={farmData.lastVerificationDate} onChange={e=>setFarmData({...farmData, lastVerificationDate: e.target.value})} className="w-full bg-white border border-orange-200 rounded-xl p-3.5 md:p-4 text-sm md:text-base font-bold text-gray-900 outline-none" /></div><div><label className="text-xs md:text-sm font-bold text-orange-600 block mb-1.5">ملاحظات سرية للفريق</label><textarea value={farmData.adminNotes} onChange={e=>setFarmData({...farmData, adminNotes: e.target.value})} className="w-full bg-white border border-orange-200 rounded-xl p-4 text-sm md:text-base font-bold text-gray-900 h-24 outline-none" placeholder="مثال: المالك يتأخر بالرد..."></textarea></div></div>
                      </div>
                    </div>
                    
                    {/* زر الحفظ في الأسفل يظهر على اللابتوب كجزء من الفورم، وعالموبايل كشريط عائم */}
                    <div className="pt-6 hidden md:block">
                      <button type="submit" disabled={isSubmittingFarm} className={`w-full py-4 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition disabled:opacity-50 ${isEditingFarm ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#232528] hover:bg-black'}`}>
                        {isSubmittingFarm ? 'جاري الحفظ...' : (isEditingFarm ? 'حفظ التعديلات 💾' : 'حفظ ونشر المزرعة 🚀')}
                      </button>
                    </div>

                  </form>
                )}
              </div>

              {/* شريط الحفظ يظهر فقط على الموبايل لتجربة مستخدم أفضل */}
              {!newFarmOwnerCredentials && (
                <div className="bg-white p-4 border-t border-gray-200 shrink-0 md:hidden pb-safe">
                  <button onClick={handleAddFarm} disabled={isSubmittingFarm} className={`w-full py-4 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition disabled:opacity-50 ${isEditingFarm ? 'bg-blue-600' : 'bg-[#232528]'}`}>
                    {isSubmittingFarm ? 'جاري الحفظ...' : (isEditingFarm ? 'حفظ التعديلات 💾' : 'حفظ ونشر المزرعة 🚀')}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}