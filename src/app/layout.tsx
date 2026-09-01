import type { Metadata, Viewport } from "next";
import { Cairo, Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { LocationProvider } from "@/context/LocationContext";
import { CartProvider } from "@/context/CartContext";
import { AppShell } from "@/components/layout/AppShell";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beleco — بيليكو",
  description: "اكتشفي أرقى تشكيلات العبايات والفساتين وتسوقي من شي إن وترينديول بسهولة",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Beleco",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#241A14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${fraunces.variable} ${manrope.variable}`}
    >
      <body className="antialiased font-sans" suppressHydrationWarning>
        <LanguageProvider>
          <LocationProvider>
            <AuthProvider>
              <ToastProvider>
                <ConfirmProvider>
                  <CartProvider>
                    <AppShell>{children}</AppShell>
                  </CartProvider>
                </ConfirmProvider>
              </ToastProvider>
            </AuthProvider>
          </LocationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
