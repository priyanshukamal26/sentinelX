import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GrainOverlay from "@/components/GrainOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SentinelX — AI Risk Manager for Indian COD E-Commerce",
  description:
    "Real-time RTO risk-scoring and defense-only prepaid conversion nudges for Indian COD e-commerce.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} h-full bg-black text-white`}
      style={{ background: "#000000", color: "#ffffff" }}
    >
      <body
        className="min-h-full flex flex-col bg-black text-white relative selection:bg-white/20 selection:text-white"
        style={{ background: "#000000", color: "#ffffff" }}
      >
        <GrainOverlay />
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
