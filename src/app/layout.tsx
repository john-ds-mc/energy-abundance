import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ENERGY ABUNDANCE | UK Policy Strategy Game",
  description:
    "Can you steer Britain to energy abundance? An interactive strategy game modelling UK nuclear, renewables, AI, and fiscal policy over 10 years.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "ENERGY ABUNDANCE | UK Policy Strategy Game",
    description:
      "Steer Britain to energy abundance. Build nuclear, reform welfare, attract AI investment — every decision has consequences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ background: "#050a12", color: "#e8ecf2" }}
      >
        {children}
      </body>
    </html>
  );
}
