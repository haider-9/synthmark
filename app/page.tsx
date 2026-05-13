import type { Metadata } from "next";
import Link from "next/link";
import {
  Hexagon,
  Zap,
  Users,
  Shield,
  GitBranch,
  Check,
  ChevronDown,
  PenTool,
  Briefcase,
  CheckSquare,
  Eye,
  Star,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  Cpu,
  Globe,
  Lock,
  Workflow,
  MousePointer2,
  Dot,
  Pencil,
  Eraser,
  Hand,
  Square,
  CircleIcon,
  Circle,
} from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Precision Data Annotation for Elite ML Teams",
  titleTemplate: "Synthmark — Label smarter. Ship AI faster.",
  description:
    "The professional-grade data annotation platform. High-performance canvas, AI-assisted labeling, and enterprise-level workflows for modern computer vision teams.",
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

function EditorPreview() {
  return (
    <div className="relative group perspective-1000">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="relative rounded-2xl border border-white/[0.08] bg-[#09090f]/80 backdrop-blur-3xl overflow-hidden shadow-2xl transition-all duration-700 hover:scale-[1.01] rotate-y-n2 rotate-x-1">
        <div className="flex items-center justify-between px-4 h-10 border-b border-white/[0.05] bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white/5 text-white/30 text-[10px] font-mono px-3 py-0.5 rounded-md">
              synthmark.ai/p/autonomous-driving
            </div>
          </div>
        </div>

        <div className="flex h-[400px]">
          <div className="w-14 border-r border-white/[0.05] flex flex-col items-center py-4 gap-4 bg-white/[0.01]">
            {[MousePointer2, Hexagon, Dot, Pencil, Eraser].map((Icon, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${i === 1 ? "bg-primary/20 text-primary border border-primary/20" : "text-white/20 hover:text-white/50 hover:bg-white/[0.03]"}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            ))}
          </div>

          <div className="flex-1 relative overflow-hidden bg-black/40">
            <svg viewBox="0 0 600 400" className="w-full h-full">
              <defs>
                <pattern
                  id="grid-p"
                  width="30"
                  height="30"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 30 0 L 0 0 0 30"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                    opacity="0.05"
                  />
                </pattern>
                <linearGradient
                  id="poly-grad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-p)" />

              <polygon
                points="180,80 260,60 320,100 340,200 300,300 200,320 150,220"
                fill="url(#poly-grad)"
                stroke="#3b82f6"
                strokeWidth="2"
                className="animate-pulse"
                style={{ animationDuration: "4s" }}
              />

              {[
                [180, 80],
                [260, 60],
                [320, 100],
                [340, 200],
                [300, 300],
                [200, 320],
                [150, 220],
              ].map(([x, y], i) => (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    fill={i === 0 ? "white" : "#3b82f6"}
                  />
                  {i === 0 && (
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      className="animate-spin-slow"
                    />
                  )}
                </g>
              ))}

              <g transform="translate(140, 210)">
                <rect width="70" height="18" rx="4" fill="#3b82f6" />
                <text
                  x="35"
                  y="12"
                  fill="white"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  pedestrian_01
                </text>
              </g>

              <foreignObject x="400" y="20" width="160" height="60">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                      AI Conf.
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      98.2%
                    </span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[98%] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
              </foreignObject>
            </svg>
          </div>

          <div className="w-48 border-l border-white/[0.05] bg-white/[0.01] p-4 flex flex-col gap-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-3">
                Attributes
              </p>
              <div className="space-y-2">
                {[
                  { label: "Occluded", value: "No" },
                  { label: "Truncated", value: "Partial" },
                  { label: "Difficulty", value: "Easy" },
                ].map((attr) => (
                  <div
                    key={attr.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[10px] text-white/30">
                      {attr.label}
                    </span>
                    <span className="text-[10px] font-bold text-white/60">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <span className="text-[10px] font-bold text-primary">
                  Annotating Image 42/1,200
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-8 border-t border-white/[0.05] bg-white/[0.01] flex items-center justify-between px-4">
          <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
            Polygon Mode • Sub-pixel Precision • HW Accel
          </span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            <span className="text-[8px] font-mono text-white/20">
              LIVE: 00:12:44
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GridBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  );
}

function MeshGlow() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[160px] rounded-full animate-glow" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[160px] rounded-full animate-glow"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-purple-600/5 blur-[140px] rounded-full animate-glow"
        style={{ animationDelay: "-2s" }}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-[#030307] text-white min-h-screen selection:bg-blue-500/30 selection:text-blue-200 antialiased">
      <GridBackground />
      <MeshGlow />

      <div className="relative z-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              breadcrumbJsonLd([{ name: "Home", path: "/" }]),
            ),
          }}
        />

        <LandingNav />

        <section className="relative pt-48 pb-32 px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-10 animate-fade-in">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/60">
                Powered by SAM 2.0 & Segment Anything
              </span>
            </div>

            <h1 className="text-6xl lg:text-9xl font-black tracking-tight leading-[0.85] mb-10 text-gradient animate-fade-in-up relative">
              Annotate at <br />
            <span>Machine Speed.</span>
              <div className="absolute -bottom-4 left-0 right-0 h-5 bg-blue-600/20 blur-xl rounded-full" />
            </h1>

            <p className="text-xl lg:text-2xl text-white/40 leading-relaxed max-w-2xl font-medium mb-12 animate-fade-in-up delay-100">
              The high-performance workspace for elite computer vision teams.
              Precision tools, AI-orchestrated workflows, and enterprise scale.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-24 animate-fade-in-up delay-200">
              <Link
                href="/auth/sign-up"
                className="bg-white text-black hover:bg-white/90 px-10 py-5 rounded-full font-black text-lg inline-flex items-center gap-2 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.6)] hover:-translate-y-1 active:scale-95"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/project/sample-project"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full border border-white/10 bg-white/[0.02] text-white/70 hover:text-white hover:bg-white/[0.05] hover:border-white/20 text-lg font-bold transition-all backdrop-blur-xl"
              >
                Explore Sandbox
              </Link>
            </div>

            <div className="w-full max-w-5xl mx-auto animate-fade-in-up delay-300">
              <EditorPreview />
            </div>
          </div>
        </section>

        <div className="py-24 border-y border-white/[0.05] bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-px bg-white/10" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black">
                Pioneering AI with
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-between flex-1 gap-12 lg:gap-8">
              {[
                "Voyage",
                "Luminary",
                "Orbital",
                "DeepSight",
                "Axon",
                "Nexus",
              ].map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default"
                >
                  <div className="w-6 h-6 rounded-md bg-white/10" />
                  <span className="text-xl font-black tracking-tighter">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section
          id="features"
          className="py-40 px-6 lg:px-8 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-24 items-end mb-32">
              <div>
                <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-8">
                  Engineered for <br />
                  <span className="text-gradient">Accuracy.</span>
                </h2>
                <p className="text-xl text-white/40 font-medium leading-relaxed max-w-lg">
                  We've spent thousands of hours refining the interaction model
                  so your team can label with sub-pixel precision without the
                  fatigue.
                </p>
              </div>
              <div className="flex lg:justify-end">
                <div className="inline-flex items-center gap-8 px-8 py-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                  <div>
                    <p className="text-3xl font-black tabular-nums">98.2%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">
                      Mean IOU
                    </p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div>
                    <p className="text-3xl font-black tabular-nums">10x</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">
                      Faster Throughput
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Universal Canvas",
                  desc: "One viewport for every annotation type. Polygon, Box, Keypoint, and Line tools integrated into a unified hardware-accelerated engine.",
                  icon: Layers,
                },
                {
                  title: "Neural Orchestration",
                  desc: "SAM-powered pre-annotation that learns your dataset. Automate 90% of your labeling tasks with a single click.",
                  icon: Cpu,
                },
                {
                  title: "Live Sync",
                  desc: "Collaborate in real-time. Full conflict resolution, presence indicators, and live review feedback loops.",
                  icon: Users,
                },
                {
                  title: "Dataset Governance",
                  desc: "Enterprise-grade role management and security. Control every bit of your data with granular permission schemas.",
                  icon: Lock,
                },
                {
                  title: "Workflow Automation",
                  desc: "Custom pipelines to automate export, validation, and metadata enrichment. Scale from thousands to millions of images.",
                  icon: Workflow,
                },
                {
                  title: "ML-Ready Exports",
                  desc: "Native support for YOLO, COCO, VOC, and custom formats. Zero-overhead integration with your training pipelines.",
                  icon: Database,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-500">
                    <item.icon className="h-6 w-6 text-white/40 group-hover:text-primary transition-colors duration-500" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-primary transition-colors duration-500">
                    {item.title}
                  </h3>
                  <p className="text-white/30 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-40 px-6">
          <div className="max-w-5xl mx-auto rounded-[4rem] bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent border border-white/[0.1] p-16 lg:p-24 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-10">
                Ready to label <br />
                <span className="text-gradient">at scale?</span>
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <Link
                  href="/auth/sign-up"
                  className="bg-white text-black hover:bg-white/90 px-12 py-5 rounded-full font-black text-xl transition-all shadow-2xl shadow-white/10"
                >
                  Create Organization
                </Link>
                <a
                  href="mailto:sales@synthmark.ai"
                  className="px-12 py-5 rounded-full border border-white/10 bg-white/[0.02] text-white/70 hover:text-white hover:bg-white/[0.05] text-xl font-bold transition-all backdrop-blur-xl"
                >
                  Talk to Sales
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.05] bg-[#030307] px-6 lg:px-8 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-20 pb-20 border-b border-white/[0.05]">
              <div className="col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-white">
                    synth<span className="text-blue-500">mark</span>
                  </span>
                </div>
                <p className="text-white/30 font-medium leading-relaxed mb-10 max-w-[240px]">
                  Professional data annotation for high-growth ML teams.
                </p>
                <div className="flex items-center gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.05] flex items-center justify-center transition-colors cursor-pointer group"
                    >
                      <div className="w-4 h-4 rounded-sm bg-white/10 group-hover:bg-white/40 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              {[
                {
                  title: "Platform",
                  links: ["Features", "Security", "Workflows", "Integrations"],
                },
                {
                  title: "Company",
                  links: ["About Us", "Blog", "Customers", "Careers"],
                },
                {
                  title: "Legal",
                  links: [
                    "Privacy Policy",
                    "Terms of Service",
                    "Cookie Policy",
                    "GDPR",
                  ],
                },
              ].map((group) => (
                <div key={group.title}>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-8">
                    {group.title}
                  </p>
                  <ul className="space-y-4">
                    {group.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-white/30 hover:text-white font-medium transition-colors"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-12 flex flex-col sm:flex-row items-center justify-between gap-8">
              <p className="text-sm font-medium text-white/10">
                © 2026 Synthmark, Inc. Designed for the future of AI.
              </p>
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.05]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  Systems Fully Operational
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-fade-in-up { opacity: 0; animation: fade-in-up 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-n2:hover { transform: rotateY(-2deg); }
        .rotate-x-1:hover { transform: rotateX(1deg); }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .text-gradient {
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `,
        }}
      />
    </div>
  );
}
