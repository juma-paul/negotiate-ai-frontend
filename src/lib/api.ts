import { NegotiationRequest, NegotiationSession, NegotiationUpdate } from "@/types/negotiation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function startNegotiation(request: NegotiationRequest): Promise<NegotiationSession> {
  const response = await fetch(`${API_URL}/api/negotiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
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

export interface HistorySession {
  id: string;
  item_description: string;
  target_price: number;
  max_price: number;
  strategy: string;
  status: string;
  best_deal_company_id: string | null;
  best_deal_price: number | null;
  total_rounds: number;
  created_at: string;
}

export interface Analytics {
  stats: {
    total_negotiations: number;
    total_savings: number;
    avg_savings_percent: number;
    avg_rounds: number;
  };
  by_strategy: Array<{
    strategy: string;
    count: number;
    avg_savings: number;
  }>;
  recent_results: Array<{
    company_name: string;
    initial_price: number;
    final_price: number;
    savings_amount: number;
    savings_percent: number;
    strategy: string;
  }>;
}

export async function getHistory(): Promise<{ sessions: HistorySession[] }> {
  const response = await fetch(`${API_URL}/api/history`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error("Please log in to view history");
    throw new Error("Failed to get history");
  }
  return response.json();
}

export async function getAnalytics(): Promise<Analytics> {
  const response = await fetch(`${API_URL}/api/analytics`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error("Please log in to view analytics");
    throw new Error("Failed to get analytics");
  }
  return response.json();
}

export interface Company {
  id: string;
  name: string;
  phone: string;
  service_areas: string[];
  fleet_info: Record<string, unknown>;
  personality: string;
  rating: number;
}

export async function getCompanies(): Promise<Company[]> {
  const response = await fetch(`${API_URL}/api/companies`);
  if (!response.ok) throw new Error("Failed to get companies");
  return response.json();
}

// Voice API
export interface VoiceStatus {
  available: boolean;
  message: string;
}

export interface CallRequest {
  provider_id: string;
  session_id?: string;
  item_description: string;
  target_price: number;
  max_price: number;
}

export interface CallResponse {
  call_id: string;
  status: string;
  provider_name: string;
  phone_number: string;
}

export interface CallState {
  call_id: string;
  session_id: string;
  provider_id: string;
  provider_name: string;
  phone_number: string;
  status: string;
  transcript: Array<{
    role: string;
    text: string;
    timestamp: string;
  }>;
  outcome: string | null;
  final_price: number | null;
}

export async function getVoiceStatus(): Promise<VoiceStatus> {
  const response = await fetch(`${API_URL}/api/voice/status`);
  if (!response.ok) throw new Error("Failed to get voice status");
  return response.json();
}

export async function initiateCall(request: CallRequest): Promise<CallResponse> {
  const response = await fetch(`${API_URL}/api/voice/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to initiate call" }));
    throw new Error(error.detail || "Failed to initiate call");
  }
  return response.json();
}

export async function getCallState(callId: string): Promise<CallState> {
  const response = await fetch(`${API_URL}/api/voice/call/${callId}`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error("Failed to get call state");
  return response.json();
}

export async function hangupCall(callId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/voice/call/${callId}/hangup`, {
    method: "POST",
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error("Failed to hangup call");
}

export function streamCall(
  callId: string,
  callbacks: {
    onUpdate: (data: { type: string; [key: string]: unknown }) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
  }
): () => void {
  const eventSource = new EventSource(`${API_URL}/api/voice/call/${callId}/stream`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      callbacks.onUpdate(data);
      if (data.type === "completed" || data.type === "failed" || data.type === "cancelled") {
        callbacks.onComplete();
        eventSource.close();
      }
    } catch {
      console.error("Failed to parse call event");
    }
  };

  eventSource.onerror = () => {
    callbacks.onError(new Error("Call stream disconnected"));
    eventSource.close();
  };

  return () => eventSource.close();
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
