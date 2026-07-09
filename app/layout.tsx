import type { Metadata } from "next";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "VultureX", template: "%s | VultureX" },
  description: "The network where startups meet investors. Show verified traction, get discovered, close deals.",
  openGraph: { title: "VultureX", description: "The network where startups meet investors.", siteName: "VultureX" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
