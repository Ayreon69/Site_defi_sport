import "@/styles/globals.css";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: {
    template: "%s | Sport Chart",
    default: "Sport Chart — Tableau de bord performance sportive",
  },
  description:
    "Suivi de progression sportive individuelle et collective : réalisation, prévisionnel, tendances et badges de performance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(_){}`,
          }}
        />
      </head>
      <body>
        <header className="glass-nav fixed inset-x-0 top-0 z-50">
          <div className="container-shell flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Performance Lab</p>
                <p className="font-display text-sm font-semibold text-ink">Sport Chart Analytics</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="pt-20 pb-8">{children}</div>
      </body>
    </html>
  );
}
