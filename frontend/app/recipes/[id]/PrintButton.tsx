"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="p-2 text-stone-300 hover:text-stone-600 active:text-stone-800 transition-colors rounded-lg"
      aria-label="Export as PDF"
    >
      <Printer className="w-5 h-5" />
    </button>
  );
}
