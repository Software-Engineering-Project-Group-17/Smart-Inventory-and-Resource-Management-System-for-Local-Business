import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Roboto_Mono,
  Heebo,
} from "next/font/google";
import { Playwrite_AU_QLD } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/navbar";

// Using Playwrite_AU_QLD for handwriting style
// This font is used for a more casual, handwritten look

const playwriteAuQld = Playwrite_AU_QLD({
  variable: "--font-playwrite-au-qld",
  weight: ["100", "200", "300", "400"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Inventory Management System",
  description:
    "Smart Inventory and Resource Management System for Local Business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${playwriteAuQld.variable} ${robotoMono.variable} ${heebo.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
