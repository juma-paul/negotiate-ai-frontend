import { NegotiationRequest, NegotiationSession } from "@/types/negotiation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function startNegotiation(
  request: NegotiationRequest
): Promise<NegotiationSession> {
  const response = await fetch(`${API_URL}/api/negotiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to start negotiation");
  }

  return response.json();
}

export async function getSession(
  sessionId: string
): Promise<NegotiationSession> {
  const response = await fetch(`${API_URL}/api/negotiate/${sessionId}`);

  if (!response.ok) {
    throw new Error("Failed to get session");
  }

  return response.json();
}

export function streamNegotiation(
  sessionId: string,
  onUpdate: (data: unknown) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): () => void {
  const eventSource = new EventSource(
    `${API_URL}/api/negotiate/${sessionId}/stream`
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onUpdate(data);
    } catch {
      console.error("Failed to parse event data");
    }
  };

  eventSource.addEventListener("completed", (event) => {
    const data = JSON.parse((event as MessageEvent).data);
    onUpdate(data);
    onComplete();
    eventSource.close();
  });

  eventSource.addEventListener("message", (event) => {
    const data = JSON.parse((event as MessageEvent).data);
    onUpdate(data);
  });

  eventSource.addEventListener("status_change", (event) => {
    const data = JSON.parse((event as MessageEvent).data);
    onUpdate(data);
  });

  eventSource.addEventListener("deal_found", (event) => {
    const data = JSON.parse((event as MessageEvent).data);
    onUpdate(data);
  });

  eventSource.onerror = () => {
    onError(new Error("Connection lost"));
    eventSource.close();
  };

  // Return cleanup function
  return () => eventSource.close();
}
