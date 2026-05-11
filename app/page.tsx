import type { Metadata } from "next";
import Link from "next/link";
import {
  Hexagon,
  Zap,
  Users,
  Shield,
  GitBranch,
  Download,
  Check,
  ChevronDown,
  PenTool,
  Briefcase,
  CheckSquare,
  Eye,
  Star,
} from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

// ─── SEO ──────────────────────────────────────────────────────────────────────

export const metadata: Metadata = buildMetadata({
  title: "AI Data Annotation Platform for ML Teams",
  titleTemplate: "Synthmark — Annotate smarter. Ship AI faster.",
  description:
    "The professional data annotation platform for ML teams. Label images with precision polygon, bounding box and keypoint tools. AI auto-labeling, role-based workflows, export to COCO/YOLO.",
  path: "/",
  keywords: [
    "annotation platform",
    "data labeling",
    "ML dataset tool",
    "polygon segmentation",
    "computer vision annotation",
    "AI training data",
  ],
});

// ─── Editor preview ───────────────────────────────────────────────────────────

function EditorPreview() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card select-none">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 h-9 bg-muted border-b border-border">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-muted text-muted-foreground text-[10px] font-mono px-3 py-0.5 rounded-md">
            app.synthmark.ai/project/cv-pedestrian
          </div>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex">
        {/* Canvas area */}
        <div className="flex-1 overflow-hidden">
          <svg viewBox="0 0 520 320" className="w-full h-auto block">
            <defs>
              <pattern
                id="ep-grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.4"
                  opacity="0.08"
                />
              </pattern>
            </defs>

            {/* Background */}
            <rect width="520" height="320" fill="#09090f" />
            {/* Grid */}
            <rect width="520" height="320" fill="url(#ep-grid)" />

            {/* Person polygon — 8-point body silhouette */}
            <polygon
              points="152,52 178,37 208,46 218,96 212,150 199,184 167,184 156,150"
              fill="#5B8AF0"
              fillOpacity="0.15"
              stroke="#5B8AF0"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Vertex dots — first dot is active (white) */}
            <circle cx="152" cy="52" r="3.5" fill="#ffffff" />
            <circle cx="178" cy="37" r="3.5" fill="#5B8AF0" />
            <circle cx="208" cy="46" r="3.5" fill="#5B8AF0" />
            <circle cx="218" cy="96" r="3.5" fill="#5B8AF0" />
            <circle cx="212" cy="150" r="3.5" fill="#5B8AF0" />
            <circle cx="199" cy="184" r="3.5" fill="#5B8AF0" />
            <circle cx="167" cy="184" r="3.5" fill="#5B8AF0" />
            <circle cx="156" cy="150" r="3.5" fill="#5B8AF0" />
            {/* Active vertex dashed ring */}
            <circle
              cx="152"
              cy="52"
              r="9"
              fill="none"
              stroke="#5B8AF0"
              strokeWidth="1"
              strokeDasharray="3 2"
            />

            {/* Bounding box — vehicle, green dashed */}
            <rect
              x="260"
              y="104"
              width="178"
              height="122"
              fill="none"
              stroke="#22C55E"
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />
            {/* Corner handle squares */}
            <rect x="256" y="100" width="8" height="8" fill="#22C55E" />
            <rect x="430" y="100" width="8" height="8" fill="#22C55E" />
            <rect x="256" y="218" width="8" height="8" fill="#22C55E" />
            <rect x="430" y="218" width="8" height="8" fill="#22C55E" />

            {/* person_01 label tag */}
            <rect
              x="149"
              y="190"
              width="72"
              height="17"
              rx="3"
              fill="#5B8AF0"
            />
            <text
              x="185"
              y="202"
              fill="white"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
            >
              person_01
            </text>

            {/* vehicle_03 label tag */}
            <rect
              x="258"
              y="230"
              width="78"
              height="17"
              rx="3"
              fill="#22C55E"
            />
            <text
              x="297"
              y="242"
              fill="white"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
            >
              vehicle_03
            </text>

            {/* AI Confidence chip — top-right of SVG */}
            <rect
              x="346"
              y="11"
              width="136"
              height="22"
              rx="4"
              fill="#13131f"
              stroke="#2a2a3a"
              strokeWidth="1"
            />
            <circle cx="361" cy="22" r="3.5" fill="#22C55E" fillOpacity="0.8" />
            <text
              x="422"
              y="26"
              fill="#888888"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
            >
              AI Confidence 94.7%
            </text>

            {/* Faint image content indicators — background shapes */}
            <ellipse
              cx="348"
              cy="172"
              rx="36"
              ry="22"
              fill="#1a1a2e"
              opacity="0.5"
            />
            <rect
              x="286"
              y="130"
              width="110"
              height="70"
              rx="4"
              fill="#0d1a24"
              opacity="0.4"
            />
            <rect
              x="295"
              y="145"
              width="28"
              height="16"
              rx="2"
              fill="#1a2434"
              opacity="0.6"
            />
            <rect
              x="330"
              y="145"
              width="58"
              height="8"
              rx="2"
              fill="#1a2434"
              opacity="0.4"
            />
            <rect
              x="295"
              y="168"
              width="94"
              height="6"
              rx="2"
              fill="#1a2434"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* Properties sidebar */}
        <div className="w-[140px] bg-card border-l border-border flex flex-col shrink-0">
          <div className="px-3 pt-3 pb-2">
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
              Properties
            </p>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
            <span className="text-[10px] text-muted-foreground font-mono">Class</span>
            <span className="text-[10px] font-semibold font-mono text-primary">
              person
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
            <span className="text-[10px] text-muted-foreground font-mono">Vertices</span>
            <span className="text-[10px] font-semibold font-mono text-muted-foreground">
              8
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
            <span className="text-[10px] text-muted-foreground font-mono">Conf.</span>
            <span className="text-[10px] font-semibold font-mono text-[#22C55E]">
              94.7%
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
            <span className="text-[10px] text-muted-foreground font-mono">Occluded</span>
            <span className="text-[10px] font-semibold font-mono text-muted-foreground">
              No
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
            <span className="text-[10px] text-muted-foreground font-mono">Truncated</span>
            <span className="text-[10px] font-semibold font-mono text-muted-foreground">
              No
            </span>
          </div>
          <div className="px-3 pt-3 pb-1.5">
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground font-semibold mb-2">
              Label Class
            </p>
            <div className="rounded bg-muted border border-border px-2 py-1">
              <span className="text-[9px] text-muted-foreground font-mono">
                person_01
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 h-7 bg-muted border-t border-border">
        <span className="text-[10px] text-muted-foreground font-mono">
          Polygon · 3 selected · 847 objects
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">128%</span>
      </div>
    </div>
  );
}

// ─── Star SVG ─────────────────────────────────────────────────────────────────

function FilledStar() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 text-amber-400"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-background text-white min-h-screen overflow-x-hidden">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: "Home", path: "/" }]),
          ),
        }}
      />

      <LandingNav />

      {/* ─── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — text */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-5">
              AI Annotation Platform
            </p>
            <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.08]">
              Label training data.
              <br />
              Ship AI faster.
            </h1>
            <p className="text-[17px] text-muted-foreground leading-relaxed mt-5 max-w-md">
              The annotation workspace built for ML teams. Precision polygon
              tools, AI-assisted labeling, role-based workflows, and one-click
              export.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-9">
              <Link
                href="/auth/sign-up"
                className="bg-white text-black hover:bg-muted px-6 py-3 rounded-lg font-semibold text-sm inline-flex items-center gap-1.5 transition-colors"
              >
                Get started free
              </Link>
              <Link
                href="/project/sample-project"
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg border border-border text-muted-foreground hover:text-white hover:border-border text-sm font-medium transition-colors"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polygon points="2,2 14,2 14,14 2,14" fill="none" />
                  <polyline
                    points="5,6 5,10 9,8"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
                Try the editor
              </Link>
              <Link
                href="/auth/sign-in"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Sign in →
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 mt-10 pt-10 border-t border-border">
              <div>
                <p className="text-xl font-bold text-white">1.2M+</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Annotations created
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-xl font-bold text-white">500+</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Teams worldwide
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-xl font-bold text-white">99.9%</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">Uptime SLA</p>
              </div>
            </div>
          </div>

          {/* Right — editor preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-2xl pointer-events-none" />
            <EditorPreview />
          </div>
        </div>
      </section>

      {/* ─── 2. TRUSTED-BY STRIP ─────────────────────────────────────────── */}
      <div className="border-y border-border py-8 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold shrink-0">
            Trusted by AI teams at
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 sm:gap-9">
            <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-default">
              Voyage AI
            </span>
            <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-default">
              Luminary Health
            </span>
            <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-default">
              Orbital Vision
            </span>
            <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-default">
              DeepSight Labs
            </span>
            <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-default">
              Nexus Robotics
            </span>
            <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-default">
              Axon Research
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-4">
              Features
            </p>
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Built for production
              <br />
              annotation workflows.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg text-[15px] leading-relaxed">
              Every tool your team needs to build high-quality training datasets
              — from raw images to export-ready annotations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            <div className="bg-background p-7 hover:bg-muted transition-colors">
              <Hexagon className="h-5 w-5 text-muted-foreground mb-5" />
              <h3 className="text-[14px] font-semibold text-white mb-2">
                Polygon &amp; Bounding Box
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Precision polygon segmentation, axis-aligned and rotated
                bounding boxes, keypoints, and polylines in one canvas.
              </p>
            </div>

            <div className="bg-background p-7 hover:bg-muted transition-colors">
              <Zap className="h-5 w-5 text-muted-foreground mb-5" />
              <h3 className="text-[14px] font-semibold text-white mb-2">
                AI Auto-labeling
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                One-click AI pre-annotation across your entire dataset. Review,
                correct, and accept — typically 80%+ accurate out of the box.
              </p>
            </div>

            <div className="bg-background p-7 hover:bg-muted transition-colors">
              <Users className="h-5 w-5 text-muted-foreground mb-5" />
              <h3 className="text-[14px] font-semibold text-white mb-2">
                Team Collaboration
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Multiple annotators work on the same dataset simultaneously with
                presence indicators and conflict resolution.
              </p>
            </div>

            <div className="bg-background p-7 hover:bg-muted transition-colors">
              <Shield className="h-5 w-5 text-muted-foreground mb-5" />
              <h3 className="text-[14px] font-semibold text-white mb-2">
                Role-based Access
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Five roles with precisely scoped permissions — Admin, Project
                Manager, Annotator, Reviewer, and Viewer.
              </p>
            </div>

            <div className="bg-background p-7 hover:bg-muted transition-colors">
              <GitBranch className="h-5 w-5 text-muted-foreground mb-5" />
              <h3 className="text-[14px] font-semibold text-white mb-2">
                Version History
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Every change is tracked. Jump to any prior state with unlimited
                undo/redo and a complete commit history.
              </p>
            </div>

            <div className="bg-background p-7 hover:bg-muted transition-colors">
              <Download className="h-5 w-5 text-muted-foreground mb-5" />
              <h3 className="text-[14px] font-semibold text-white mb-2">
                Export Formats
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                COCO JSON, YOLO v5–v10, Pascal VOC, TFRecord, CSV — export in
                any format your pipeline expects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. PRECISION TOOLS ──────────────────────────────────────────── */}
      <section className="py-24 px-5 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-4">
              Annotation Tools
            </p>
            <h2 className="text-4xl font-bold text-white tracking-tight leading-[1.1]">
              Every tool you need.
              <br />
              At sub-pixel precision.
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed mt-5 max-w-md">
              Our canvas is built from scratch for annotation — not adapted from
              a generic drawing library. Hardware-accelerated rendering keeps
              the UI responsive even at 10,000+ objects.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Polygon segmentation with vertex insert, split & merge",
                "Axis-aligned and rotated bounding boxes",
                "Keypoints with skeleton linking",
                "Multi-class labeling, unlimited classes",
                "Lock annotations against edits",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[14px] text-muted-foreground"
                >
                  <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <Link
                href="/auth/sign-up"
                className="bg-white text-black hover:bg-muted px-6 py-3 rounded-lg font-semibold text-sm inline-flex items-center gap-1.5 transition-colors"
              >
                Try the tools free →
              </Link>
            </div>
          </div>

          {/* Right — 2×2 tool cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border rounded-xl p-5 bg-card">
              <PenTool className="h-5 w-5 text-muted-foreground mb-3" />
              <p className="text-[13px] font-semibold text-white">Polygon</p>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                Click-to-add vertices, drag to adjust, Ctrl+Z to undo any point.
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 bg-card">
              <Hexagon className="h-5 w-5 text-muted-foreground mb-3" />
              <p className="text-[13px] font-semibold text-white">Box</p>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                Drag to draw axis-aligned or rotated boxes with aspect-ratio
                lock.
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 bg-card">
              <GitBranch className="h-5 w-5 text-muted-foreground mb-3" />
              <p className="text-[13px] font-semibold text-white">Keypoint</p>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                Place joint keypoints and connect them via configurable skeleton
                templates.
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 bg-card">
              <Zap className="h-5 w-5 text-muted-foreground mb-3" />
              <p className="text-[13px] font-semibold text-white">AI Assist</p>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                Segment Anything integration — click a point and let the model
                outline the shape.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. ROLES ────────────────────────────────────────────────────── */}
      <section id="roles" className="py-24 px-5 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Five roles. One platform.
            </h2>
            <p className="text-[15px] text-muted-foreground mt-3 max-w-lg leading-relaxed">
              Every team member gets exactly the scoped access they need — no
              over-provisioned permissions, no friction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="border border-border rounded-xl p-5 hover:border-border transition-colors">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <p className="text-[13.5px] font-semibold text-white mt-4">
                Admin
              </p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">Full control</p>
              <p className="text-[12px] text-muted-foreground mt-3 leading-relaxed">
                Manages billing, team members, SSO settings, and all project
                data across the workspace.
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 hover:border-border transition-colors">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <p className="text-[13.5px] font-semibold text-white mt-4">
                Project Manager
              </p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">Owns projects</p>
              <p className="text-[12px] text-muted-foreground mt-3 leading-relaxed">
                Creates projects, assigns annotators, configures label schemas,
                and tracks progress.
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 hover:border-border transition-colors">
              <PenTool className="h-5 w-5 text-muted-foreground" />
              <p className="text-[13.5px] font-semibold text-white mt-4">
                Annotator
              </p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">Labels data</p>
              <p className="text-[12px] text-muted-foreground mt-3 leading-relaxed">
                Draws annotations on assigned tasks. Cannot view other
                annotators' work or export data.
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 hover:border-border transition-colors">
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
              <p className="text-[13.5px] font-semibold text-white mt-4">
                Reviewer
              </p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">QA annotations</p>
              <p className="text-[12px] text-muted-foreground mt-3 leading-relaxed">
                Accepts, rejects, or corrects submitted annotations. Flags
                ambiguous labels for discussion.
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 hover:border-border transition-colors">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <p className="text-[13.5px] font-semibold text-white mt-4">
                Viewer
              </p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Read-only access
              </p>
              <p className="text-[12px] text-muted-foreground mt-3 leading-relaxed">
                Browses datasets and annotation results. Ideal for stakeholders
                and model training engineers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. PRICING ──────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="py-24 px-5 lg:px-8 border-t border-border"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Simple pricing. Scale as you grow.
            </h2>
            <p className="text-[15px] text-muted-foreground mt-3 leading-relaxed">
              No hidden fees. No annotation limits on Enterprise. Cancel any
              time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Starter */}
            <div className="rounded-xl border border-border bg-card p-7 flex flex-col">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
                Starter
              </p>
              <p className="text-4xl font-bold text-white mt-3">Free</p>
              <p className="text-[12px] text-muted-foreground mt-1">forever</p>
              <p className="text-[13px] text-muted-foreground mt-3 leading-relaxed">
                Solo researchers and small experiments.
              </p>
              <Link
                href="/auth/sign-up"
                className="mt-6 w-full text-center px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-white hover:border-border text-sm font-semibold transition-colors"
              >
                Get started free
              </Link>
              <ul className="mt-7 space-y-2.5 flex-1">
                {[
                  "1 project",
                  "5k annotations / mo",
                  "1 user",
                  "All drawing tools",
                  "COCO & YOLO export",
                  "Community support",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-[13px] text-muted-foreground"
                  >
                    <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-xl border border-border bg-card p-7 flex flex-col relative">
              <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
                Pro
              </p>
              <p className="text-4xl font-bold text-white mt-3">$29</p>
              <p className="text-[12px] text-muted-foreground mt-1">per seat / month</p>
              <p className="text-[13px] text-muted-foreground mt-3 leading-relaxed">
                Growing ML teams.
              </p>
              <Link
                href="/auth/sign-up"
                className="mt-6 w-full text-center px-5 py-2.5 rounded-lg bg-white text-black hover:bg-muted text-sm font-semibold transition-colors"
              >
                Start 14-day trial
              </Link>
              <ul className="mt-7 space-y-2.5 flex-1">
                {[
                  "Unlimited projects",
                  "100k annotations / mo",
                  "Up to 10 seats",
                  "AI auto-labeling (500 imgs/mo)",
                  "All export formats",
                  "Role-based access",
                  "Priority support",
                  "90-day history",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-[13px] text-muted-foreground"
                  >
                    <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise */}
            <div className="rounded-xl border border-border bg-card p-7 flex flex-col">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
                Enterprise
              </p>
              <p className="text-4xl font-bold text-white mt-3">Custom</p>
              <p className="text-[12px] text-muted-foreground mt-1">annual</p>
              <p className="text-[13px] text-muted-foreground mt-3 leading-relaxed">
                Unlimited scale, SSO, SLAs.
              </p>
              <a
                href="mailto:sales@synthmark.ai"
                className="mt-6 w-full text-center px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-white hover:border-border text-sm font-semibold transition-colors"
              >
                Talk to sales
              </a>
              <ul className="mt-7 space-y-2.5 flex-1">
                {[
                  "Everything in Pro",
                  "Unlimited seats & annotations",
                  "Unlimited AI labeling",
                  "SSO / SAML",
                  "Dedicated success manager",
                  "Custom SLA",
                  "On-premise option",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-[13px] text-muted-foreground"
                  >
                    <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="py-24 px-5 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Loved by ML teams.
            </h2>
            <p className="text-[15px] text-muted-foreground mt-3">
              What teams shipping AI products say about Synthmark.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border rounded-xl p-6 bg-card">
              <div className="flex items-center gap-0.5">
                <FilledStar />
                <FilledStar />
                <FilledStar />
                <FilledStar />
                <FilledStar />
              </div>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed mt-3">
                "Synthmark cut our annotation time in half. The polygon tools
                are incredibly precise and AI pre-labeling means our team spends
                time on the hard cases, not the obvious ones."
              </p>
              <div className="flex items-center gap-3 mt-5">
                <div className="bg-muted border border-border text-muted-foreground text-[11px] font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  SC
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    Sarah Chen
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    ML Lead, Orbital Vision
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-xl p-6 bg-card">
              <div className="flex items-center gap-0.5">
                <FilledStar />
                <FilledStar />
                <FilledStar />
                <FilledStar />
                <FilledStar />
              </div>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed mt-3">
                "Role-based access was the feature that sold us. Our reviewers
                catch annotation errors before they ever hit training — dataset
                quality went up significantly."
              </p>
              <div className="flex items-center gap-3 mt-5">
                <div className="bg-muted border border-border text-muted-foreground text-[11px] font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  MW
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    Marcus Webb
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Director of AI, Luminary Health
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-xl p-6 bg-card">
              <div className="flex items-center gap-0.5">
                <FilledStar />
                <FilledStar />
                <FilledStar />
                <FilledStar />
                <FilledStar />
              </div>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed mt-3">
                "We migrated from a competitor in a weekend. YOLO export works
                perfectly and the real-time collaboration features have been
                transformative for our distributed team."
              </p>
              <div className="flex items-center gap-3 mt-5">
                <div className="bg-muted border border-border text-muted-foreground text-[11px] font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  PN
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    Priya Nair
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Research Engineer, DeepSight Labs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. FAQ ──────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-5 lg:px-8 border-t border-border">
        <div className="max-w-xl mx-auto">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Frequently asked.
            </h2>
          </div>

          <details className="group border-b border-border py-4">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="text-[14px] font-medium text-white">
                What annotation file formats does Synthmark export?
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-4 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="text-[13px] text-muted-foreground leading-relaxed mt-3 pr-8">
              We support COCO JSON, YOLO v5–v10, Pascal VOC XML, TFRecord, and
              CSV. Export any dataset in one click — your existing pipeline
              keeps working without modification.
            </p>
          </details>

          <details className="group border-b border-border py-4">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="text-[14px] font-medium text-white">
                How does AI auto-labeling work?
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-4 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="text-[13px] text-muted-foreground leading-relaxed mt-3 pr-8">
              Upload images and click Auto-label. Our models pre-annotate
              objects using your selected label classes. You review, correct,
              and accept — typically 80%+ accurate, requiring only a fraction of
              manual effort.
            </p>
          </details>

          <details className="group border-b border-border py-4">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="text-[14px] font-medium text-white">
                Can multiple annotators work on the same dataset simultaneously?
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-4 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="text-[13px] text-muted-foreground leading-relaxed mt-3 pr-8">
              Yes. Synthmark supports real-time collaborative annotation with
              presence indicators. Annotators are automatically assigned
              non-overlapping batches, and a conflict resolution system handles
              edge cases.
            </p>
          </details>

          <details className="group border-b border-border py-4">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="text-[14px] font-medium text-white">
                Is there a free plan, and does it require a credit card?
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-4 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="text-[13px] text-muted-foreground leading-relaxed mt-3 pr-8">
              Yes. The Starter plan is free forever with 1 project, 5,000
              annotations per month, and all drawing tools included. No credit
              card required to sign up.
            </p>
          </details>

          <details className="group border-b border-border py-4">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="text-[14px] font-medium text-white">
                How does role-based access control work?
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-4 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="text-[13px] text-muted-foreground leading-relaxed mt-3 pr-8">
              Synthmark has five roles: Admin, Project Manager, Annotator,
              Reviewer, and Viewer. Each role has precisely scoped permissions —
              for example, Reviewers can accept or reject annotations but cannot
              modify project settings or export data.
            </p>
          </details>
        </div>
      </section>

      {/* ─── 9. FINAL CTA BANNER ─────────────────────────────────────────── */}
      <section className="border-y border-border py-24 px-5 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Start annotating today.
          </h2>
          <p className="text-[16px] text-muted-foreground mt-4 leading-relaxed">
            Join 500+ ML teams building better training data with Synthmark.
            Free to start, scales with your team.
          </p>
          <div className="flex items-center justify-center gap-4 mt-9 flex-wrap">
            <Link
              href="/auth/sign-up"
              className="bg-white text-black hover:bg-muted px-7 py-3 rounded-lg font-semibold text-sm inline-flex items-center gap-1.5 transition-colors"
            >
              Get started free
            </Link>
            <a
              href="mailto:sales@synthmark.ai"
              className="border border-border text-muted-foreground hover:text-white hover:border-border px-7 py-3 rounded-lg text-sm font-semibold transition-colors"
            >
              Talk to sales
            </a>
          </div>
        </div>
      </section>

      {/* ─── 10. FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background px-5 lg:px-8 pt-16 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16 pb-12 border-b border-border">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Star className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold text-sm tracking-tight text-white">
                  synth<span className="text-primary">mark</span>
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[200px]">
                The professional data annotation platform for ML teams.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a
                  href="https://github.com/synthmark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-white hover:border-border transition-colors"
                  aria-label="GitHub"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/synthmark_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-white hover:border-border transition-colors"
                  aria-label="X / Twitter"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/synthmark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-white hover:border-border transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold mb-4">
                Product
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: "Features", href: "#features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Roles", href: "#roles" },
                  { label: "FAQ", href: "#faq" },
                  { label: "Changelog", href: "/changelog" },
                  { label: "Roadmap", href: "/roadmap" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold mb-4">
                Company
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: "About", href: "/about" },
                  { label: "Blog", href: "/blog" },
                  { label: "Careers", href: "/careers" },
                  { label: "Press", href: "/press" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold mb-4">
                Legal
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Cookie Policy", href: "/cookies" },
                  { label: "Security", href: "/security" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
            <p className="text-[12px] text-muted-foreground">
              © 2025 Synthmark, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2 bg-muted border border-border rounded-full px-3 py-1.5">
              <span className="bg-[#22C55E] rounded-full h-1.5 w-1.5 block" />
              <span className="text-[11px] text-muted-foreground">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
