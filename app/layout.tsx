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
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Performance Lab</p>
                <p className="font-display text-sm font-semibold text-ink">Sport Chart Analytics</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="pt-20 pb-8">
          {children}
        </div>
      </body>
    </html>
  );
}
