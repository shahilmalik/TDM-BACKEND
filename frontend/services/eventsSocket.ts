type EventsSocketEvent = {
  event: string;
  data?: any;
};

type ConnectOptions = {
  token: string;
  clientId?: string | number;
  onEvent: (msg: EventsSocketEvent) => void;
  onStatusChange?: (status: "connecting" | "open" | "closed" | "error") => void;
};

const buildWsUrl = (token: string, clientId?: string | number) => {
  // Keep consistent with backend api base: http://localhost:8000/api
  const wsBase = "ws://localhost:8000";
  const params = new URLSearchParams();
  params.set("token", token);
  if (clientId !== undefined && clientId !== null && String(clientId) !== "") {
    params.set("client_id", String(clientId));
  }
  return `${wsBase}/ws/events/?${params.toString()}`;
};

export const connectEventsSocket = (opts: ConnectOptions) => {
  let ws: WebSocket | null = null;
  let closedByClient = false;
  let reconnectTimer: number | null = null;

  const cleanupTimers = () => {
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const connect = () => {
    cleanupTimers();

    try {
      opts.onStatusChange?.("connecting");
      ws = new WebSocket(buildWsUrl(opts.token, opts.clientId));

      ws.onopen = () => {
        opts.onStatusChange?.("open");
      };

      ws.onmessage = (ev) => {
        try {
          const parsed = JSON.parse(String(ev.data || "{}"));
          if (parsed && typeof parsed === "object" && parsed.event) {
            opts.onEvent(parsed as EventsSocketEvent);
          }
        } catch (e) {
          // ignore malformed messages
        }
      };

      ws.onerror = () => {
        opts.onStatusChange?.("error");
      };

      ws.onclose = () => {
        opts.onStatusChange?.("closed");
        ws = null;
        if (closedByClient) return;

        // Basic reconnect for dev stability
        reconnectTimer = window.setTimeout(() => {
          connect();
        }, 1000);
      };
    } catch (e) {
      opts.onStatusChange?.("error");
    }
  };

  connect();

  return () => {
    closedByClient = true;
    cleanupTimers();
    try {
      ws?.close();
    } catch (e) {
      // ignore
    }
    ws = null;
  };
};
