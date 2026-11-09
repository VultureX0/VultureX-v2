import type { Metadata } from "next";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "VultureX", template: "%s | VultureX" },
  description: "The network where startups meet investors. Show verified traction, get discovered, close deals.",
  openGraph: { title: "VultureX", description: "The network where startups meet investors.", siteName: "VultureX" },
};

/**
 * Applies the saved theme before the first paint so a light-mode visitor never
 * sees a flash of the dark palette. Dark stays the default, matching the
 * application's existing look for anyone with no saved preference.
 */
const themeScript = `(function(){try{var saved=localStorage.getItem("vx-theme");var theme=saved==="light"||saved==="dark"?saved:"dark";var root=document.documentElement;root.classList.toggle("dark",theme==="dark");root.style.colorScheme=theme;}catch(e){document.documentElement.classList.add("dark");}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
