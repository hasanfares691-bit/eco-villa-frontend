import type { Metadata } from "next";
import { Noto_Kufi_Arabic, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

// تجهيز خطوط البراند
const notoKufiArabic = Noto_Kufi_Arabic({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-noto-kufi-arabic",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "600"],
  subsets: ["arabic"],
  variable: "--font-ibm-plex-sans-arabic",
});

// تعريف الموقع لمحركات البحث
export const metadata: Metadata = {
  title: "إيكو فيلا | Eco Villa",
  description: "مستقبل الضيافة بسوريا",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   <html lang="ar" dir="rtl" suppressHydrationWarning>
      {/* 🔴 تم الحفاظ على الخطوط، وتم إزالة max-w-md ليأخذ الموقع العرض الكامل بسلاسة */}
      <body className={`${ibmPlexSansArabic.variable} ${notoKufiArabic.variable} font-sans bg-[#F8F9FA] text-[#232528] antialiased min-h-screen relative overflow-x-hidden`}>
          {children}
      </body>
    </html>
  );
}