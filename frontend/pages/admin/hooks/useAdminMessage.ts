import * as React from "react";

export type AdminMessage = { type: "error" | "success"; text: string };

export function useAdminMessage(timeoutMs: number = 5000) {
  const [adminMessage, setAdminMessage] = React.useState<AdminMessage | null>(
    null
  );

  React.useEffect(() => {
    if (!adminMessage) return;
    const t = window.setTimeout(() => setAdminMessage(null), timeoutMs);
    return () => window.clearTimeout(t);
  }, [adminMessage, timeoutMs]);

  return { adminMessage, setAdminMessage };
}
