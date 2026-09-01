"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Globe } from "lucide-react";
import { Heading } from "@/components/ui/Heading/Heading";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";
import { authService } from "@/services/auth.service";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { lang, toggleLanguage, t } = useLanguage();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      await authService.loginWithGoogle();
      showToast(lang === "ar" ? "تم تسجيل الدخول بنجاح" : "Signed in successfully", "success");
      router.push("/");
    } catch (err: any) {
      console.error("Google login error:", err);
      setErrorMsg(lang === "ar" ? "تعذر تسجيل الدخول بواسطة Google، يرجى المحاولة لاحقاً" : "Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg(lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      if (mode === "signup") {
        await authService.registerWithEmail(email, password, displayName);
        showToast(lang === "ar" ? "تم إنشاء الحساب بنجاح" : "Account created successfully", "success");
      } else {
        await authService.loginWithEmail(email, password);
        showToast(lang === "ar" ? "تم تسجيل الدخول بنجاح" : "Signed in successfully", "success");
      }
      router.push("/");
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setErrorMsg(lang === "ar" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : "Invalid email or password");
      } else if (err.code === "auth/email-already-in-use") {
        setErrorMsg(lang === "ar" ? "البريد الإلكتروني مستخدم بالفعل" : "Email is already registered");
      } else if (err.code === "auth/weak-password") {
        setErrorMsg(lang === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
      } else {
        setErrorMsg(lang === "ar" ? "حدث خطأ أثناء المصادقة، يرجى التحقق من الاتصال" : "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FEE7D5 0%, #FDD3B2 25%, #F6B88F 50%, #D37B58 75%, #B14020 100%)",
        backgroundAttachment: "fixed",
      }}
      dir="ltr"
    >
      {/* Floating Language Toggle (Matching Legacy) */}
      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-mono font-bold shadow-xs hover:bg-white/30 transition-all cursor-pointer"
        style={{ top: "calc(20px + env(safe-area-inset-top, 0px))" }}
      >
        <Globe className="w-3.5 h-3.5 text-white" />
        <span>{lang === "ar" ? "EN" : "AR"}</span>
      </button>

      {/* Main Card Container */}
      <div className="w-full max-w-[400px] flex flex-col items-center animate-page-enter py-8">
        {/* Logo (logo-black.png) */}
        <div className="w-28 h-8 relative mb-6">
          <Image
            src="/logo-black.png"
            alt="Beleco"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Heading & Subtitle */}
        <Heading variant="editorial-h1" className="text-3xl text-white font-bold text-center mb-2">
          {mode === "login"
            ? lang === "ar" ? "أهلاً بيكِ تاني" : "Welcome Back"
            : lang === "ar" ? "إنشاء حساب جديد" : "Create Account"}
        </Heading>

        <p className="text-sm font-sans text-white/85 text-center mb-6 leading-relaxed">
          {mode === "login"
            ? lang === "ar" ? "سجّلي دخولك عشان تكمّلي طلبك وتتابعي أوردراتك بسهولة." : "Sign in to complete your orders and track them effortlessly."
            : lang === "ar" ? "انضمي إلى بيليكو واستمتعي بأرقى تجربة تسوق فاشون." : "Join Beleco for the best fashion shopping experience."}
        </p>

        {/* Error Alert */}
        {errorMsg && (
          <div className="w-full mb-4 p-3 rounded-xl bg-danger-900/40 backdrop-blur-sm border border-white/25 text-white text-xs font-sans font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-12 rounded-full bg-white text-brand-neutral-950 font-sans font-bold text-sm flex items-center justify-center gap-3 shadow-lg hover:bg-brand-neutral-50 active:scale-98 transition-all disabled:opacity-50 cursor-pointer mb-3"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.5 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.56-5.15 3.56-8.86z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.86-3c-1.07.72-2.45 1.15-4.08 1.15-3.13 0-5.79-2.11-6.74-4.96H1.28v3.1A12 12 0 0 0 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.26 14.29A7.2 7.2 0 0 1 4.88 12c0-.8.14-1.57.38-2.29v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.98-3.1z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.61l3.98 3.1C6.21 6.86 8.87 4.75 12 4.75z"
            />
          </svg>
          <span>{lang === "ar" ? "متابعة بحساب جوجل" : "Continue with Google"}</span>
        </button>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 my-4 text-white/70 text-xs font-sans font-bold">
          <div className="flex-1 h-px bg-white/30" />
          <span>{lang === "ar" ? "أو" : "or"}</span>
          <div className="flex-1 h-px bg-white/30" />
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-3">
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-sans font-bold text-white/90">
                {lang === "ar" ? "الاسم بالكامل" : "Full Name"}
              </label>
              <input
                type="text"
                placeholder={lang === "ar" ? "سارة محمد" : "Sarah Johnson"}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-2xl border border-white/30 bg-white/15 backdrop-blur-md text-white placeholder:text-white/60 font-sans text-sm focus:outline-none focus:border-white/80 transition-all"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-sans font-bold text-white/90">
              {lang === "ar" ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-2xl border border-white/30 bg-white/15 backdrop-blur-md text-white placeholder:text-white/60 font-sans text-sm focus:outline-none focus:border-white/80 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-sans font-bold text-white/90">
              {lang === "ar" ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 pr-10 rounded-2xl border border-white/30 bg-white/15 backdrop-blur-md text-white placeholder:text-white/60 font-sans text-sm focus:outline-none focus:border-white/80 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-white/70 hover:text-white p-1"
                aria-label="Toggle Password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Submit Button using Button component */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full h-13 mt-2 rounded-2xl bg-brand-neutral-950 hover:bg-brand-neutral-900 text-white font-sans font-bold text-sm shadow-xl justify-center"
          >
            {loading
              ? lang === "ar" ? "جاري المعالجة..." : "Processing..."
              : mode === "login"
              ? lang === "ar" ? "تسجيل الدخول" : "Sign In"
              : lang === "ar" ? "إنشاء حساب" : "Create Account"}
          </Button>
        </form>

        {/* Switch Mode */}
        <div className="flex items-center justify-center gap-1.5 pt-4 text-xs font-sans">
          <span className="text-white/80">
            {mode === "login"
              ? lang === "ar" ? "ليس لديكِ حساب؟" : "Don't have an account?"
              : lang === "ar" ? "لديكِ حساب بالفعل؟" : "Already have an account?"}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setErrorMsg("");
            }}
            className="font-bold text-white underline hover:text-white/80 cursor-pointer"
          >
            {mode === "login"
              ? lang === "ar" ? "سجّلي الآن" : "Sign Up"
              : lang === "ar" ? "سجّلي الدخول" : "Sign In"}
          </button>
        </div>

        {/* Continue as Guest */}
        <div className="pt-6">
          <Link
            href="/"
            className="text-xs font-sans font-bold text-white/80 hover:text-white transition-colors underline"
          >
            {lang === "ar" ? "تصفح كزائر دون تسجيل دخول" : "Continue as Guest"}
          </Link>
        </div>
      </div>
    </div>
  );
}
