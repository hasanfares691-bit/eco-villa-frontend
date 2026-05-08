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
      <body className={`${ibmPlexSansArabic.variable} ${notoKufiArabic.variable} font-sans bg-gray-100 text-[#232528] antialiased`}>
        {/* حاوية الموبايل: عرض أقصى 448 بكسل، متمركزة في المنتصف مع ظل */}
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}