export type NegotiationStrategy = "aggressive" | "balanced" | "conservative";

export type ProviderPersonality = "firm" | "flexible" | "desperate" | "premium";

export type NegotiationStatus = "negotiating" | "accepted" | "rejected" | "walked_away";

export interface NegotiationRequest {
  item_description: string;
  target_price: number;
  max_price: number;
  num_providers: number;
  strategy: NegotiationStrategy;
}

export interface NegotiationMessage {
  role: "negotiator" | "provider";
  action: string;
  amount: number | null;
  message: string;
  timestamp: string;
}

export interface ProviderNegotiation {
  provider_id: string;
  provider_name: string;
  personality: ProviderPersonality;
  initial_price: number;
  current_price: number | null;
  status: NegotiationStatus;
  messages: NegotiationMessage[];
  rounds: number;
}

export interface NegotiationSession {
  session_id: string;
  item_description: string;
  target_price: number;
  max_price: number;
  strategy: NegotiationStrategy;
  providers: ProviderNegotiation[];
  status: "in_progress" | "completed" | "cancelled";
  best_deal: ProviderNegotiation | null;
  total_rounds: number;
}

export interface NegotiationUpdate {
  session_id: string;
  provider_id: string;
  event_type: "message" | "status_change" | "deal_found" | "completed";
  data: Record<string, unknown>;
}
