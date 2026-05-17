import type { Metadata } from "next";

// ─── Site constants ───────────────────────────────────────────────────────────

export const SITE = {
  name: "Synthmark",
  tagline: "AI Annotation Platform",
  description:
    "Production-grade AI data annotation platform. Label images with polygons, bounding boxes and keypoints at scale — built for ML teams.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://synthmark.ai",
  twitterHandle: "@synthmark_ai",
  /** Resolved at runtime by Next.js from app/opengraph-image.tsx */
  ogImage: "/opengraph-image.png",
  themeColor: "oklch(0.6104 0.0767 299.7335)",
  locale: "en_US",
  founded: "2024",
  email: "hello@synthmark.ai",
} as const;

const DEFAULT_KEYWORDS = [
  "AI annotation platform",
  "data labeling tool",
  "image annotation",
  "polygon labeling",
  "bounding box annotation",
  "keypoint detection",
  "computer vision",
  "machine learning",
  "dataset management",
  "annotation workflow",
];

// ─── Metadata builder ─────────────────────────────────────────────────────────

export interface BuildMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  keywords?: string[];
  noIndex?: boolean;
  /** Override the full title — bypasses the default `"Page | Synthmark"` format */
  titleTemplate?: string;
}

export function buildMetadata({
  title,
  description = SITE.description,
  path = "/",
  ogImage = SITE.ogImage,
  keywords = [],
  noIndex = false,
  titleTemplate,
}: BuildMetadataOptions): Metadata {
  const pageTitle = titleTemplate ?? `${title} | ${SITE.name}`;
  const canonical = `${SITE.url}${path}`;
  const imageUrl = ogImage.startsWith("http")
    ? ogImage
    : `${SITE.url}${ogImage}`;

  return {
    // ── Core ──────────────────────────────────────────────────────────────
    title: pageTitle,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: SITE.name,
    metadataBase: new URL(SITE.url),

    // ── Canonical ─────────────────────────────────────────────────────────
    alternates: {
      canonical,
    },

    // ── Robots ────────────────────────────────────────────────────────────
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },

    // ── Open Graph ────────────────────────────────────────────────────────
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      siteName: SITE.name,
      locale: SITE.locale,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${title} — ${SITE.name}`,
          type: "image/png",
        },
      ],
    },

    // ── Twitter / X ───────────────────────────────────────────────────────
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      site: SITE.twitterHandle,
      creator: SITE.twitterHandle,
      images: [
        {
          url: imageUrl,
          alt: `${title} — ${SITE.name}`,
        },
      ],
    },

    // ── Site verification ─────────────────────────────────────────────────
    // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in your .env.local to activate.
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,

    // ── Format detection ──────────────────────────────────────────────────
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },

    // ── App / PWA hints ───────────────────────────────────────────────────
    applicationName: SITE.name,
    category: "technology",
    classification: "Business/Productivity",

    // ── Vendor-specific extras ────────────────────────────────────────────
    other: {
      "msapplication-TileColor": SITE.themeColor,
    },
  };
}

// ─── JSON-LD: Organization ────────────────────────────────────────────────────

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}/logo.png`,
      width: 512,
      height: 512,
    },
    description: SITE.description,
    foundingDate: SITE.founded,
    sameAs: [
      "https://twitter.com/synthmark_ai",
      "https://github.com/synthmark",
      "https://linkedin.com/company/synthmark",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@synthmark.ai",
        availableLanguage: "English",
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: SITE.email,
        availableLanguage: "English",
      },
    ],
  };
}

// ─── JSON-LD: SoftwareApplication ─────────────────────────────────────────────

export function webApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE.url}/#webapp`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    featureList: [
      "Polygon & freehand image annotation",
      "Bounding box and keypoint labeling",
      "AI-assisted auto-labeling",
      "Team collaboration with role-based access control",
      "Export to COCO, YOLO, and Pascal VOC formats",
    ],
    screenshot: `${SITE.url}/screenshots/editor.png`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier available — no credit card required.",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1200",
      bestRating: "5",
    },
  };
}

// ─── JSON-LD: BreadcrumbList ──────────────────────────────────────────────────

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  };
}

// ─── JSON-LD: FAQPage ─────────────────────────────────────────────────────────

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// ─── JSON-LD: Article (for future blog pages) ─────────────────────────────────

export function articleJsonLd(opts: {
  title: string;
  description: string;
  url: string;
  publishedTime: string;
  modifiedTime: string;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    datePublished: opts.publishedTime,
    dateModified: opts.modifiedTime,
    author: {
      "@type": "Person",
      name: opts.authorName,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
    },
    isPartOf: { "@id": `${SITE.url}/#webapp` },
  };
}

// ─── JSON-LD: WebPage — Home ──────────────────────────────────────────────────

export function landingPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE.url}/`,
    name: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    isPartOf: { "@id": `${SITE.url}/#webapp` },
    breadcrumb: breadcrumbJsonLd([{ name: "Home", path: "/" }]),
  };
}

// ─── JSON-LD: WebPage — Sign In ───────────────────────────────────────────────

export function signInPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE.url}/auth/sign-in`,
    name: `Sign In — ${SITE.name}`,
    description: `Sign in to your ${SITE.name} account to access your annotation projects.`,
    url: `${SITE.url}/auth/sign-in`,
    isPartOf: { "@id": `${SITE.url}/#webapp` },
    breadcrumb: breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Sign In", path: "/auth/sign-in" },
    ]),
  };
}

// ─── JSON-LD: WebPage — Sign Up ───────────────────────────────────────────────

export function signUpPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE.url}/auth/sign-up`,
    name: `Create Account — ${SITE.name}`,
    description: `Create your free ${SITE.name} account and start annotating datasets today.`,
    url: `${SITE.url}/auth/sign-up`,
    isPartOf: { "@id": `${SITE.url}/#webapp` },
    breadcrumb: breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Create Account", path: "/auth/sign-up" },
    ]),
  };
}
