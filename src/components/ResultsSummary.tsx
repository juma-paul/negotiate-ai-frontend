"use client";

import { NegotiationSession } from "@/types/negotiation";

interface Props {
  session: NegotiationSession;
}

export default function ResultsSummary({ session }: Props) {
  const acceptedDeals = session.providers.filter((p) => p.status === "accepted");
  const bestDeal = session.best_deal;

  if (!bestDeal && acceptedDeals.length === 0) {
    return (
      <div className="bg-red-900/30 border border-red-500 rounded-xl p-6 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-2">No Deals Found</h2>
        <p className="text-gray-300">
          None of the providers accepted an offer within your budget.
          Try increasing your max price or using a more conservative strategy.
        </p>
      </div>
    );
  }

  const totalSavings = bestDeal
    ? bestDeal.initial_price - (bestDeal.current_price || bestDeal.initial_price)
    : 0;
  const savingsPercent = bestDeal
    ? ((totalSavings / bestDeal.initial_price) * 100).toFixed(1)
    : "0";

  return (
    <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-green-500 rounded-xl p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-green-400 mb-2">
          🎉 Best Deal Found!
        </h2>
        <p className="text-gray-300">
          Negotiated with {session.providers.length} providers in{" "}
          {session.total_rounds} rounds
        </p>
      </div>

      {bestDeal && (
        <div className="bg-gray-900 rounded-xl p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {bestDeal.provider_name}
              </h3>
              <span className="text-gray-400 capitalize">
                {bestDeal.personality} provider
              </span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">
                ${bestDeal.current_price?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 line-through">
                ${bestDeal.initial_price.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">
                ${totalSavings.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Total Saved</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-400">
                {savingsPercent}%
              </div>
              <div className="text-xs text-gray-400">Discount</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">
                {acceptedDeals.length}
              </div>
              <div className="text-xs text-gray-400">Deals Available</div>
            </div>
          </div>
        </div>
      )}

      {acceptedDeals.length > 1 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">
            Other Accepted Offers:
          </h4>
          <div className="space-y-2">
            {acceptedDeals
              .filter((p) => p.provider_id !== bestDeal?.provider_id)
              .map((provider) => (
                <div
                  key={provider.provider_id}
                  className="flex justify-between items-center bg-gray-800 rounded-lg p-3"
                >
                  <span className="text-gray-300">{provider.provider_name}</span>
                  <span className="text-green-400 font-semibold">
                    ${provider.current_price?.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
