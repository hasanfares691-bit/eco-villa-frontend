"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { api } from '../lib/api'; // API Client

// --- Types ---
interface Feature {
  text: string;
  icon: React.ReactNode;
}

interface Farm {
  id: string | number;
  title: string;
  location: string;
  price: string;
  badgeText?: string;
  badgeIcon?: string;
  images: string[];
  features: Feature[];
}

// --- Colors ---
const ECO_GREEN = "#7CB342"; 
const VILLA_BLUE = "#0288D1"; 
const BASALT = "#232528";
const PERSIMMON = "#FF7E5F";
const WHATSAPP_GREEN = "#25D366";

// --- Custom Logo Component ---
const EcoVillaLogo = () => (
  <div className="flex flex-col items-start leading-none font-black tracking-tighter">
    <span style={{ color: ECO_GREEN }} className="text-[22px] uppercase">Eco</span>
    <span style={{ color: VILLA_BLUE }} className="text-[22px] -mt-1.5">Villa</span>
  </div>
);

// --- Icons (Inline SVGs) ---
const UserIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const MapIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
const HomeIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3l8 6v12h-5v-7h-6v7H4V9l8-6z" /></svg>;
const HeartIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const MessageIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const ChevronRight = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const ChevronLeft = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const BedIcon = () => <svg className="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 11v6a2 2 0 002 2h14a2 2 0 002-2v-6M3 11h18M5 15h14M8 7h8" /></svg>;
const UsersIcon = () => <svg className="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const DropletIcon = () => <svg className="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C12 2 4 8 4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14C20 8 12 2 12 2Z" /></svg>;
const XIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const WhatsappIcon = () => <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
const FacebookIcon = () => <svg className="w-5 h-5 text-gray-500 hover:text-blue-600 transition" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const InstagramIcon = () => <svg className="w-5 h-5 text-gray-500 hover:text-pink-600 transition" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.88z"/></svg>;
const TwitterIcon = () => <svg className="w-5 h-5 text-gray-500 hover:text-black transition" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const TelegramIcon = () => <svg className="w-5 h-5 text-gray-500 hover:text-[#2AABEE] transition" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.03-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.23.29-.48.78-.73 3.02-1.31 5.05-2.18 6.08-2.61 2.89-1.2 3.49-1.38 3.89-1.39.09 0 .28.02.39.11.09.07.13.17.15.28 0 .04.01.19.01.27z"/></svg>;

// --- Fallback Mock Data ---
const MOCK_FARMS: Farm[] = [
  { id: 1, title: "شاليه الأحلام الملكي", location: "ريف دمشق، يعفور", price: "2,500,000", badgeText: "الأكثر اعتماداً", badgeIcon: "🎖️", images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"], features: [{ text: '3 غرف', icon: <BedIcon /> }, { text: '12 شخص', icon: <UsersIcon /> }, { text: 'مسبح مفلتر', icon: <DropletIcon /> }] },
];

// --- Component: Farm Card ---
const FarmCard = ({ farm }: { farm: Farm }) => {
  const [imgIndex, setImgIndex] = useState<number>(0);

  const nextImg = (e: React.MouseEvent<HTMLButtonElement>) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    setImgIndex((prev) => (prev + 1) % farm.images.length); 
  };
  const prevImg = (e: React.MouseEvent<HTMLButtonElement>) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    setImgIndex((prev) => (prev === 0 ? farm.images.length - 1 : prev - 1)); 
  };

  return (
    <Link href={`/farms/${farm.id}`} className="block outline-none h-full">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden relative cursor-pointer hover:shadow-[0_10px_40px_rgb(0,0,0,0.12)] transition-all md:rounded-[2.5rem] lg:rounded-[3rem] h-full flex flex-col group"
      >
        <div className="relative w-full aspect-video bg-gray-200 shrink-0">
          <AnimatePresence initial={false} mode="wait">
            <motion.img 
              key={imgIndex}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              src={farm.images[imgIndex]} alt={farm.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          </AnimatePresence>

          {farm.images.length > 1 && (
            <>
              <button onClick={nextImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md p-1.5 rounded-full text-white hover:bg-black/40 transition z-10 shadow-sm"><ChevronLeft /></button>
              <button onClick={prevImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md p-1.5 rounded-full text-white hover:bg-black/40 transition z-10 shadow-sm"><ChevronRight /></button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {farm.images.map((_: string, idx: number) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === imgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none"></div>
          {farm.badgeText && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-[#232528] text-[11px] px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1 border border-gray-100">
              <span className="text-sm">{farm.badgeIcon}</span> {farm.badgeText}
            </div>
          )}
        </div>

        <div className="p-5 md:p-6 lg:p-8 flex flex-col grow">
          <h2 style={{ color: PERSIMMON }} className="text-[24px] md:text-[28px] font-black leading-none mb-1">
            {farm.price} <span className="text-sm font-bold opacity-70">ل.س / ليلة</span>
          </h2>
          <h3 className="text-lg md:text-xl font-bold text-[#232528] mt-2 line-clamp-1">{farm.title}</h3>
          <p className="text-xs md:text-sm text-gray-500 mb-4">{farm.location}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {farm.features.map((feat: Feature, idx: number) => (
              <span key={idx} className="flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                {feat.icon} {feat.text}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-2">
            <motion.button 
              whileTap={{ scale: 0.96 }}
              style={{ backgroundColor: PERSIMMON }}
              className="w-full h-[55px] md:h-[60px] text-white rounded-2xl font-extrabold text-[16px] md:text-[17px] shadow-[0_8px_20px_rgba(255,126,95,0.3)] hover:shadow-[0_12px_25px_rgba(255,126,95,0.4)] transition-all flex justify-center items-center gap-2"
            >
              احجز الآن بأمان
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};


// --- Main App Component ---
export default function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [showLoginHint, setShowLoginHint] = useState<boolean>(false);
  const [farmsList, setFarmsList] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('');
  const [filterGuestType, setFilterGuestType] = useState<string>('');
  const [filterCapacity, setFilterCapacity] = useState<string>('');
  const [filterPrice, setFilterPrice] = useState<string>(''); 

  const handleFavoriteClick = () => {
    setShowLoginHint(true);
    setTimeout(() => setShowLoginHint(false), 3000);
  };

  const clearFilters = () => {
    setFilterDate(''); setFilterRegion(''); setFilterGuestType(''); setFilterCapacity(''); setFilterPrice('');
  };

  const loadFarms = async (searchParams?: any) => {
    setIsLoading(true);
    try {
      const data = await api.getFarms(searchParams);
      if (data && data.length > 0) {
        const mappedFarms = data.map((item: any) => ({
          id: item.id,
          title: item.name,
          location: item.region,
          price: item.price_weekday?.toLocaleString() || "0",
          badgeText: item.guest_type === 'families' ? "عائلات فقط" : "متاح للجميع",
          badgeIcon: "✨",
          images: item.media?.length > 0 ? item.media.map((m: any) => m.url) : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"],
          features: [
            { text: `${item.max_capacity} شخص`, icon: <UsersIcon /> },
            { text: item.guest_type === 'families' ? 'عائلات' : 'متعدد', icon: <BedIcon /> }
          ]
        }));
        setFarmsList(mappedFarms);
      } else {
        setFarmsList([]); 
      }
    } catch (error) {
      console.error("Failed to load farms from backend, using mock data", error);
      setFarmsList(MOCK_FARMS); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadFarms(); }, []);

  const handleSearchSubmit = () => {
    setIsDrawerOpen(false);
    loadFarms({ startDate: filterDate, endDate: filterDate ? new Date(new Date(filterDate).getTime() + 86400000).toISOString().split('T')[0] : undefined });
  };

  return (
    // 🔴 تم إزالة القيود الضيقة (max-w) ليأخذ الموقع العرض بالكامل
    <div dir="rtl" className="min-h-screen bg-[#F8F9FA] relative font-sans overflow-x-hidden selection:bg-[#7CB342]/30 pb-[100px] lg:pb-10">
      
      {/* 🔴 الهيدر صار عريض، لكن المحتوى اللي جواته متمركز بالوسط */}
      <header className="bg-white rounded-b-[2rem] lg:rounded-b-[3rem] shadow-[0_10px_40px_rgb(0,0,0,0.03)] relative z-10">
        <div className="max-w-7xl mx-auto pt-10 pb-5 px-5 md:pt-12 md:pb-8 lg:pt-14 lg:pb-10 lg:px-12">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <motion.h1 
              initial={{ scale: 0.8, opacity: 0, rotate: 5 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 15, delay: 0.1 }}
              style={{ color: ECO_GREEN }}
              className="text-[19px] sm:text-2xl lg:text-3xl font-extrabold tracking-tight whitespace-nowrap"
            >
              بأي مزرعة حابين تنبسطو؟ 😎
            </motion.h1>
            <motion.div initial={{ scale: 0, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="shrink-0">
              <EcoVillaLogo />
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.98 }} onClick={() => setIsDrawerOpen(true)}
            className="bg-gray-50 text-gray-500 rounded-2xl py-4 px-4 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer md:py-5 md:px-5 lg:py-6 lg:px-8 hover:bg-gray-100 transition-colors"
          >
            <SearchIcon />
            <span className="font-medium text-sm lg:text-lg">ابحث عن منطقة، أو ميزة...</span>
          </motion.div>
        </div>
      </header>

      {/* 🔴 المحتوى الأساسي تم وضع قيود له ليتمركز في الشاشات الكبيرة */}
      <main className="max-w-7xl mx-auto px-5 pt-8 md:px-8 md:pt-10 lg:px-12 lg:pt-12">
        <div className="min-h-[40vh]">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center pt-20 opacity-60">
               <div className="w-12 h-12 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-gray-500 font-bold text-sm lg:text-base">جاري جلب المزارع...</p>
             </div>
          ) : farmsList.length === 0 ? (
             <div className="text-center pt-20 opacity-70">
               <span className="text-5xl lg:text-6xl mb-4 block">🏜️</span>
               <p className="text-gray-600 font-bold text-xl lg:text-2xl">لا يوجد مزارع متاحة</p>
               <p className="text-gray-400 text-sm lg:text-base mt-2">جرب تغيير شروط البحث من الدرج السفلي</p>
             </div>
          ) : (
            // 🔴 السحر هون: شبكة المزارع تتحول من عمود واحد لـ 3 أعمدة
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
              {farmsList.map((farm: Farm) => (
                <FarmCard key={farm.id} farm={farm} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center pb-8 lg:mt-20">
           <h4 className="text-sm lg:text-base font-bold text-gray-400 mb-6">تواصل معنا وتابع جديدنا</h4>
           <div className="flex justify-center gap-5 lg:gap-6">
              <a href="https://www.facebook.com/profile.php?id=61578564576992" target="_blank" rel="noreferrer" className="p-3 lg:p-4 bg-white rounded-full shadow-sm text-gray-400 hover:text-[#1877F2] transition-colors"><FacebookIcon /></a>
              <a href="https://www.instagram.com/ecovilla_sy?igsh=a3V3NWNoYnJvNzA4" target="_blank" rel="noreferrer" className="p-3 lg:p-4 bg-white rounded-full shadow-sm text-gray-400 hover:text-[#E1306C] transition-colors"><InstagramIcon /></a>
              <a href="https://x.com/EcoVilla2025" target="_blank" rel="noreferrer" className="p-3 lg:p-4 bg-white rounded-full shadow-sm text-gray-400 hover:text-black transition-colors"><TwitterIcon /></a>
              <a href="https://t.me/Ecovilla1" target="_blank" rel="noreferrer" className="p-3 lg:p-4 bg-white rounded-full shadow-sm text-gray-400 hover:text-[#2AABEE] transition-colors"><TelegramIcon /></a>
           </div>
           <p className="text-xs lg:text-sm text-gray-400 mt-6 font-medium">© 2026 إيكو فيلا. جميع الحقوق محفوظة.</p>
        </div>
      </main>

      {/* زر الواتساب */}
      <motion.a
        href="https://wa.me/963940457043" target="_blank" rel="noreferrer"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ backgroundColor: WHATSAPP_GREEN }}
        className="fixed bottom-[90px] md:bottom-8 right-5 lg:right-10 w-[55px] h-[55px] lg:w-[60px] lg:h-[60px] text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(37,211,102,0.4)] z-40 border-2 border-white"
      >
        <WhatsappIcon />
      </motion.a>

      {/* 🔴 القائمة السفلية: جزيرة عائمة فخمة عاللابتوب */}
      <div className="fixed bottom-0 left-0 right-0 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:max-w-lg bg-white border-t md:border border-gray-100 md:rounded-[2rem] md:shadow-[0_20px_50px_rgb(0,0,0,0.1)] px-6 py-3 md:py-4 z-50 pb-safe transition-all">
        <div className="flex justify-between items-center px-2 lg:px-6">
          <motion.button whileTap={{ scale: 0.85 }} style={{ color: PERSIMMON }} className="flex flex-col items-center gap-1 md:gap-1.5">
            <HomeIcon />
            <span className="text-[10px] md:text-xs font-bold mt-0.5">الرئيسية</span>
          </motion.button>
          
          <motion.button onClick={handleFavoriteClick} whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-1 md:gap-1.5 text-gray-400 hover:text-gray-600 transition">
            <HeartIcon />
            <span className="text-[10px] md:text-xs font-bold mt-0.5">المفضلة</span>
          </motion.button>
          
          <a href="https://wa.me/963940457043" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 md:gap-1.5 text-gray-400 hover:text-[#25D366] transition-colors">
            <MessageIcon />
            <span className="text-[10px] md:text-xs font-bold mt-0.5">الدعم</span>
          </a>
          
          <Link href="/owner/login">
            <motion.button whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-1 md:gap-1.5 text-gray-400 hover:text-blue-600 transition">
              <UserIcon />
              <span className="text-[10px] md:text-xs font-bold mt-0.5">تسجيل</span>
            </motion.button>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {showLoginHint && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-[90px] md:bottom-[100px] left-5 right-5 md:max-w-md md:mx-auto bg-[#232528] text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between border border-gray-700"
          >
            <span className="text-sm lg:text-base font-bold">سجل دخول لتحفظ مزارعك المفضلة ❤️</span>
            <Link href="/owner/login" style={{ color: PERSIMMON }} className="text-sm font-bold px-3 py-1.5 bg-white/10 hover:bg-white/20 transition rounded-lg">دخول</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔴 مربع البحث المتقدم: نافذة بالوسط عاللابتوب، ومن تحت عالموبايل */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"/>
            <motion.div 
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="fixed bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 left-0 right-0 max-w-md md:max-w-2xl mx-auto bg-white rounded-t-[2rem] md:rounded-[2rem] z-[70] p-6 lg:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2">
                <h3 className="text-xl lg:text-2xl font-black text-[#232528]">بحث متقدم</h3>
                <button onClick={() => setIsDrawerOpen(false)} className="bg-gray-100 p-2.5 rounded-full text-gray-500 hover:bg-gray-200 transition"><XIcon /></button>
              </div>
              
              <div className="space-y-5 lg:space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#232528] mb-2">تاريخ الدخول</label>
                  <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#7CB342] transition font-sans text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#232528] mb-2">المنطقة</label>
                  <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#7CB342] transition appearance-none text-gray-700 font-bold">
                    <option value="">كل المناطق (اختياري)</option>
                    <option value="طريق المطار">طريق المطار</option>
                    <option value="دروشا">دروشا</option>
                    <option value="الزبداني">الزبداني</option>
                    <option value="الصبورة">الصبورة</option>
                    <option value="مضايا">مضايا</option>
                    <option value="قرى الشام">قرى الشام</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#232528] mb-2">نوع الحجز</label>
                  <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => setFilterGuestType(filterGuestType === 'عائلات' ? '' : 'عائلات')} className={`p-4 rounded-xl border text-sm font-bold transition-all ${filterGuestType === 'عائلات' ? 'bg-[#7CB342] text-white border-[#7CB342]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>👨‍👩‍👧‍👦 عائلات</button>
                     <button onClick={() => setFilterGuestType(filterGuestType === 'غروبات' ? '' : 'غروبات')} className={`p-4 rounded-xl border text-sm font-bold transition-all ${filterGuestType === 'غروبات' ? 'bg-[#7CB342] text-white border-[#7CB342]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>🎉 غروبات</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#232528] mb-2">عدد الأشخاص</label>
                  <input type="number" placeholder="مثال: 10 (اختياري)" value={filterCapacity} onChange={(e) => setFilterCapacity(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#7CB342] transition font-sans text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#232528] mb-2">الميزانية (بالليلة)</label>
                  <div className="flex flex-col md:flex-row gap-2">
                     <button onClick={() => setFilterPrice(filterPrice === 'under_500' ? '' : 'under_500')} className={`w-full p-4 rounded-xl border text-sm font-bold transition-all ${filterPrice === 'under_500' ? 'bg-[#232528] text-white border-[#232528]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>تحت 500 ألف</button>
                     <button onClick={() => setFilterPrice(filterPrice === '500_1500' ? '' : '500_1500')} className={`w-full p-4 rounded-xl border text-sm font-bold transition-all ${filterPrice === '500_1500' ? 'bg-[#232528] text-white border-[#232528]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>500 إلى 1.5 مليون</button>
                     <button onClick={() => setFilterPrice(filterPrice === 'over_1500' ? '' : 'over_1500')} className={`w-full p-4 rounded-xl border text-sm font-bold transition-all ${filterPrice === 'over_1500' ? 'bg-[#232528] text-white border-[#232528]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>فوق 1.5 مليون</button>
                  </div>
                </div>
                <div className="pt-6 pb-2 flex gap-3">
                   <button onClick={clearFilters} className="w-1/3 h-[60px] bg-gray-100 text-gray-600 rounded-xl font-bold text-sm lg:text-base shadow-sm active:scale-95 hover:bg-gray-200 transition-all">مسح الكل</button>
                   <button onClick={handleSearchSubmit} className="w-2/3 h-[60px] bg-[#FF7E5F] text-white rounded-xl font-bold text-lg shadow-[0_8px_20px_rgba(255,126,95,0.3)] hover:shadow-[0_12px_25px_rgba(255,126,95,0.4)] active:scale-95 transition-all">عرض النتائج</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}