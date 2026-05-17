import { ImageResponse } from 'next/og';

// ─── Route segment config ─────────────────────────────────────────────────────

export const runtime = 'edge';
export const size = { width: 1200, height: 600 };
export const contentType = 'image/png';

// ─── Image ────────────────────────────────────────────────────────────────────

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'oklch(0.2166 0.0215 292.8474)',
        padding: '60px',
        fontFamily: 'system-ui',
      }}
    >
      {/* ── Top-left: logo ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Polygon icon */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="white" />
        </svg>

        {/* "synth" + "mark" two-tone wordmark */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'baseline',
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            synth
          </div>
          <div
            style={{
              color: 'oklch(0.6104 0.0767 299.7335)',
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
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        {/* Headline — two lines */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
            }}
          >
            Annotate smarter.
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: 'white',
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
            color: 'oklch(0.6974 0.0282 300.0614)',
            marginTop: 20,
          }}
        >
          The professional annotation platform for ML teams.
        </div>
      </div>

      {/* ── Bottom row: domain (left) + stat pills (right) ────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Bottom-left: domain */}
        <div style={{ fontSize: 14, color: 'oklch(0.6974 0.0282 300.0614)' }}>synthmark.ai</div>

        {/* Stat pills */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
          <div
            style={{
              border: '1px solid oklch(0.3063 0.0359 293.3367)',
              backgroundColor: 'oklch(0.2544 0.0301 292.7315)',
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 16,
              paddingRight: 16,
              borderRadius: 8,
              fontSize: 14,
              color: 'oklch(0.6974 0.0282 300.0614)',
            }}
          >
            1.2M+ Annotations
          </div>
          <div
            style={{
              border: '1px solid oklch(0.3063 0.0359 293.3367)',
              backgroundColor: 'oklch(0.2544 0.0301 292.7315)',
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 16,
              paddingRight: 16,
              borderRadius: 8,
              fontSize: 14,
              color: 'oklch(0.6974 0.0282 300.0614)',
            }}
          >
            500+ Teams
          </div>
          <div
            style={{
              border: '1px solid oklch(0.3063 0.0359 293.3367)',
              backgroundColor: 'oklch(0.2544 0.0301 292.7315)',
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 16,
              paddingRight: 16,
              borderRadius: 8,
              fontSize: 14,
              color: 'oklch(0.6974 0.0282 300.0614)',
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
