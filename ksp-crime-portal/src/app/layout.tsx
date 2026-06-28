import type { Metadata } from "next";
import "./globals.css";
import { KspProvider } from "@/store/KspContext";
import { ThemeProvider } from "@/store/ThemeContext";

export const metadata: Metadata = {
  title: "KSP Crime Intelligence & Analytics Platform",
  description: "Secure government intelligence platform for State Crime Records Bureau, district superintendents, and investigation officers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-theme="dark">
      <body className="min-h-full flex flex-col bg-bg-base text-text-primary transition-colors duration-300">
        <ThemeProvider>
          <KspProvider>{children}</KspProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
