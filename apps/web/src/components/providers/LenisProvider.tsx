// Native scroll — the OS handles this at 120fps with zero JS overhead.
// Lenis was intercepting scroll events and re-implementing them in JS,
// which caps the feel at ~60fps regardless of display refresh rate.
export function LenisProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
