import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/hooks/use-toast";
import { Toast } from "@/components/toast";
import FeatureSpotlight from "@/components/feature-spotlight";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PreviewProvider } from "@/components/video-card";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SexCity Hub - Free Adult Videos and XXX Content",
    template: "%s | SexCity Hub",
  },
  description: "SexCity Hub is a premium adult entertainment platform. Watch, upload and share high-quality adult videos. Discover the best XXX content online with our vast collection.",
  keywords: "adult videos, xxx videos, porn, adult content, sex videos, free porn, adult entertainment, sex videos online",
  applicationName: "SexCity Hub",
  metadataBase: new URL("https://sexcityhub.com"),
  alternates: {
    canonical: "https://sexcityhub.com",
  },
  verification: {
    google: "GERu76_vgE0H7_B8F48rrLB979IGTNNbV9kh81A77fs"
  },
  openGraph: {
    title: "SexCity Hub - Premium Adult Entertainment Platform",
    description: "Watch, upload and share high-quality adult videos. Discover the best XXX content online with our vast collection.",
    url: "https://sexcityhub.com",
    siteName: "SexCity Hub",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SexCity Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SexCity Hub - Premium Adult Entertainment",
    description: "Watch, upload and share high-quality adult videos. Discover the best XXX content online.",
    images: ["/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/main-logo.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  generator: "Next.js",
  category: "adult entertainment",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      appearance={{
        elements: {
          loadingScreen: "hidden",
          rootBox: "hidden",
        }
      }}
    >
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <body className={cn(inter.className, "min-h-screen bg-background")}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <TooltipProvider>
              <ToastProvider>
                <SmoothScrollProvider>
                  <PreviewProvider>
                    <div className="min-h-screen flex flex-col">
                      <main className="flex-1 overflow-y-auto">
                        {children}
                      </main>
                      <Footer />
                      <BackToTop />
                      <Toast />
                      <FeatureSpotlight />
                    </div>
                  </PreviewProvider>
                </SmoothScrollProvider>
                <Toaster />
                {/* Temporarily disable UI Toaster until import issue is resolved */}
                {/* <UIToaster /> */}
              </ToastProvider>
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
