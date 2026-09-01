"use client";

import React, { useState } from "react";
import { MessageCircle, Phone, Mail, ChevronDown, Send, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Card } from "@/components/ui/Card/Card";
import { HelpPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";

const FAQ_ITEMS = [
  {
    qAr: "كم يستغرق توصيل الطلب في مصر والخليج؟",
    qEn: "How long does delivery take in Egypt & the Gulf?",
    aAr: "يستغرق التوصيل داخل مصر من 2 إلى 4 أيام عمل للمنتجات الجاهزة، ومن 10 إلى 15 يوم عمل لطلبات الاستيراد الخاصة من شي إن وترينديول. والتوصيل للإمارات والسعودية يستغرق من 5 إلى 9 أيام عمل.",
    aEn: "Delivery within Egypt takes 2-4 business days for in-stock pieces, and 10-15 business days for Shein/Trendyol imports. Gulf delivery takes 5-9 business days.",
  },
  {
    qAr: "كيف يعمل قسم 'احسبيلي' لطلب منتجات شي إن وترينديول؟",
    qEn: "How does the 'Price Calculator' work for Shein & Trendyol?",
    aAr: "بكل بساطة انسخي رابط أي منتج أو ادخلي سعره بالعملة الأصلية، وستقوم الحاسبة بحساب السعر الإجمالي بالجنيه شامل الشحن والجمارك حتى باب بيتك.",
    aEn: "Simply paste the product link or enter its price in original currency, and our calculator will display the total cost in EGP including shipping and customs.",
  },
  {
    qAr: "هل متاح المعاينة عند الاستلام؟",
    qEn: "Is inspection on delivery available?",
    aAr: "نعم بكل تأكيد! يمكنك معاينة الشحنة والتأكد من المقاس والخامة مع المندوب قبل الاستلام.",
    aEn: "Yes, absolutely! You can inspect the package with the courier before payment.",
  },
  {
    qAr: "ما هي سياسة الاسترجاع والاستبدال؟",
    qEn: "What is the return and exchange policy?",
    aAr: "نقبل الاسترجاع والاستبدال خلال 14 يوماً من تاريخ الاستلام بشرط أن تكون القطعة بحالتها الأصلية وبكامل بطاقاتها.",
    aEn: "We accept returns and exchanges within 14 days of delivery provided the item is in its original condition with tags attached.",
  },
];

export default function ContactHelpPage() {
  const { t, lang, isLangReady } = useLanguage();
  const { showToast } = useToast();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [senderName, setSenderName] = useState("");
  const [senderContact, setSenderContact] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isLangReady) {
    return (
      <StandardPageLayout>
        <HelpPageSkeleton />
      </StandardPageLayout>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderContact.trim() || !message.trim()) {
      showToast(lang === "ar" ? "يرجى ملء جميع الحقول" : "Please fill in all fields", "error");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      showToast(t("help.sent"), "success");
      setSenderName("");
      setSenderContact("");
      setMessage("");
      setIsSending(false);
    }, 600);
  };

  const handleWhatsAppChat = () => {
    const text = encodeURIComponent(
      lang === "ar"
        ? "مرحباً بيليكو! أرغب في الاستفسار عن خدمة العملاء والطلبات."
        : "Hello Beleco! I would like to inquire about customer support and orders."
    );
    window.open(`https://wa.me/201012345678?text=${text}`, "_blank");
  };

  return (
    <StandardPageLayout>
      <div className="help-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <Heading variant="editorial-h1" className="text-xl sm:text-2xl text-brand-neutral-950 font-bold">
            {t("help.title")}
          </Heading>
          <p className="text-xs font-sans text-brand-neutral-500">
            {t("help.sub")}
          </p>
        </div>

        {/* Instant Support Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <Card
            variant="interactive"
            onClick={handleWhatsAppChat}
            className="p-3.5 flex flex-col gap-2 bg-success-50/50 border border-success-200 rounded-2xl shadow-xs cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-success-500 text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-xs text-brand-neutral-950">
                {t("help.whatsapp")}
              </span>
              <span className="text-[10px] font-sans text-success-700 mt-0.5">
                {lang === "ar" ? "رد فوري خلال دقائق" : "Instant reply in minutes"}
              </span>
            </div>
          </Card>

          <a href="tel:+201012345678" className="w-full">
            <Card
              variant="interactive"
              className="p-3.5 flex flex-col gap-2 bg-primary-50/50 border border-primary-200 rounded-2xl shadow-xs cursor-pointer select-none group h-full"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-xs">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-xs text-brand-neutral-950">
                  {t("help.phone")}
                </span>
                <span className="text-[10px] font-mono text-primary-700 mt-0.5" dir="ltr">
                  +20 10 1234 5678
                </span>
              </div>
            </Card>
          </a>
        </div>

        {/* FAQ Accordion Section */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center gap-2 px-1">
            <HelpCircle className="w-4 h-4 text-primary-500" />
            <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-900 uppercase">
              {t("help.faq")}
            </Heading>
          </div>

          <div className="flex flex-col gap-2">
            {FAQ_ITEMS.map((item, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <Card
                  key={idx}
                  className="p-0 overflow-hidden bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full p-3.5 flex items-center justify-between gap-3 text-left font-sans font-bold text-xs text-brand-neutral-900 hover:bg-brand-neutral-50 transition-colors"
                  >
                    <span>{lang === "ar" ? item.qAr : item.qEn}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-brand-neutral-400 shrink-0 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-primary-500" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs font-sans text-brand-neutral-600 border-t border-brand-neutral-100 bg-brand-neutral-50/50 leading-relaxed animate-in fade-in duration-150">
                      {lang === "ar" ? item.aAr : item.aEn}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Direct Support Message Form */}
        <Card className="p-4 flex flex-col gap-3 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs mt-1">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary-500" />
            <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-900">
              {t("help.sendMsg")}
            </Heading>
          </div>

          <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
            <Input
              label={lang === "ar" ? "الاسم" : "Name"}
              placeholder="اسمك الكريم"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              required
            />

            <Input
              label={lang === "ar" ? "رقم الهاتف أو البريد الإلكتروني" : "Phone or Email"}
              placeholder="01012345678 أو email@example.com"
              value={senderContact}
              onChange={(e) => setSenderContact(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-sans font-bold text-brand-neutral-700">
                {lang === "ar" ? "نص الرسالة أو الاستفسار" : "Your Message"}
              </label>
              <textarea
                rows={3}
                placeholder={lang === "ar" ? "اكتبي استفسارك هنا وسنقوم بالرد عليك في أقرب وقت..." : "Type your inquiry here..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-brand-neutral-50 border border-brand-neutral-200 text-xs font-sans text-brand-neutral-900 outline-none focus:border-primary-500 resize-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSending}
              leftIcon={<Send className="w-4 h-4" />}
              className="mt-1 font-bold shadow-md"
            >
              {lang === "ar" ? "إرسال الرسالة" : "Send Message"}
            </Button>
          </form>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
