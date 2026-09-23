import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppLayoutWrapper } from "@/components";
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
  title: "PRISM — Anticipate Risks. Deliver a Stronger India. | MoSPI",
  description:
    "PRISM uses AI to analyse infrastructure projects from the PAIMANA dataset, predict risks, and enable data-driven decisions for faster, more successful outcomes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}

