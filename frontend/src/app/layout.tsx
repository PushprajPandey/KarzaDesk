import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary, GlobalErrorHandler } from "@/components/ErrorBoundary";
import { Layout } from "@/components/Layout";

export const metadata: Metadata = {
  title: "KarzaDesk",
  description: "KarzaDesk - Modern Loan Management Platform",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans bg-surface text-on-surface">
        <ErrorBoundary>
          <GlobalErrorHandler />
          <AuthProvider>
            <Layout>{children}</Layout>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
