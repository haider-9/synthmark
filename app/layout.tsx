import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Fira_Code } from "next/font/google";
import {
  buildMetadata,
  organizationJsonLd,
  webApplicationJsonLd,
  SITE,
} from "@/lib/seo";
import "./globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

// ─── Viewport (manages <meta name="viewport"> and theme-color) ────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: SITE.themeColor,
  colorScheme: "dark",
};

// ─── Root metadata ────────────────────────────────────────────────────────────

export const metadata: Metadata = buildMetadata({
  title: "AI Annotation Platform",
  titleTemplate: "Synthmark — AI Annotation Platform",
  description:
    "Production-grade AI data annotation platform. Label images with polygons, bounding boxes and keypoints at scale — built for ML teams.",
  path: "/",
});

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${firaCode.variable} h-full antialiased`}
    >
      <head>
        {/* Browser chrome / PWA */}
        <meta name="theme-color" content={SITE.themeColor} />
        <meta name="color-scheme" content="dark" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Structured data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />

        {/* Structured data — SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webApplicationJsonLd()),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
