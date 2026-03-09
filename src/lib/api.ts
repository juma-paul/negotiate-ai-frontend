import { NegotiationRequest, NegotiationSession, NegotiationUpdate } from "@/types/negotiation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function startNegotiation(request: NegotiationRequest): Promise<NegotiationSession> {
  const response = await fetch(`${API_URL}/api/negotiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Failed to start negotiation");
  }
  return response.json();
}

export async function getSession(sessionId: string): Promise<NegotiationSession> {
  const response = await fetch(`${API_URL}/api/negotiate/${sessionId}`);
  if (!response.ok) throw new Error("Failed to get session");
  return response.json();
}

interface StreamCallbacks {
  onUpdate: (data: NegotiationUpdate) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export function streamNegotiation(sessionId: string, callbacks: StreamCallbacks): () => void {
  let eventSource: EventSource | null = null;
  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 2000;
  let closed = false;

  const connect = () => {
    if (closed) return;

    eventSource = new EventSource(`${API_URL}/api/negotiate/${sessionId}/stream`);

    eventSource.onopen = () => {
      retryCount = 0; // Reset on successful connection
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as NegotiationUpdate;
        callbacks.onUpdate(data);
      } catch {
        console.error("Failed to parse event data");
      }
    };

    // Handle specific event types
    const eventTypes = ["message", "status_change", "deal_found", "heartbeat", "error"];
    eventTypes.forEach((type) => {
      eventSource?.addEventListener(type, (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data) as NegotiationUpdate;
          callbacks.onUpdate(data);
        } catch {
          console.error(`Failed to parse ${type} event`);
        }
      });
    });

    eventSource.addEventListener("completed", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as NegotiationUpdate;
        callbacks.onUpdate(data);
        callbacks.onComplete();
        cleanup();
      } catch {
        callbacks.onComplete();
        cleanup();
      }
    });

    eventSource.addEventListener("ping", () => {
      // Heartbeat received - connection is alive
    });

    eventSource.onerror = () => {
      if (closed) return;

      eventSource?.close();
      eventSource = null;

      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Connection lost. Retrying (${retryCount}/${maxRetries})...`);
        setTimeout(connect, retryDelay * retryCount);
      } else {
        callbacks.onError(new Error("Connection lost after multiple retries"));
      }
    };
  };

  const cleanup = () => {
    closed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };

  connect();
  return cleanup;
}
