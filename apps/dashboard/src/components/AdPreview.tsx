"use client";

import { QRCodeSVG } from "qrcode.react";

interface AdPreviewProps {
  headline: string;
  bodyText?: string;
  ctaText?: string;
  ctaUrl: string;
  showQr: boolean;
}

export function AdPreview({ headline, bodyText, ctaText, ctaUrl, showQr }: AdPreviewProps) {
  const utmUrl = ctaUrl ? `${ctaUrl}?utm_source=adconfirm&utm_medium=invoice` : "";

  return (
    <div className="bg-white rounded-xl overflow-hidden text-gray-900 text-xs shadow-2xl w-full max-w-sm">
      {/* Mock invoice header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="w-7 h-7 bg-gray-900 rounded mb-1.5 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">M</span>
            </div>
            <div className="font-semibold text-sm">Meridian Design Studio</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-gray-400 uppercase tracking-wider">Invoice</div>
            <div className="font-mono text-sm font-semibold">#INV-2024-0847</div>
          </div>
        </div>
      </div>
      {/* Mock total */}
      <div className="px-5 py-3">
        <div className="flex justify-between font-bold text-sm border-t border-gray-200 pt-2">
          <span>Total Due</span>
          <span className="font-mono">£8,880.00</span>
        </div>
      </div>
      {/* Fiscal close divider */}
      <div className="px-5 py-2 flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[8px] font-mono text-gray-300 whitespace-nowrap tracking-widest">─ FISCAL CLOSE ─</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      {/* Ad block */}
      <div className="mx-4 mb-4 rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
        <div className="text-[8px] font-mono text-blue-400 uppercase tracking-[0.15em] mb-1.5">Sponsored</div>
        <div className="font-semibold text-[11px] text-gray-900 mb-1 leading-tight">
          {headline || "Your headline will appear here"}
        </div>
        {bodyText && (
          <div className="text-[10px] text-gray-500 mb-2 leading-relaxed">{bodyText}</div>
        )}
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white text-[9px] font-semibold px-2.5 py-1 rounded-md">
            {ctaText || "Learn more"} →
          </span>
          {showQr && utmUrl && (
            <div className="w-9 h-9 bg-white rounded border border-gray-200 flex items-center justify-center p-0.5">
              <QRCodeSVG value={utmUrl} size={28} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
