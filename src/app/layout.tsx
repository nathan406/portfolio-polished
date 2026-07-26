import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "../../public/fonts/Inter.woff2",
  display: "swap",
  variable: "--font-inter",
  weight: "100 900",
});

const spaceGrotesk = localFont({
  src: "../../public/fonts/SpaceGrotesk.woff2",
  display: "swap",
  variable: "--font-space-grotesk",
  weight: "300 700",
});

const jetbrainsMono = localFont({
  src: "../../public/fonts/JetBrainsMono.woff2",
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: "100 800",
});

export const metadata: Metadata = {
  title: "Nathan Muyoba | Fullstack Developer",
  description: "Portfolio of Nathan Muyoba - Fullstack Web Developer showcasing projects and skills",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-bg text-text-primary antialiased">
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
