"use client";

import { useState } from "react";
import { NegotiationRequest, NegotiationStrategy } from "@/types/negotiation";

interface Props {
  onSubmit: (request: NegotiationRequest) => void;
  isLoading: boolean;
}

export default function NegotiationForm({ onSubmit, isLoading }: Props) {
  const [formData, setFormData] = useState<NegotiationRequest>({
    item_description: "Freight shipment from Los Angeles to Chicago - 40ft container, 20,000 lbs",
    target_price: 2500,
    max_price: 3500,
    num_providers: 5,
    strategy: "balanced",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          What are you negotiating for?
        </label>
        <textarea
          value={formData.item_description}
          onChange={(e) =>
            setFormData({ ...formData, item_description: e.target.value })
          }
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="e.g., Freight shipment from LA to Chicago..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Target Price ($)
          </label>
          <input
            type="number"
            value={formData.target_price}
            onChange={(e) =>
              setFormData({ ...formData, target_price: Number(e.target.value) })
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            min={0}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Maximum Price ($)
          </label>
          <input
            type="number"
            value={formData.max_price}
            onChange={(e) =>
              setFormData({ ...formData, max_price: Number(e.target.value) })
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            min={0}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Number of Providers
          </label>
          <input
            type="number"
            value={formData.num_providers}
            onChange={(e) =>
              setFormData({ ...formData, num_providers: Number(e.target.value) })
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            min={1}
            max={10}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Strategy
          </label>
          <select
            value={formData.strategy}
            onChange={(e) =>
              setFormData({
                ...formData,
                strategy: e.target.value as NegotiationStrategy,
              })
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="aggressive">Aggressive - Push for lowest price</option>
            <option value="balanced">Balanced - Fair negotiations</option>
            <option value="conservative">Conservative - Quick deals</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Starting Negotiations...
          </span>
        ) : (
          "🚀 Start Parallel Negotiations"
        )}
      </button>
    </form>
  );
}
