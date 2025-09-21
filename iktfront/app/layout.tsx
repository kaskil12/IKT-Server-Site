import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar04Page from "@/components/navbar-04/navbar-04";
import Footer from "@/components/Footer/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IKTElvis",
  description: "IKTElvis - IKT Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-green-700 to-teal-900`}
      >
        <AuthProvider>
          <header>
            <Navbar04Page/>
          </header>
          
          {children}
          <Footer/>
        </AuthProvider>
      </body>
    </html>
  );
}
