import "../css/globals.css";
import "../css/scn.css";
import ThemeButton from "@/components/ThemeButton";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "NexxSongs", template: "%s | NexxSongs" },
  description: "Look up metadata and lyrics for songs with ease",
  themeColor: "#e2e8f0",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <meta name="darkreader-lock" />
      <body className={inter.className}>
        <ThemeButton />
        <main className="w-full h-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex min-h-screen flex-col items-center justify-center p-24 md:p-10 sm:p-0 gap-3">
          {children}
        </main>
      </body>
    </html>
  );
}
