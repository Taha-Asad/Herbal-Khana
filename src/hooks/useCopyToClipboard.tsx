import { useCallback, useState } from "react";

export default function useCopyToClipboard(): [
  boolean,
  (text: string) => void
] {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return [copied, copy];
}
