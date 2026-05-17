import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  FileJson,
  Hexagon,
  Layers3,
  MousePointer2,
  PenTool,
  ShieldCheck,
  SquareDashedMousePointer,
  UsersRound,
} from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Synthmark | Computer Vision Annotation Workspace",
  titleTemplate: "Synthmark - Label, review, and ship vision datasets",
  description:
    "A focused annotation workspace for computer vision teams that need precise labels, reviewer control, and ML-ready dataset exports.",
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

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=85";

const LAB_IMAGE =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=85";

const WORKFLOW_IMAGE =
  "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1400&q=85";

const TRUSTED_BY = ["Northstar Labs", "VeloCity", "Datum Works", "Orbit Farm", "Foundry ML"];

const TOOLBAR = [
  { icon: MousePointer2, label: "Select" },
  { icon: SquareDashedMousePointer, label: "Box" },
  { icon: Hexagon, label: "Polygon" },
  { icon: PenTool, label: "Brush" },
  { icon: CircleDot, label: "Point" },
];

const FEATURES = [
  {
    icon: Layers3,
    title: "Annotation tools that stay out of the way",
    text: "Polygon, box, point, and classification workflows share one editor with predictable shortcuts and clear object history.",
  },
  {
    icon: ShieldCheck,
    title: "Review built into the dataset",
    text: "Queue assignments, compare label versions, and keep acceptance criteria visible before work reaches training.",
  },
  {
    icon: FileJson,
    title: "Exports your pipeline can actually use",
    text: "COCO, YOLO, VOC, and custom JSON mappings are shaped for training jobs instead of one-off hand cleanup.",
  },
  {
    icon: UsersRound,
    title: "Made for production teams",
    text: "Role controls, project activity, and performance views make it easier to coordinate labelers, reviewers, and ML leads.",
  },
];

const WORKFLOW_STEPS = [
  "Import images and label schemas",
  "Assign batches to specialists",
  "Review edge cases with context",
  "Export versioned training sets",
];

const ROLES = [
  {
    title: "Labeling Teams",
    description: "Fast keyboard-led tools, visible instructions, and fewer mode surprises during long sessions.",
    stat: "42%",
    statLabel: "less correction time",
  },
  {
    title: "Review Leads",
    description: "Spot drift, compare revisions, and send focused feedback without leaving the project view.",
    stat: "3.8x",
    statLabel: "review throughput",
  },
  {
    title: "ML Engineers",
    description: "Traceable versions, clean exports, and dataset metrics that make training runs easier to explain.",
    stat: "0",
    statLabel: "format rewrites",
  },
];

const FAQ = [
  {
    question: "Can Synthmark handle polygon segmentation and boxes in the same project?",
    answer:
      "Yes. Projects can combine annotation types with shared classes, attributes, review status, and export rules.",
  },
  {
    question: "Does the platform include AI-assisted labeling?",
    answer:
      "Yes, but it is treated as an assistant inside a controlled workflow. Review states and human edits remain first-class.",
  },
  {
    question: "Which export formats are supported?",
    answer:
      "Synthmark supports COCO, YOLO, VOC, and custom JSON exports for teams with internal training pipelines.",
  },
];

function AnnotationFrame() {
  return (
    <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-lg border border-primary-foreground/20 bg-card/80 shadow-2xl backdrop-blur">
      <div className="flex min-h-[360px] flex-col md:min-h-[500px]">
        <div className="flex h-11 items-center justify-between border-b border-border bg-card/90 px-3 text-card-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
            <span className="h-2.5 w-2.5 rounded-full bg-chart-4" />
            <span className="h-2.5 w-2.5 rounded-full bg-chart-3" />
          </div>
          <span className="hidden text-xs font-medium text-muted-foreground sm:block">
            city-run-0427 / review pass 03
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            18:24
          </div>
        </div>

        <div className="grid flex-1 grid-cols-[48px_1fr] md:grid-cols-[56px_1fr_220px]">
          <div className="flex flex-col items-center gap-2 border-r border-border bg-muted/80 py-3">
            {TOOLBAR.map((tool, index) => (
              <button
                key={tool.label}
                aria-label={tool.label}
                className={`flex h-9 w-9 items-center justify-center rounded-md border transition ${
                  index === 2
                    ? "border-primary/50 bg-primary text-primary-foreground"
                    : "border-border bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                type="button"
              >
                <tool.icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className="relative min-h-[318px] overflow-hidden bg-muted">
            <img
              alt="Autonomous vehicle street used as an annotation sample"
              className="h-full min-h-[318px] w-full object-cover opacity-90"
              src={HERO_IMAGE}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,10,7,0.42),transparent_34%,rgba(7,10,7,0.22))]" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 760 500">
              <polygon
                points="394,184 493,170 568,205 586,304 530,354 423,342 370,276"
                className="fill-primary/20 stroke-primary"
                strokeWidth="2.5"
              />
              <polyline
                points="128,293 240,269 310,297 302,356 154,368"
                className="fill-none stroke-destructive"
                strokeDasharray="7 7"
                strokeWidth="2.5"
              />
              <rect
                x="560"
                y="218"
                width="82"
                height="118"
                rx="3"
                className="fill-chart-5/15 stroke-chart-5"
                strokeWidth="2"
              />
              {[394, 493, 568, 586, 530, 423, 370].map((x, index) => {
                const y = [184, 170, 205, 304, 354, 342, 276][index];
                return <circle key={x} cx={x} cy={y} r="5" className="fill-primary" />;
              })}
            </svg>

            <div className="absolute left-4 top-4 rounded-md border border-border bg-card/85 px-3 py-2 text-card-foreground backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Active label
              </p>
              <p className="mt-1 text-sm font-semibold">vehicle.occluded</p>
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-md border border-primary/35 bg-card/85 px-3 py-2 text-sm font-semibold text-primary backdrop-blur">
              <BadgeCheck className="h-4 w-4" />
              Reviewer approved
            </div>
          </div>

          <aside className="hidden border-l border-border bg-card/95 p-4 text-card-foreground md:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              Quality panel
            </p>
            <div className="mt-4 space-y-3">
              {[
                ["Objects", "128"],
                ["Conflicts", "02"],
                ["Mean IOU", "98.1%"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-md bg-muted/70 px-3 py-2">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-md border border-border bg-muted/50 p-3">
              <p className="text-xs font-semibold text-foreground">Next action</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Recheck small objects near reflective surfaces before exporting batch.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ProductImage({
  src,
  label,
  title,
}: {
  src: string;
  label: string;
  title: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      <img alt={title} className="aspect-[4/3] w-full object-cover" src={src} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(9,11,8,0.74))]" />
      <div className="absolute bottom-4 left-4 right-4 text-on-image">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-image-muted">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold">{title}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", path: "/" }])),
        }}
      />

      <LandingNav />

      <section className="relative min-h-[88vh] overflow-hidden bg-background px-5 pb-10 pt-28 text-on-image md:px-8 lg:px-10">
        <img
          alt="Street scene used for computer vision annotation"
          className="absolute inset-0 h-full w-full object-cover opacity-72"
          src={HERO_IMAGE}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,16,12,0.94)_0%,rgba(13,16,12,0.66)_46%,rgba(13,16,12,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,var(--background))]" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-14">
          <div className="max-w-3xl pt-8 md:pt-14">
            <div className="mb-7 inline-flex items-center gap-2 border-l-2 border-accent bg-on-image/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-on-image-muted backdrop-blur">
              <Eye className="h-4 w-4 text-accent" />
              Vision datasets without the theatre
            </div>
            <h1 className="text-6xl font-semibold leading-[0.92] tracking-normal md:text-8xl lg:text-[9.5rem]">
              Synthmark
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-on-image-muted md:text-2xl md:leading-9">
              A focused annotation workspace for teams turning messy visual data into
              reviewed, versioned training sets.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground transition hover:bg-accent/90"
              >
                Start labeling
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/project/sample-project"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-on-image/25 bg-on-image/10 px-6 py-3.5 text-sm font-bold text-on-image backdrop-blur transition hover:bg-on-image/20"
              >
                Open sample project
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <AnnotationFrame />
        </div>
      </section>

      <section className="border-y border-border bg-background px-5 py-7 md:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Built for annotation teams at
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-foreground/65">
            {TRUSTED_BY.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-5 py-24 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Product surface
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
                Less prompt sparkle. More labeling control.
              </h2>
            </div>
            <p className="text-lg leading-8 text-muted-foreground">
              Synthmark is designed like production software: visible state, clean
              review paths, and interface density that helps operators work for hours
              without fighting the tool.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-border bg-card/70 p-6 shadow-sm"
              >
                <feature.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-7 text-xl font-semibold leading-7">{feature.title}</h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card px-5 py-24 text-card-foreground md:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Workflow
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
              From raw frames to training data, with fewer handoffs.
            </h2>
            <div className="mt-10 space-y-4">
              {WORKFLOW_STEPS.map((step, index) => (
                <div key={step} className="flex items-center gap-4 border-t border-border pt-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="text-lg text-card-foreground/80">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ProductImage src={LAB_IMAGE} label="Model feedback" title="Review label quality beside the dataset." />
            <ProductImage src={WORKFLOW_IMAGE} label="Operations" title="Coordinate batches across real project work." />
          </div>
        </div>
      </section>

      <section id="roles" className="px-5 py-24 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Teams
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
              One workspace for the people who touch the dataset.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {ROLES.map((role) => (
              <article key={role.title} className="rounded-lg border border-border bg-card p-7">
                <h3 className="text-2xl font-semibold">{role.title}</h3>
                <p className="mt-4 min-h-24 text-base leading-7 text-muted-foreground">{role.description}</p>
                <div className="mt-8 border-t border-border pt-5">
                  <p className="text-5xl font-semibold">{role.stat}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    {role.statLabel}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-muted px-5 py-24 md:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Pricing
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
              Start small. Keep the export history.
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Pricing is shaped around projects, collaborators, and review volume
              rather than vague usage drama.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                name: "Studio",
                price: "$29",
                description: "For small teams validating a labeling workflow.",
                items: ["5 active projects", "COCO and YOLO exports", "Basic review queues"],
              },
              {
                name: "Scale",
                price: "Custom",
                description: "For teams running production annotation operations.",
                items: ["Unlimited projects", "Role controls", "Custom exports", "Priority support"],
              },
            ].map((plan) => (
              <article key={plan.name} className="rounded-lg border border-border bg-card p-7">
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-5 text-5xl font-semibold">{plan.price}</p>
                <p className="mt-4 min-h-14 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                <ul className="mt-7 space-y-3">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-5 py-24 md:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              FAQ
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight">Practical answers.</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <article key={item.question} className="rounded-lg border border-border bg-card/70 p-6">
                <h3 className="text-lg font-semibold">{item.question}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-lg bg-primary px-6 py-12 text-primary-foreground md:px-10 lg:px-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-foreground/70">
                Ship the dataset
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
                Give your labeling team a workspace that feels built for the work.
              </h2>
            </div>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground transition hover:bg-accent/90"
            >
              Create workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative min-h-[520px] overflow-hidden border-t border-border bg-card px-5 py-24 text-card-foreground md:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--card)_0%,var(--muted)_48%,var(--background)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25" />
        <div className="absolute left-1/2 top-0 h-48 w-[70vw] -translate-x-1/2 bg-primary/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-[350px] max-w-7xl flex-col justify-between gap-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-start">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Synthmark
              </p>
              <h2 className="mt-5 text-5xl font-semibold leading-none tracking-normal md:text-7xl">
                End the labeling loop with cleaner datasets.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-muted-foreground lg:justify-self-end">
              Built for teams that need annotation, review, and export to feel like
              one disciplined workflow instead of a pile of disconnected tools.
            </p>
          </div>

          <div className="grid gap-10 border-t border-border pt-8 md:grid-cols-[1.2fr_1fr_auto] md:items-end">
            <div>
            <div className="flex items-center gap-3">
              <img alt="Synthmark" className="h-10 w-10 rounded-md" src="/logo.png" />
              <span className="text-xl font-semibold">synthmark</span>
            </div>
              <p className="mt-4 text-sm text-muted-foreground">(c) 2026 Synthmark, Inc.</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground md:justify-center">
              <a href="#features" className="hover:text-foreground">Features</a>
              <a href="#roles" className="hover:text-foreground">Roles</a>
              <a href="#pricing" className="hover:text-foreground">Pricing</a>
              <a href="#faq" className="hover:text-foreground">FAQ</a>
            </div>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-bold text-accent-foreground transition hover:bg-accent/90"
            >
              Create workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
