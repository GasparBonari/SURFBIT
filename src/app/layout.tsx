import type { Metadata, Viewport } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { StoreHydrator } from "@/components/StoreHydrator";
import { siteUrl } from "./siteUrl";
import "./globals.css";

const pixel = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "SURFBIT — More than a store. A world to explore.",
    template: "%s · SURFBIT",
  },
  description:
    "Explore a pixel-art beach town and shop surfboards, surf wear and gear from SURFBIT.",
};

export const viewport: Viewport = {
  themeColor: "#2fb3c6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${pixel.variable} ${body.variable}`}>
      <body>
        <StoreHydrator />
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
