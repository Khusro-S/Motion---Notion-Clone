import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/providers/convex-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Motion - Notion Clone",
  description: "The connected workspace where better, faster work happens.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme:light",
        url: "/motion-logo.svg",
        href: "/motion-logo.svg",
      },
      {
        media: "(prefers-color-scheme:dark",
        url: "/motion-logo-dark.svg",
        href: "/motion-logo-dark.svg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{
            elements: {
              modalBackdrop: "!bg-black/40 backdrop-blur-sm",
              // overlay: "bg-black/50",
            },
            layout: {
              shimmer: false,
            },
          }}
        >
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="motion-theme"
            >
              <Toaster
                position="top-right"
                closeButton
                // richColors
                visibleToasts={5}
                theme="dark"
              />
              {children}
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
