// hooks/useCopyToClipboard.ts
"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export default function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success("Copied to clipboard!");
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      toast.error("Failed to copy");
      return false;
    }
  }, []);

  return { copiedText, copy };
}
