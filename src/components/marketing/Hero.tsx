"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface HeroProps {
  onTryDemo: () => void;
}

export default function Hero({ onTryDemo }: HeroProps) {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            AI-Powered Freight Negotiation
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              AI Agents That Negotiate
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Your Freight Rates
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Launch parallel negotiations with 30+ trucking companies.
            Watch AI agents negotiate in real-time and save 15-40% on every shipment.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onTryDemo}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              Try Free Demo
            </button>
            {!isAuthenticated && (
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-semibold text-lg transition-all"
              >
                Sign Up Free
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            {[
              { value: "30+", label: "Trucking Companies" },
              { value: "23%", label: "Avg. Savings" },
              { value: "90s", label: "Avg. Negotiation" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
