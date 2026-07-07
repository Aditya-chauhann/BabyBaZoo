import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Babybazoo | Premium Baby Essentials",
  description: "Curated premium clothing, toys, and essentials for your baby.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable} min-h-full flex flex-col antialiased`}>
        <AppProvider>
          <Navbar />
          <div className="flex-grow pt-20">
            {children}
          </div>
          <Footer />
          <CartDrawer />
          <AuthModal />
        </AppProvider>
      </body>
    </html>
  );
}
