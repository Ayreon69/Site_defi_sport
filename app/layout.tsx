import "@/styles/globals.css";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Sport Chart Dashboard",
  description: "Dashboard performance sportive avec realisation/previsionnel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="glass-nav fixed inset-x-0 top-0 z-50">
          <div className="container-shell flex h-16 items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Performance Suite</p>
              <p className="font-display text-sm font-semibold text-ink">Sport Dashboard</p>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}
