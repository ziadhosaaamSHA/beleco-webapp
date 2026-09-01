"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { useLanguage } from "@/context/LanguageContext";

export default function WelcomePage() {
  const router = useRouter();
  const { lang } = useLanguage();

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FEE7D5 0%, #FDD3B2 25%, #F6B88F 50%, #D37B58 75%, #B14020 100%)",
        backgroundAttachment: "fixed",
      }}
      dir="ltr"
    >
      {/* Top Image Collage (Matching Legacy welcome.html) */}
      <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-3 flex-1 min-h-[300px] max-h-[460px] relative z-10 pt-4">
        <div className="relative rounded-3xl overflow-hidden row-span-2 shadow-2xl border border-white/20">
          <Image
            src="https://picsum.photos/seed/beleco1/600/800"
            alt="Beleco Collection"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative rounded-2xl overflow-hidden h-[150px] shadow-lg border border-white/20">
          <Image
            src="https://picsum.photos/seed/beleco2/500/400"
            alt="Beleco Trend"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative rounded-2xl overflow-hidden h-[150px] shadow-lg border border-white/20">
          <Image
            src="https://picsum.photos/seed/beleco3/500/400"
            alt="Beleco Style"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Bottom Text & Actions */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center gap-3 pt-6 pb-4 relative z-10">
        <Heading variant="editorial-h1" className="text-2xl sm:text-3xl text-white font-bold leading-snug">
          {lang === "ar" ? (
            <>
              ارفعي مستوى ستايلك
              <br />
              مع كل قطعة تختاريها
            </>
          ) : (
            <>
              Elevate Your Style
              <br />
              With Every Piece
            </>
          )}
        </Heading>

        <p className="text-xs sm:text-sm font-sans text-white/85 leading-relaxed max-w-sm">
          {lang === "ar"
            ? "اطلبي من شي إن وتريندايول وأشهر البراندات العالمية، وهيوصلك لباب بيتك في مصر والإمارات."
            : "Shop from Shein, Trendyol and global brands, delivered to your doorstep in Egypt and UAE."}
        </p>

        <div className="w-full pt-4 flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/login")}
            className="w-full h-14 rounded-full bg-brand-neutral-950 hover:bg-brand-neutral-900 text-white font-sans font-bold text-base shadow-xl justify-center"
          >
            {lang === "ar" ? "ابدئي دلوقتي" : "Get Started"}
          </Button>

          <button
            onClick={() => {
              try {
                localStorage.setItem("beleco_welcomed", "true");
              } catch {}
              router.push("/");
            }}
            className="text-xs font-sans font-bold text-white/85 hover:text-white transition-colors underline cursor-pointer bg-transparent border-none p-1"
          >
            {lang === "ar" ? "تصفح كزائر" : "Continue as Guest"}
          </button>
        </div>
      </div>
    </div>
  );
}
