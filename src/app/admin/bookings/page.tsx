"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

const PlusIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CalendarIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const UserIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const BackIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;

const safeDate = (dateVal: any) => {
  if (!dateVal) return 'غير محدد';
  try { return isNaN(new Date(dateVal).getTime()) ? 'تاريخ غير صالح' : new Date(dateVal).toLocaleDateString('ar-SY'); } catch { return 'غير محدد'; }
};

const safeIsoDate = (dateVal: any) => {
  if (!dateVal) return '';
  try { return isNaN(new Date(dateVal).getTime()) ? '' : new Date(dateVal).toISOString().split('T')[0]; } catch { return ''; }
};

export default function AdminBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔍 حالات الفلاتر الجديدة
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFarmId, setFilterFarmId] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  
  const initialFormState = {
    tenantName: '', tenantPhone: '', contactNumbers: '', farmId: '',
    checkinDate: '', nights: 1, guestType: 'families', guestCount: 1,
    status: 'pending_hold', paymentMethod: 'cash', paymentInfo: '',
    depositAmount: 0, totalAmount: 0, commissionRate: 0, adminNotes: '',
    depositDeliveredToOwner: false, depositDeliveryInfo: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const commissionInSYP = (Number(formData?.totalAmount || 0) * Number(formData?.commissionRate || 0)) / 100;

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('eco_villa_token') || '';
      const bData = await api.getAdminBookings(token);
      setBookings(Array.isArray(bData) ? bData : []);
      const fData = await api.getFarms({ startDate: '', endDate: '' } as any);
      setFarms(Array.isArray(fData) ? fData : []);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  // ⚡️ المنطق السحري للفلترة الفورية
  const filteredBookings = bookings.filter(b => {
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchFarm = filterFarmId === 'all' || b.farmId === filterFarmId;
    const searchLower = filterSearch.toLowerCase();
    const matchSearch = filterSearch === '' || 
      (b.tenantName && b.tenantName.toLowerCase().includes(searchLower)) ||
      (b.invoiceId && b.invoiceId.toLowerCase().includes(searchLower)) ||
      (b.tenantPhone && b.tenantPhone.includes(searchLower));
      
    return matchStatus && matchFarm && matchSearch;
  });

  const openAddModal = () => {
    setEditingBooking(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (booking: any) => {
    if (!booking) return;
    setEditingBooking(booking);
    setFormData({
      tenantName: booking.tenantName || '', tenantPhone: booking.tenantPhone || '',
      contactNumbers: Array.isArray(booking.contactNumbers) ? booking.contactNumbers.join(', ') : '',
      farmId: booking.farmId || '', checkinDate: safeIsoDate(booking.checkinDate),
      nights: booking.nights || 1, guestType: booking.guestType || 'families', guestCount: booking.guestCount || 1,
      status: booking.status || 'pending_hold', paymentMethod: booking.paymentMethod || 'cash',
      paymentInfo: booking.paymentInfo || '', depositAmount: Number(booking.depositAmount) || 0,
      totalAmount: Number(booking.totalAmount) || 0, commissionRate: Number(booking.commissionRate) || 0,
      adminNotes: booking.adminNotes || '', depositDeliveredToOwner: booking.depositDeliveredToOwner || false,
      depositDeliveryInfo: booking.depositDeliveryInfo || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('eco_villa_token') || '';
      const payload = {
        ...formData,
        contactNumbers: formData.contactNumbers ? formData.contactNumbers.split(',').map((n: string) => n.trim()).filter(Boolean) : [],
        depositAmount: Number(formData.depositAmount) || 0, totalAmount: Number(formData.totalAmount) || 0,
        commissionRate: Number(formData.commissionRate) || 0, nights: Number(formData.nights) || 1, guestCount: Number(formData.guestCount) || 1,
      };

      if (editingBooking && editingBooking.id) {
        await api.updateBookingAdmin(editingBooking.id, payload, token);
        alert('تم تعديل الحجز بنجاح!');
      } else {
        await api.createBookingAdmin(payload, token);
        alert('تم إنشاء الحجز بنجاح!');
      }
      setIsModalOpen(false);
      fetchBookings();
    } catch (error: any) { alert(error?.message || "حدث خطأ أثناء الحفظ"); } finally { setIsLoading(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-red-100 text-red-700 border-red-200';
      case 'done': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'deposit_paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending_hold': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cancelled': return 'bg-gray-200 text-gray-500 border-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل (أحمر)';
      case 'done': return 'تم التسليم';
      case 'deposit_paid': return 'دفع عربون';
      case 'pending_hold': return 'معلق (برتقالي)';
      case 'cancelled': return 'ملغى';
      default: return status || 'غير محدد';
    }
  };

  return (
    <div dir="rtl" className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] pb-24 font-sans relative shadow-2xl border-x border-gray-200">
      <header className="bg-[#1E1E2D] px-5 pt-10 pb-5 shadow-lg sticky top-0 z-30 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
           <button onClick={() => router.push('/admin/dashboard')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"><BackIcon /></button>
           <div><h1 className="text-xl font-black text-[#7CB342]">الرادار الشامل</h1><p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Bookings Management</p></div>
        </div>
        <button onClick={openAddModal} className="bg-[#7CB342] text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-[#689f38] transition active:scale-95 flex items-center gap-1">
          <PlusIcon /> إضافة
        </button>
      </header>

      {/* 🔍 قسم الفلاتر الذكية */}
      <div className="px-5 pt-5 pb-2">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
          <input 
            type="text" 
            placeholder="بحث بالاسم، رقم الفاتورة، أو الموبايل..." 
            value={filterSearch} 
            onChange={e => setFilterSearch(e.target.value)} 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors" 
          />
          <div className="flex gap-2">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-700 outline-none">
              <option value="all">كل الحالات</option>
              <option value="pending_hold">⏳ معلق</option>
              <option value="deposit_paid">💰 تم دفع العربون</option>
              <option value="completed">✅ مكتمل</option>
              <option value="done">🔑 مُنفذ</option>
              <option value="cancelled">❌ ملغى</option>
            </select>
            <select value={filterFarmId} onChange={e => setFilterFarmId(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-700 outline-none truncate">
              <option value="all">كل المزارع</option>
              {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4 pt-2">
        <div className="text-xs font-bold text-gray-500 px-1">نتائج البحث: {filteredBookings.length} حجز</div>
        
        {isLoading ? (
          <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin"></div></div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-3xl border border-gray-100 shadow-sm"><span className="text-4xl mb-3 block opacity-50">🔍</span><p className="text-gray-500 font-bold">لا يوجد نتائج مطابقة</p></div>
        ) : (
          filteredBookings.map((booking, idx) => (
            <div key={booking?.id || idx} onClick={() => openEditModal(booking)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative cursor-pointer hover:shadow-md transition active:scale-[0.98]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase tracking-wider border">{booking?.invoiceId || 'INV-NEW'}</span>
                  <h3 className="font-bold text-gray-800 mt-1">{booking?.tenantName || 'بدون اسم'}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${getStatusColor(booking?.status)}`}>{getStatusLabel(booking?.status)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium"><CalendarIcon /> {safeDate(booking?.checkinDate)} ({booking?.nights || 0} ليلة)</div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium"><UserIcon /> {booking?.farmName || booking?.farmId || 'غير محدد'}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="fixed inset-0 bg-[#F8F9FA] z-50 overflow-y-auto flex flex-col max-w-md mx-auto border-x border-gray-200">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex justify-between items-center z-10 shadow-sm shrink-0">
              <h2 className="text-lg font-black text-[#232528]">{editingBooking ? 'تعديل الحجز' : 'إضافة حجز جديد'}</h2>
              <button onClick={() => setIsModalOpen(false)} type="button" className="p-2 bg-gray-100 rounded-full text-gray-600 active:scale-95"><CloseIcon /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-6 flex-1 overflow-y-auto">
              
              {editingBooking && (
                <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200 grid grid-cols-2 gap-3">
                   <div><label className="text-[10px] font-bold text-gray-500 block mb-1">13. الفاتورة</label><div className="text-sm font-black text-gray-800 tracking-widest">{editingBooking.invoiceId}</div></div>
                   <div><label className="text-[10px] font-bold text-gray-500 block mb-1">1. تاريخ الإنشاء</label><div className="text-[11px] font-bold text-gray-800 mt-1">{new Date(editingBooking.createdAt).toLocaleString('ar-SY')}</div></div>
                </div>
              )}

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm font-black text-[#7CB342] flex items-center gap-2">👤 بيانات المستأجر</h3>
                <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">2. اسم المستأجر</label><input required type="text" value={formData.tenantName} onChange={e=>setFormData({...formData, tenantName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">3. الرقم الأساسي</label><input required type="tel" dir="ltr" value={formData.tenantPhone} onChange={e=>setFormData({...formData, tenantPhone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none" /></div>
                  <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">12. أرقام إضافية</label><input type="text" dir="ltr" value={formData.contactNumbers} onChange={e=>setFormData({...formData, contactNumbers: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none" placeholder="09xx, 09yy" /></div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm font-black text-[#0288D1] flex items-center gap-2">📅 المزرعة والتاريخ</h3>
                <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">4. المزرعة المحجوزة</label><select required value={formData.farmId} onChange={e=>setFormData({...formData, farmId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none font-bold text-blue-600"><option value="">-- اختر --</option>{Array.isArray(farms) && farms.map(f=><option key={f?.id} value={f?.id}>{f?.name} ({f?.admin_code})</option>)}</select></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">5. تاريخ الدخول</label><input required type="date" value={formData.checkinDate} onChange={e=>setFormData({...formData, checkinDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none" /></div>
                  <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">الليالي</label><input required type="number" min="1" value={formData.nights} onChange={e=>setFormData({...formData, nights: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">6. الضيوف</label><select value={formData.guestType} onChange={e=>setFormData({...formData, guestType: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none"><option value="families">عائلات</option><option value="groups">عائلات وكروبات</option></select></div>
                   <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">7. العدد</label><input type="number" value={formData.guestCount} onChange={e=>setFormData({...formData, guestCount: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none" /></div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm font-black text-[#FF7E5F] flex items-center gap-2">💰 المالية والإدارة</h3>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">8. دورة حياة الحجز</label>
                  <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className={`w-full border rounded-xl p-3.5 text-sm outline-none font-bold ${getStatusColor(formData.status)}`}>
                    <option value="pending_hold">⏳ معلق (بانتظار الدفع) - روزنامة برتقالي</option>
                    <option value="completed">✅ تم الدفع والمطابقة - روزنامة أحمر</option>
                    <option value="done">🔑 مُنفذ / تم التسليم - روزنامة أحمر</option>
                    <option value="cancelled">❌ ملغى (متاح)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">المبلغ الإجمالي</label><input required type="number" value={formData.totalAmount} onChange={e=>setFormData({...formData, totalAmount: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none" /></div>
                  <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">11. مقدار الدفع (العربون)</label><input required type="number" value={formData.depositAmount} onChange={e=>setFormData({...formData, depositAmount: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none text-[#FF7E5F] font-bold" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">9. طريقة الدفع</label>
                    <select value={formData.paymentMethod} onChange={e=>setFormData({...formData, paymentMethod: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none"><option value="cash">كاش</option><option value="transfer">حوالة هرم/شركة</option><option value="bank">بنك</option></select>
                  </div>
                  <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">10. معلومات الدفع</label><input type="text" value={formData.paymentInfo} onChange={e=>setFormData({...formData, paymentInfo: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none" placeholder="رقم حوالة، هوية..." /></div>
                </div>
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-700">14. عمولة المنصة (%)</label>
                    <div className="text-[10px] font-black text-gray-500 bg-white px-2 py-1 rounded border">تساوي: <span className="text-[#7CB342]">{commissionInSYP ? commissionInSYP.toLocaleString() : 0}</span> ل.س</div>
                  </div>
                  <input type="number" min="0" max="100" value={formData.commissionRate} onChange={e=>setFormData({...formData, commissionRate: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none font-bold" />
                </div>
                <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">15. ملاحظات الفريق (سرية)</label><textarea value={formData.adminNotes} onChange={e=>setFormData({...formData, adminNotes: e.target.value})} className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-3.5 text-sm outline-none h-20" placeholder="أي ملاحظات تخص الزبون أو الحجز..."></textarea></div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                 <label className="flex items-center gap-3 cursor-pointer">
                   <input type="checkbox" checked={formData.depositDeliveredToOwner} onChange={e=>setFormData({...formData, depositDeliveredToOwner: e.target.checked})} className="w-5 h-5 accent-blue-600" />
                   <span className="text-sm font-bold text-blue-900">16. تم تسليم العربون لصاحب المزرعة؟</span>
                 </label>
                 {formData.depositDeliveredToOwner && (
                   <div><label className="text-xs font-bold text-blue-800 mb-1.5 block">17. تاريخ/رقم حوالة التسليم للمالك</label><input type="text" value={formData.depositDeliveryInfo} onChange={e=>setFormData({...formData, depositDeliveryInfo: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl p-3 text-sm outline-none font-bold" placeholder="حوالة الهرم رقم..." /></div>
                 )}
              </div>

              <div className="pt-2 pb-6">
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#1E1E2D] text-white rounded-xl font-black text-lg shadow-lg hover:bg-black active:scale-95 disabled:opacity-50">{isLoading ? 'جاري الحفظ...' : 'حفظ بيانات الحجز'}</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}