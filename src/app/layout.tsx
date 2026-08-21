import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blueprints Club | Professional Blueprint Printing",
  description: "High-quality blueprint printing for architects, engineers, and construction professionals in West Palm Beach, FL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
