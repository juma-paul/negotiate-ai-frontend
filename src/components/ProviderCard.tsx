"use client";

import { ProviderNegotiation, NegotiationMessage } from "@/types/negotiation";

interface Props {
  provider: ProviderNegotiation;
  targetPrice: number;
}

const statusColors = {
  negotiating: "border-yellow-500 bg-yellow-500/10",
  accepted: "border-green-500 bg-green-500/10",
  rejected: "border-red-500 bg-red-500/10",
  walked_away: "border-gray-500 bg-gray-500/10",
};

const statusLabels = {
  negotiating: "Negotiating...",
  accepted: "Deal Accepted!",
  rejected: "Rejected",
  walked_away: "Walked Away",
};

const personalityEmoji = {
  firm: "💼",
  flexible: "🤝",
  desperate: "😰",
  premium: "👑",
};

export default function ProviderCard({ provider, targetPrice }: Props) {
  const currentPrice = provider.current_price || provider.initial_price;
  const savings = provider.initial_price - currentPrice;
  const savingsPercent = ((savings / provider.initial_price) * 100).toFixed(1);
  const isBelowTarget = currentPrice <= targetPrice;

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all duration-300 ${statusColors[provider.status]}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            {personalityEmoji[provider.personality]} {provider.provider_name}
          </h3>
          <span className="text-xs text-gray-400 capitalize">
            {provider.personality} negotiator
          </span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            provider.status === "accepted"
              ? "bg-green-500 text-white"
              : provider.status === "rejected"
              ? "bg-red-500 text-white"
              : provider.status === "walked_away"
              ? "bg-gray-500 text-white"
              : "bg-yellow-500 text-black"
          }`}
        >
          {statusLabels[provider.status]}
        </span>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-800 rounded-lg p-2">
          <div className="text-xs text-gray-400">Initial Ask</div>
          <div className="text-lg font-bold text-gray-300">
            ${provider.initial_price.toLocaleString()}
          </div>
        </div>
        <div className={`rounded-lg p-2 ${isBelowTarget ? "bg-green-900" : "bg-gray-800"}`}>
          <div className="text-xs text-gray-400">Current Price</div>
          <div className={`text-lg font-bold ${isBelowTarget ? "text-green-400" : "text-white"}`}>
            ${currentPrice.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Savings */}
      {savings > 0 && (
        <div className="bg-blue-900/50 rounded-lg p-2 mb-3">
          <div className="text-sm text-blue-300">
            💰 Saved ${savings.toLocaleString()} ({savingsPercent}% off)
          </div>
        </div>
      )}

      {/* Conversation */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {provider.messages.slice(-4).map((msg: NegotiationMessage, idx: number) => (
          <div
            key={idx}
            className={`p-2 rounded-lg text-sm ${
              msg.role === "negotiator"
                ? "bg-blue-900/50 text-blue-200 ml-4"
                : "bg-gray-700 text-gray-200 mr-4"
            }`}
          >
            <div className="font-medium text-xs mb-1 opacity-70">
              {msg.role === "negotiator" ? "🤖 AI Negotiator" : "👤 Provider"}
              {msg.amount && ` • $${msg.amount.toLocaleString()}`}
            </div>
            <div className="line-clamp-2">{msg.message}</div>
          </div>
        ))}
      </div>

      {/* Round counter */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        Round {provider.rounds}
      </div>
    </div>
  );
}
