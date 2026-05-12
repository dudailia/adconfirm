"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export function InvoiceMockup() {
  // Parallax wrapper — pure DOM RAF, zero React re-renders
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let rafId: number;
    let targetRotX = 0, targetRotY = 0;
    let currentRotX = 0, currentRotY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      targetRotY = nx * 8;
      targetRotX = -ny * 5;
    };

    const tick = () => {
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      el.style.transform = `perspective(1000px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div
      className="invoice-mockup"
      style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,82,255,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Pure DOM parallax wrapper — perspective applied here by RAF */}
      <div ref={wrapperRef} style={{ willChange: "transform" }}>
        {/* Mount animation — runs once, fine to keep in Framer Motion */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 80 }}
        >
        {/* Float loop */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Slight tilt wrapper */}
          <div style={{ transform: "rotate(2deg)" }}>
            <div
              style={{
                boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.3)",
                borderRadius: 8,
                overflow: "hidden",
                width: 400,
                backgroundColor: "#FAFAF8",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {/* ─── HEADER ─── */}
              <div style={{ padding: "22px 24px 14px", borderBottom: "1px solid #EBEBEA" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1A1A1A", letterSpacing: "0.02em" }}>
                      MERIDIAN DESIGN STUDIO
                    </div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                      meridian.studio · London, UK
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#AAA", fontFamily: "monospace" }}>
                      INVOICE
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#1A1A1A", fontFamily: "monospace", marginTop: 2 }}>
                      INV-2024-0847
                    </div>
                    <div style={{ fontSize: 10, color: "#AAA", marginTop: 1 }}>Oct 14, 2024</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #F2F2F0" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "#BBB", textTransform: "uppercase" as const }}>Bill To</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", marginTop: 2 }}>Thomas &amp; Co.</div>
                  <div style={{ fontSize: 10, color: "#999" }}>thomas@thomasandco.com</div>
                </div>
              </div>

              {/* ─── LINE ITEMS ─── */}
              <div style={{ padding: "14px 24px 0" }}>
                {[
                  { desc: "Brand Strategy", amount: "£2,400" },
                  { desc: "Visual Identity", amount: "£1,800" },
                  { desc: "Web Design", amount: "£3,200" },
                ].map(({ desc, amount }) => (
                  <div
                    key={desc}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      color: "#444",
                      padding: "5px 0",
                      borderBottom: "1px solid #F5F5F3",
                    }}
                  >
                    <span>{desc}</span>
                    <span style={{ fontFamily: "monospace", fontWeight: 500, color: "#1A1A1A" }}>{amount}</span>
                  </div>
                ))}
              </div>

              {/* ─── TOTALS ─── */}
              <div style={{ padding: "10px 24px 14px" }}>
                {[
                  { label: "Subtotal", value: "£7,400" },
                  { label: "VAT (20%)", value: "£1,480" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#999", padding: "2px 0" }}
                  >
                    <span>{label}</span>
                    <span style={{ fontFamily: "monospace" }}>{value}</span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1A1A1A",
                    padding: "7px 0 0",
                    borderTop: "1px solid #E8E8E6",
                    marginTop: 4,
                  }}
                >
                  <span>TOTAL</span>
                  <span style={{ fontFamily: "monospace" }}>£8,880</span>
                </div>
              </div>

              {/* ─── FISCAL CLOSE ─── */}
              <div style={{ padding: "6px 24px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, borderTop: "1px dashed #D8D8D5" }} />
                <span style={{ fontSize: 8, letterSpacing: "0.15em", color: "#C0C0BC", fontFamily: "monospace", whiteSpace: "nowrap" as const }}>
                  FISCAL CLOSE
                </span>
                <div style={{ flex: 1, borderTop: "1px dashed #D8D8D5" }} />
              </div>

              {/* ─── AD BLOCK ─── */}
              <motion.div
                initial={{ boxShadow: "inset 0 0 0 rgba(0,82,255,0)" }}
                animate={{
                  boxShadow: [
                    "inset 0 0 0 rgba(0,82,255,0)",
                    "inset 0 0 20px rgba(0,82,255,0.07)",
                    "inset 0 0 0 rgba(0,82,255,0)",
                  ],
                }}
                transition={{ delay: 2, duration: 1.8, ease: "easeInOut" }}
                style={{
                  borderTop: "1px solid rgba(0,82,255,0.25)",
                  background: "rgba(0,82,255,0.03)",
                  padding: "10px 24px 14px",
                }}
              >
                <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "#B0B0B0", marginBottom: 7, fontFamily: "monospace" }}>
                  SPONSORED
                </div>
                {/* Brand placeholder */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 5,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    marginBottom: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>BX</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", marginBottom: 3, lineHeight: 1.3 }}>
                  Save 20% on business software
                </div>
                <div style={{ fontSize: 10, color: "#777", marginBottom: 8, lineHeight: 1.5 }}>
                  Tools your team will actually use.<br />Claim your discount today.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 10, color: "#0052FF", fontWeight: 600, borderBottom: "1px solid rgba(0,82,255,0.3)", cursor: "pointer" }}>
                    Claim Offer →
                  </span>
                  {/* QR placeholder */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      border: "1px solid #E0E0DD",
                      borderRadius: 3,
                      background: "#FFF",
                      display: "grid",
                      gridTemplateColumns: "repeat(6, 1fr)",
                      gap: 1.5,
                      padding: 4,
                    }}
                  >
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          background: [0,1,2,3,4,5,6,11,12,13,17,18,23,24,30,31,32,33,34,35,7,16,8,15,25,26].includes(i)
                            ? "#1A1A1A" : "transparent",
                          borderRadius: 1,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 8, color: "#D0D0CC", marginTop: 7, fontFamily: "monospace" }}>
                  Powered by AdConfirm
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </div>
  );
}
