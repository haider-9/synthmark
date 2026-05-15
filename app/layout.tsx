import type { Metadata, Viewport } from "next";
import {
  buildMetadata,
  organizationJsonLd,
  webApplicationJsonLd,
  SITE,
} from "@/lib/seo";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────────

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
      className="h-full antialiased dark"
      style={{
        "--font-sans": '"Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, sans-serif',
        "--font-mono": '"Fira Code", "SFMono-Regular", Consolas, ui-monospace, monospace',
      } as React.CSSProperties}
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
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />

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
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
