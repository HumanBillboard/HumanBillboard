import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeClient from "./theme/ThemeClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HumanBillboard",
  description: "Connecting advertisers and everyday promoters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeClient>{children}</ThemeClient>
      </body>
    </html>
  );
}
