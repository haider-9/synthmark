import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Authentication",
  noIndex: true,
  path: "/auth",
});

const FEATURES = [
  "Polygon, bounding box & keypoint annotation",
  "AI-assisted auto-labeling",
  "Role-based team access",
  "Version history & unlimited undo",
  "Export to COCO, YOLO, Pascal VOC",
];

const TESTIMONIAL = {
  quote:
    "Synthmark cut our labeling time in half. The workflow is exactly what a production ML team needs.",
  name: "Mia Kaufmann",
  role: "ML Lead, Voyage Autonomy",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark flex h-screen w-screen overflow-hidden bg-[#0d0d0d]">
      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[48%] flex-col justify-between border-r border-[#1f1f1f] bg-[#0a0a0a] p-12 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            aria-hidden="true"
          >
            <polygon
              points="3,17 2,11 6,5 16,5.5 20,11 16,18 6.5,18"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="11" cy="11" r="2.5" fill="white" />
          </svg>
          <span className="text-white font-semibold text-base tracking-tight select-none">
            synth<span className="text-[#4f8ef7]">mark</span>
          </span>
        </div>

        {/* Centre */}
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#555]">
              AI Annotation Platform
            </p>
            <h1 className="text-[2.6rem] font-bold leading-[1.1] text-white tracking-tight">
              Precision labeling
              <br />
              for serious ML teams.
            </h1>
            <p className="text-[15px] text-[#666] leading-relaxed max-w-sm">
              Label images with pro-grade tools, collaborate with your team, and
              export training data in any format.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center gap-3 text-[13.5px] text-[#888]"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
                  <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                    <path
                      d="M1 3l2 2 3-4"
                      stroke="white"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="border-t border-[#1a1a1a] pt-8 space-y-3">
          <p className="text-[13.5px] text-[#888] leading-relaxed italic">
            &ldquo;{TESTIMONIAL.quote}&rdquo;
          </p>
          <div>
            <p className="text-[12.5px] font-semibold text-[#bbb]">
              {TESTIMONIAL.name}
            </p>
            <p className="text-[11.5px] text-[#555]">{TESTIMONIAL.role}</p>
          </div>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-[#0d0d0d] px-6 py-12">
        {children}
      </div>
    </div>
  );
}
