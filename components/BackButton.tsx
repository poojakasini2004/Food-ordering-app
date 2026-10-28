"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
    >
      <span className="text-base leading-none">←</span>
      Back
    </button>
  );
}
