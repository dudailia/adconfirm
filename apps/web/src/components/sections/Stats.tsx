"use client";

import { useRef } from "react";
import { useCountUp } from "../../lib/hooks";

function StatItem({
  valueDisplay,
  label,
  mono = true,
}: {
  valueDisplay: React.ReactNode;
  label: string;
  mono?: boolean;
}) {
  return (
    <div className="text-center md:px-8">
      <div className={`text-3xl md:text-4xl font-medium text-white mb-2 ${mono ? "font-mono" : "font-serif"}`}>
        {valueDisplay}
      </div>
      <div className="text-sm text-[#9AA5B4]">{label}</div>
    </div>
  );
}

function CountValue({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const { count, ref } = useCountUp(value, 2000);
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#0D1629] border border-white/[0.08] rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x md:divide-white/[0.08]">
            <StatItem
              valueDisplay={<span className="font-mono">£0.08</span>}
              label="Average revenue per placement"
            />
            <StatItem
              valueDisplay={<span className="font-mono">&lt; 2ms</span>}
              label="Injection time"
            />
            <StatItem
              valueDisplay={<span className="font-mono">0</span>}
              label="Changes to your workflow"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
