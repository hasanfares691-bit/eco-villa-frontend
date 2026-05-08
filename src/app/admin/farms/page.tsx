"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../lib/api';

const CloseIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const BackIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>; 

const emptyFarmData = {
  adminCode: '', name: '', ownerName: '', ownerPhone: '', ownerPassword: '',
  region: '', googleMapsUrl: '', areaSize: '', roomsCount: '', maxCapacity: '', guestType: 'families',
  description: '', classification: '', telegramVideoUrl: '', contactNumbers: '',
  priceWeekday: '', priceWeekend: '', adminNotes: '', imageUrls: '', lastVerificationDate: ''
};

export default function AdminFarmsManagement() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [farmsList, setFarmsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States - Farms
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);
  const [isSubmittingFarm, setIsSubmittingFarm] = useState(false);
  const [newFarmOwnerCredentials, setNewFarmOwnerCredentials] = useState<any>(null);
  const [farmData, setFarmData] = useState(emptyFarmData);

  // Modal States - Reviews
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedFarmForReviews, setSelectedFarmForReviews] = useState<any>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  
  // Review Form States
  const emptyReview = { tenant_name: '', stars: 5, comment: '', is_published: true, admin_notes: '' };
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const fetchFarms = async () => {
    try {
      const fData = await api.getFarms({ startDate: '', endDate: '' } as any); 
      setFarmsList(fData || []);
    } catch(err) { console.error(err); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    const token = localStorage.getItem('eco_villa_token');
    const userDataStr = localStorage.getItem('eco_villa_user');
    if (!token || !userDataStr) return router.push('/owner/login');
    setUser(JSON.parse(userDataStr));
    fetchFarms();
  }, [router]);

  // دالة المزارع اللي ثبتناها (مضادة للمسح)
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

    setShowAddFarmModal(true);
    setNewFarmOwnerCredentials(null);
  };

  const handleToggleFarmStatus = async (farmId: string, currentStatus: string) => {
    const token = localStorage.getItem('eco_villa_token') || '';
    if (window.confirm(`هل أنت متأكد أنك تريد ${currentStatus === 'active' ? 'إيقاف' : 'تنشيط'} المزرعة؟`)) {
      try {
        if (currentStatus === 'active') await api.deleteFarmAdmin(farmId, token);
        else await api.reactivateFarmAdmin(farmId, token);
        fetchFarms();
      } catch (err: any) { alert('خطأ: ' + err.message); }
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
        lastVerificationDate: farmData.lastVerificationDate ? new Date(farmData.lastVerificationDate).toISOString() : null
      };

      if (isEditingFarm && editingFarmId) {
        await api.updateFarmAdmin(editingFarmId, payload, token);
        alert('تم تحديث بيانات المزرعة بنجاح!');
        setShowAddFarmModal(false);
      } else {
        await api.createFarmAdmin(payload, token);
        setNewFarmOwnerCredentials({ phone: payload.ownerPhone, password: payload.ownerPassword }); 
      }
      setTimeout(() => { fetchFarms(); }, 500);
      if (!isEditingFarm) setFarmData({ ...emptyFarmData });
    } catch (err: any) { alert("خطأ أثناء الحفظ: " + err.message); } finally { setIsSubmittingFarm(false); }
  };

  // --- دوال التقييمات ---
  const fetchReviews = async (farmId: string) => {
    try { setReviewsList(await api.getFarmReviewsAdmin(farmId, localStorage.getItem('eco_villa_token') || '') || []); } 
    catch (err) { alert('خطأ في جلب التقييمات.'); }
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
      // تنظيف البيانات لضمان توافقها 100% مع قاعدة البيانات
      const reviewPayload = {
         tenant_name: reviewForm.tenant_name,
         stars: Number(reviewForm.stars),
         comment: reviewForm.comment,
         is_published: Boolean(reviewForm.is_published),
         admin_notes: reviewForm.admin_notes || ''
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
      
      // نرسل كل البيانات الأساسية للتقييم كما يتوقعها الباك إند، مع تغيير حالة النشر فقط
      const payload = {
         tenant_name: review.tenant_name,
         stars: Number(review.stars),
         comment: review.comment,
         is_published: true,
         admin_notes: review.admin_notes || ''
      };

      await api.updateReviewAdmin(review.id, payload, token);
      fetchReviews(selectedFarmForReviews.id);
    } catch (err: any) { 
      alert(err.message); 
    }
  };

  const handleEditReviewClick = (review: any) => {
    setIsEditingReview(true);
    setEditingReviewId(review.id);
    setReviewForm({ 
       tenant_name: review.tenant_name || review.tenantName, 
       stars: review.stars, 
       comment: review.comment || '', 
       is_published: review.is_published !== undefined ? review.is_published : review.isPublished, 
       admin_notes: review.admin_notes || review.adminNotes || '' 
    });
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">جاري التحميل...</div>;

  return (
    <div dir="rtl" className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col font-sans pb-20 shadow-2xl border-x border-gray-200">
      <header className="bg-white p-6 shadow-sm flex items-center gap-4 sticky top-0 z-20">
        <button onClick={() => router.push('/admin/dashboard')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95"><BackIcon /></button>
        <div><h1 className="text-xl font-black text-gray-800">إدارة المزارع المركزية</h1><p className="text-xs text-gray-500 mt-1">تصفح، تعديل، وإضافة مزارع للمنصة</p></div>
      </header>

      <main className="flex-1 p-5">
        <button onClick={() => { setIsEditingFarm(false); setFarmData(emptyFarmData); setNewFarmOwnerCredentials(null); setShowAddFarmModal(true); }} className="w-full py-4 mb-6 bg-[#7CB342] text-white rounded-2xl font-black text-lg shadow-lg hover:bg-[#689f38] transition active:scale-95 flex items-center justify-center gap-2">
          + إضافة مزرعة جديدة
        </button>

        <div className="space-y-4">
          {farmsList.length === 0 ? ( <div className="text-center p-10 bg-white rounded-2xl border border-gray-100 text-gray-400 font-bold">لا يوجد مزارع مضافة بعد.</div> ) : (
            farmsList.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`bg-white p-5 rounded-2xl shadow-sm border ${f.status === 'inactive' ? 'border-red-200 opacity-60 grayscale' : 'border-gray-100'}`}>
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden shrink-0"><img src={f.media?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80"} className="w-full h-full object-cover" /></div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start"><span className="text-xs font-bold text-gray-400 uppercase">{f.admin_code || 'EV_---'}</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${f.status === 'inactive' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{f.status === 'inactive' ? 'موقوفة' : 'نشطة'}</span></div>
                     <h3 className="font-bold text-gray-800 mt-1 leading-tight">{f.name}</h3><p className="text-xs font-black text-[#FF7E5F] mt-1">{f.price_weekday?.toLocaleString()} ل.س</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-50">
                   <button onClick={() => handleEditFarmClick(f)} className="py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold active:scale-95 transition">✏️ تعديل</button>
                   <button onClick={() => handleOpenReviews(f)} className="py-2.5 bg-yellow-50 text-yellow-700 rounded-xl text-xs font-bold active:scale-95 transition">⭐️ التقييمات</button>
                   <button onClick={() => handleToggleFarmStatus(f.id, f.status)} className={`py-2.5 rounded-xl text-xs font-bold active:scale-95 transition ${f.status === 'inactive' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{f.status === 'inactive' ? '✅ تنشيط' : '🚫 إيقاف'}</button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* مودال التقييمات الشامل */}
      <AnimatePresence>
        {showReviewsModal && selectedFarmForReviews && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} className="absolute top-10 bottom-0 left-0 right-0 bg-gray-50 rounded-t-3xl shadow-2xl z-50 overflow-hidden flex flex-col">
              <div className="bg-white p-5 border-b border-gray-200 flex justify-between items-center shrink-0">
                 <div><h3 className="text-lg font-black text-gray-800">إدارة التقييمات</h3><p className="text-xs text-gray-500 mt-1">{selectedFarmForReviews.name}</p></div>
                 <button onClick={() => setShowReviewsModal(false)} className="text-gray-500 bg-gray-100 p-2 rounded-full active:scale-95"><CloseIcon /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                <div className={`p-5 rounded-2xl shadow-sm border ${isEditingReview ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-gray-800">{isEditingReview ? '✏️ تعديل التقييم' : '➕ إضافة تقييم'}</h4>
                    {isEditingReview && <button type="button" onClick={() => { setIsEditingReview(false); setReviewForm(emptyReview); }} className="text-xs text-gray-500 underline">إلغاء التعديل</button>}
                  </div>
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <input required value={reviewForm.tenant_name} onChange={e=>setReviewForm({...reviewForm, tenant_name: e.target.value})} type="text" placeholder="اسم الزبون" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 outline-none" />
                    <div className="flex gap-3">
                      <input required value={reviewForm.stars} onChange={e=>setReviewForm({...reviewForm, stars: Number(e.target.value)})} type="number" min="1" max="5" placeholder="النجوم" className="w-1/3 bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 outline-none" />
                      <input required value={reviewForm.comment} onChange={e=>setReviewForm({...reviewForm, comment: e.target.value})} type="text" placeholder="التعليق المكتوب..." className="w-2/3 bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 outline-none" />
                    </div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600"><input type="checkbox" checked={reviewForm.is_published} onChange={e=>setReviewForm({...reviewForm, is_published: e.target.checked})} className="w-4 h-4" /> نشر التقييم مباشرة في الموقع</label>
                    <button type="submit" className={`w-full py-3 text-white rounded-xl font-bold text-sm ${isEditingReview ? 'bg-blue-600' : 'bg-[#232528]'}`}>{isEditingReview ? 'حفظ التعديلات 💾' : 'حفظ التقييم'}</button>
                  </form>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-3 px-1">التقييمات المسجلة ({reviewsList.length})</h4>
                  {reviewsList.length === 0 ? ( <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 text-gray-400 text-sm font-bold">لا يوجد تقييمات.</div>) : (
                    reviewsList.map(r => (
                      <div key={r.id} className={`p-4 rounded-2xl shadow-sm border mb-3 relative ${r.is_published ? 'bg-white border-gray-200' : 'bg-orange-50 border-orange-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                              {r.tenant_name} 
                              {!r.is_published && <span className="bg-orange-100 text-orange-700 text-[9px] px-2 py-0.5 rounded-full">بانتظار الموافقة</span>}
                            </div>
                            <div className="text-yellow-500 font-bold text-xs mt-1">{"⭐️".repeat(r.stars)}</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-4">{r.comment}</p>
                        
                        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                          {!r.is_published ? (
                            <button onClick={() => handleApproveReview(r)} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200 active:scale-95 transition">✅ موافقة ونشر</button>
                          ) : ( <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">كود: {r.loyalty_code}</span> )}
                          
                          <div className="flex gap-3">
                            <button onClick={() => handleEditReviewClick(r)} className="text-blue-600 text-xs font-bold hover:underline">تعديل</button>
                            <button onClick={async () => { if(window.confirm('هل تريد حذف التقييم؟')) { try { await api.deleteReviewAdmin(r.id, localStorage.getItem('eco_villa_token') || ''); fetchReviews(selectedFarmForReviews.id); } catch (e:any) { alert(e.message); } } }} className="text-red-500 text-xs font-bold hover:underline">حذف</button>
                          </div>
                        </div>
                      </div>
                    )))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddFarmModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="absolute top-10 bottom-0 left-0 right-0 bg-[#F8F9FA] rounded-t-3xl shadow-2xl z-50 overflow-hidden flex flex-col">
              <div className="bg-white p-5 border-b border-gray-200 flex justify-between items-center shrink-0">
                 <div><h3 className="text-lg font-black text-gray-800">{isEditingFarm ? 'تعديل بيانات المزرعة' : 'إضافة مزرعة جديدة'}</h3></div>
                 <div className="flex items-center gap-3">{isEditingFarm && editingFarmId && ( <button onClick={() => router.push(`/owner/calendar/${editingFarmId}`)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95">📅 الروزنامة</button> )} <button onClick={() => setShowAddFarmModal(false)} className="text-gray-500 bg-gray-100 p-2 rounded-full active:scale-95"><CloseIcon /></button> </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 pb-24">
                {newFarmOwnerCredentials ? (
                  <div className="text-center p-6 bg-green-50 rounded-3xl border border-green-100 mt-4"><span className="text-5xl mb-4 block">✅</span><h4 className="font-black text-green-800 text-xl mb-2">تم إنشاء المزرعة بنجاح!</h4><p className="text-gray-600 text-sm mb-6">انسخ البيانات وأرسلها للمالك فوراً:</p><div className="bg-white p-5 rounded-2xl text-left border border-green-200 shadow-sm"><div className="text-xs text-gray-500 font-bold mb-1">رقم الدخول:</div><div className="font-black text-lg text-gray-800 mb-4" dir="ltr">{newFarmOwnerCredentials.phone}</div><div className="text-xs text-gray-500 font-bold mb-1">كلمة المرور:</div><div className="font-black text-xl text-blue-600 tracking-widest" dir="ltr">{newFarmOwnerCredentials.password}</div></div><button onClick={() => setShowAddFarmModal(false)} className="mt-6 w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">العودة للوحة</button></div>
                ) : (
                  <form onSubmit={handleAddFarm} className="space-y-6">
                    {!isEditingFarm && (
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"><h4 className="text-sm font-black text-blue-800 mb-2 flex items-center gap-2"><span className="text-lg">🧑‍🌾</span> بيانات المالك</h4><div><label className="text-xs font-bold text-gray-600 mb-1 block">اسم المالك</label><input required value={farmData.ownerName} onChange={e=>setFarmData({...farmData, ownerName: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900 focus:border-blue-500" /></div><div><label className="text-xs font-bold text-gray-600 mb-1 block">رقم الدخول</label><input required value={farmData.ownerPhone} onChange={e=>setFarmData({...farmData, ownerPhone: e.target.value})} type="text" dir="ltr" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900 focus:border-blue-500" /></div><div><label className="text-xs font-bold text-red-600 mb-1 block">كلمة المرور</label><input required value={farmData.ownerPassword} onChange={e=>setFarmData({...farmData, ownerPassword: e.target.value})} type="text" dir="ltr" className="w-full bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm font-bold text-gray-900 focus:border-red-500" /></div></div>
                    )}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"><h4 className="text-sm font-black text-gray-800 mb-2 flex items-center gap-2"><span className="text-lg">🏡</span> معلومات المزرعة</h4><div><label className="text-xs font-bold text-gray-600 mb-1 block">كود الإدارة</label><input required value={farmData.adminCode} onChange={e=>setFarmData({...farmData, adminCode: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-blue-600" /></div><div><label className="text-xs font-bold text-gray-600 mb-1 block">الاسم</label><input required value={farmData.name} onChange={e=>setFarmData({...farmData, name: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900" /></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-gray-600 mb-1 block">المساحة</label><input required value={farmData.areaSize} onChange={e=>setFarmData({...farmData, areaSize: e.target.value})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900" /></div><div><label className="text-xs font-bold text-gray-600 mb-1 block">عدد الغرف</label><input required value={farmData.roomsCount} onChange={e=>setFarmData({...farmData, roomsCount: e.target.value})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900" /></div></div><div className="bg-gray-50 p-4 rounded-xl border border-gray-100"><label className="text-xs font-bold text-gray-600 mb-2 block">نوع الضيوف المسموح بهم</label><div className="flex gap-3"><button type="button" onClick={() => setFarmData({...farmData, guestType: 'families'})} className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${farmData.guestType === 'families' ? 'bg-[#7CB342] text-white border-[#7CB342] shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}>👨‍👩‍👧‍👦 عائلات فقط</button><button type="button" onClick={() => setFarmData({...farmData, guestType: 'mixed'})} className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${farmData.guestType === 'mixed' ? 'bg-[#7CB342] text-white border-[#7CB342] shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}>🎉 عائلات وكروبات</button></div></div><div><label className="text-xs font-bold text-gray-600 mb-1 block">الاستيعاب الأقصى للأشخاص</label><input required value={farmData.maxCapacity} onChange={e=>setFarmData({...farmData, maxCapacity: e.target.value})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900" /></div><div><label className="text-xs font-bold text-gray-600 mb-1 block">الوصف والتفاصيل</label><textarea required={!isEditingFarm} value={farmData.description} onChange={e=>setFarmData({...farmData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-bold text-gray-900 h-28"></textarea></div></div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"><h4 className="text-sm font-black text-gray-800 mb-2 flex items-center gap-2"><span className="text-lg">💰</span> الموقع والتسعير</h4><div><label className="text-xs font-bold text-gray-600 mb-1 block">المنطقة</label><input required value={farmData.region} onChange={e=>setFarmData({...farmData, region: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900" /></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-gray-600 mb-1 block">سعر (عادي)</label><input required value={farmData.priceWeekday} onChange={e=>setFarmData({...farmData, priceWeekday: e.target.value})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900" /></div><div><label className="text-xs font-bold text-gray-600 mb-1 block">سعر (عطلة)</label><input required value={farmData.priceWeekend} onChange={e=>setFarmData({...farmData, priceWeekend: e.target.value})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-orange-600" /></div></div><div><label className="text-xs font-bold text-gray-600 mb-1 block">التصنيف الاختياري</label><select value={farmData.classification} onChange={e=>setFarmData({...farmData, classification: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-purple-700"><option value="">بدون تصنيف</option><option value="الأكثر تفضيلاً 🌟">الأكثر تفضيلاً 🌟</option><option value="عروض اللحظة ⏳">عروض اللحظة ⏳</option></select></div><div><label className="text-xs font-bold text-gray-600 mb-1 block">رابط خرائط غوغل</label><input value={farmData.googleMapsUrl} onChange={e=>setFarmData({...farmData, googleMapsUrl: e.target.value})} type="url" dir="ltr" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900" /></div></div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"><h4 className="text-sm font-black text-gray-800 mb-2 flex items-center gap-2"><span className="text-lg">🔗</span> الوسائط</h4><div><label className="text-xs font-bold text-gray-600 mb-1 block">روابط الصور (مفصولة بفاصلة ,)</label><textarea value={farmData.imageUrls} onChange={e=>setFarmData({...farmData, imageUrls: e.target.value})} dir="ltr" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-bold text-gray-900 h-24 font-mono leading-relaxed"></textarea></div><div><label className="text-xs font-bold text-gray-600 mb-1 block">رابط التلغرام</label><input value={farmData.telegramVideoUrl} onChange={e=>setFarmData({...farmData, telegramVideoUrl: e.target.value})} type="url" dir="ltr" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900" /></div><div><label className="text-xs font-bold text-gray-600 mb-1 block">أرقام التواصل</label><input required={!isEditingFarm} value={farmData.contactNumbers} onChange={e=>setFarmData({...farmData, contactNumbers: e.target.value})} type="text" dir="ltr" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900" /></div></div>
                    <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 flex flex-col gap-4"><h4 className="text-sm font-black text-orange-800 mb-2 flex items-center gap-2"><span className="text-lg">🕵️‍♂️</span> قسم الإدارة السري</h4><div><label className="text-xs font-bold text-orange-600 block mb-1">تاريخ آخر فيديو تحقق</label><input type="date" required={!isEditingFarm} value={farmData.lastVerificationDate} onChange={e=>setFarmData({...farmData, lastVerificationDate: e.target.value})} className="w-full bg-white border border-orange-200 rounded-xl p-3.5 text-sm font-bold text-gray-900" /></div><div><label className="text-xs font-bold text-orange-600 block mb-1">ملاحظات سرية لفريق العمل</label><textarea value={farmData.adminNotes} onChange={e=>setFarmData({...farmData, adminNotes: e.target.value})} className="w-full bg-white border border-orange-200 rounded-xl p-4 text-sm font-bold text-gray-900 h-24"></textarea></div></div>
                  </form>
                )}
              </div>
              {!newFarmOwnerCredentials && ( <div className="bg-white p-4 border-t border-gray-200 shrink-0"><button onClick={handleAddFarm} disabled={isSubmittingFarm} className={`w-full py-4 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition disabled:opacity-50 ${isEditingFarm ? 'bg-blue-600' : 'bg-[#232528]'}`}>{isSubmittingFarm ? 'جاري الحفظ...' : (isEditingFarm ? 'حفظ التعديلات 💾' : 'حفظ ونشر المزرعة 🚀')}</button></div> )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}