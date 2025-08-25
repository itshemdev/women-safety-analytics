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
  },
  manifest: "/manifest.json",
  themeColor: "#dc2626",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Women Safety App",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Women Safety App",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Women Safety App" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
