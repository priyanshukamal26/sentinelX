export default function GrainOverlay() {
  return (
    <svg className="grain-overlay" aria-hidden="true">
      <filter id="sentinel-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.75"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#sentinel-noise)" />
    </svg>
  );
}
