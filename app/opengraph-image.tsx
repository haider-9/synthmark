import { ImageResponse } from "next/og";

// ─── Route segment config ─────────────────────────────────────────────────────

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ─── Image ────────────────────────────────────────────────────────────────────

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a0a0a",
        padding: "60px",
        fontFamily: "system-ui",
      }}
    >
      {/* ── Top-left: logo ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Polygon icon */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="white" />
        </svg>

        {/* "synth" + "mark" two-tone wordmark */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            synth
          </div>
          <div
            style={{
              color: "#4f8ef7",
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            mark
          </div>
        </div>
      </div>

      {/* ── Center: headline + subtitle ───────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
        }}
      >
        {/* Headline — two lines */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
            }}
          >
            Annotate smarter.
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
            }}
          >
            Ship AI faster.
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "#666",
            marginTop: 20,
          }}
        >
          The professional annotation platform for ML teams.
        </div>
      </div>

      {/* ── Bottom row: stats + domain ────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Bottom-left: domain */}
        <div style={{ fontSize: 14, color: "#333" }}>synthmark.ai</div>

        {/* Stat pills */}
        <div style={{ display: "flex", flexDirection: "row", gap: "12px" }}>
          <div
            style={{
              border: "1px solid #1e1e1e",
              backgroundColor: "#111",
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 16,
              paddingRight: 16,
              borderRadius: 8,
              fontSize: 14,
              color: "#888",
            }}
          >
            1.2M+ Annotations
          </div>
          <div
            style={{
              border: "1px solid #1e1e1e",
              backgroundColor: "#111",
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 16,
              paddingRight: 16,
              borderRadius: 8,
              fontSize: 14,
              color: "#888",
            }}
          >
            500+ Teams
          </div>
          <div
            style={{
              border: "1px solid #1e1e1e",
              backgroundColor: "#111",
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 16,
              paddingRight: 16,
              borderRadius: 8,
              fontSize: 14,
              color: "#888",
            }}
          >
            99.9% Uptime
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
