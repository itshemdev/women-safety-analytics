import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Women Safety App - Stay Safe, Stay Connected",
  description:
    "A comprehensive safety app designed for women with real-time location tracking, emergency alerts, and community support features. Stay safe with location-based alerts and instant emergency contacts.",
  keywords: [
    "women safety",
    "safety app",
    "emergency alerts",
    "location tracking",
    "personal safety",
    "women empowerment",
    "safety features",
    "emergency contacts",
    "safety community",
  ],
  authors: [{ name: "Women Safety App Team" }],
  creator: "Women Safety App",
  publisher: "Women Safety App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Women Safety App - Stay Safe, Stay Connected",
    description:
      "A comprehensive safety app designed for women with real-time location tracking, emergency alerts, and community support features.",
    siteName: "Women Safety App",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Women Safety App - Stay Safe, Stay Connected",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Women Safety App - Stay Safe, Stay Connected",
    description:
      "A comprehensive safety app designed for women with real-time location tracking, emergency alerts, and community support features.",
    images: ["/og-image.png"],
    creator: "@womensafetyapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "safety",
  classification: "safety application",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Women Safety",
    "application-name": "Women Safety App",
    "msapplication-TileColor": "#ffffff",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#ffffff",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
