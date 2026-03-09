"use client";

import { useState, useCallback } from "react";
import NegotiationForm from "@/components/NegotiationForm";
import ProviderCard from "@/components/ProviderCard";
import ResultsSummary from "@/components/ResultsSummary";
import {
  NegotiationRequest,
  NegotiationSession,
  NegotiationUpdate,
} from "@/types/negotiation";
import { startNegotiation, streamNegotiation, getSession } from "@/lib/api";

export default function Home() {
  const [session, setSession] = useState<NegotiationSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (request: NegotiationRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      // Start the negotiation session
      const newSession = await startNegotiation(request);
      setSession(newSession);
      setIsLoading(false);
      setIsNegotiating(true);

      // Stream updates
      streamNegotiation(
        newSession.session_id,
        async (update: unknown) => {
          const typedUpdate = update as NegotiationUpdate;
          console.log("Update:", typedUpdate);
          // Refresh session state
          const updatedSession = await getSession(newSession.session_id);
          setSession(updatedSession);
        },
        () => {
          setIsNegotiating(false);
        },
        (err) => {
          setError(err.message);
          setIsNegotiating(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start negotiation");
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setSession(null);
    setIsNegotiating(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              NegotiateAI
            </h1>
            <p className="text-sm text-gray-400">
              Multi-Agent Parallel Negotiation System
            </p>
          </div>
          {session && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            >
              New Negotiation
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {!session ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                AI Agents That Negotiate For You
              </h2>
              <p className="text-gray-400 text-lg">
                Launch multiple AI agents to negotiate with providers simultaneously.
                Get the best deal without the hassle.
              </p>
            </div>

            <NegotiationForm onSubmit={handleSubmit} isLoading={isLoading} />

            {/* Features */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🚀</div>
                <h3 className="font-semibold mb-1">Parallel Execution</h3>
                <p className="text-sm text-gray-400">
                  Negotiate with multiple providers at once
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-semibold mb-1">AI-Powered</h3>
                <p className="text-sm text-gray-400">
                  GPT-4o agents with negotiation strategies
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold mb-1">Best Price</h3>
                <p className="text-sm text-gray-400">
                  Automatically finds the lowest offer
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Status Bar */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{session.item_description}</h2>
                <p className="text-gray-400">
                  Target: ${session.target_price.toLocaleString()} • Max: $
                  {session.max_price.toLocaleString()} • Strategy:{" "}
                  <span className="capitalize">{session.strategy}</span>
                </p>
              </div>
              {isNegotiating && (
                <div className="flex items-center gap-2 text-yellow-400">
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
                  <span>Negotiations in progress...</span>
                </div>
              )}
            </div>

            {/* Results Summary (when complete) */}
            {session.status === "completed" && (
              <div className="mb-8">
                <ResultsSummary session={session} />
              </div>
            )}

            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {session.providers.map((provider) => (
                <ProviderCard
                  key={provider.provider_id}
                  provider={provider}
                  targetPrice={session.target_price}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-8 text-center text-gray-500 text-sm">
        <p>
          Built with Pydantic AI + FastAPI + Next.js •{" "}
          <a
            href="https://github.com"
            className="text-blue-400 hover:underline"
          >
            View Source
          </a>
        </p>
        <p className="mt-2">
          Portfolio project for Lanesurf Agent Engineer position
        </p>
      </footer>
    </div>
  );
}
