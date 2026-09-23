import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar, Topbar } from "@/components";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PRISM — Predictive Risk Intelligence for Smart Monitoring | MoSPI",
  description:
    "AI intelligence layer for PAIMANA/OCMS project monitoring data. SIH 2026 Executive Prototype.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Topbar />
            <main className="page-body">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
