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
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
