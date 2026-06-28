import { useState } from "react";

interface Props {
  code: string;
}

export function CodeTab({ code }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard có thể bị chặn quyền — bỏ qua, không chặn UI */
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md border bg-background px-2 py-1 text-xs hover:bg-accent"
      >
        {copied ? "✓ Đã chép" : "Chép"}
      </button>
      <pre className="overflow-auto rounded-md border bg-muted/50 p-4 pt-10 text-xs">{code}</pre>
    </div>
  );
}
