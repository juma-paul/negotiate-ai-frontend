"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import NegotiationForm from "@/components/NegotiationForm";
import ProviderCard from "@/components/ProviderCard";
import ResultsSummary from "@/components/ResultsSummary";
import Header from "@/components/Header";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import HowItWorks from "@/components/marketing/HowItWorks";
import Testimonials from "@/components/marketing/Testimonials";
import CTASection from "@/components/marketing/CTASection";
import { NegotiationRequest, NegotiationSession } from "@/types/negotiation";
import { startNegotiation, streamNegotiation, getSession } from "@/lib/api";

export default function Home() {
  const [session, setSession] = useState<NegotiationSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  const handleSubmit = useCallback(async (request: NegotiationRequest) => {
    // Cleanup any existing stream
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newSession = await startNegotiation(request);
      setSession(newSession);
      setIsLoading(false);
      setIsNegotiating(true);

      // Start streaming with proper cleanup
      cleanupRef.current = streamNegotiation(newSession.session_id, {
        onUpdate: async () => {
          try {
            const updated = await getSession(newSession.session_id);
            setSession(updated);
          } catch (e) {
            console.error("Failed to refresh session:", e);
          }
        },
        onComplete: async () => {
          // Fetch final session state to ensure we have the completed status
          try {
            const finalSession = await getSession(newSession.session_id);
            setSession(finalSession);
          } catch (e) {
            console.error("Failed to get final session:", e);
          }
          setIsNegotiating(false);
          cleanupRef.current = null;
        },
        onError: (err) => {
          setError(err.message);
          setIsNegotiating(false);
          cleanupRef.current = null;
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start negotiation");
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setSession(null);
    setIsNegotiating(false);
    setError(null);
    setShowDemo(false);
  }, []);

  const handleTryDemo = useCallback(() => {
    setShowDemo(true);
    // Scroll to form after state update
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onNewNegotiation={handleReset} showNewButton={!!session} />

      <main>
        {error && (
          <div className="max-w-7xl mx-auto px-4 mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">Dismiss</button>
          </div>
        )}

        {!session && !showDemo ? (
          <>
            <Hero onTryDemo={handleTryDemo} />
            <Features />
            <HowItWorks />
            <Testimonials />

            {/* Demo Form Section */}
            <section ref={formRef} id="demo" className="py-20 bg-gray-900/30">
              <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Try the Demo</h2>
                  <p className="text-gray-400 text-lg">
                    Launch AI agents to negotiate with real trucking companies.
                  </p>
                </div>
                <NegotiationForm onSubmit={handleSubmit} isLoading={isLoading} />
              </div>
            </section>

            <CTASection onTryDemo={handleTryDemo} />
          </>
        ) : !session && showDemo ? (
          <div className="max-w-2xl mx-auto px-4 py-12" ref={formRef}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Start Your Negotiation</h2>
              <p className="text-gray-400 text-lg">
                Enter your shipment details and let AI negotiate the best rates.
              </p>
            </div>
            <NegotiationForm onSubmit={handleSubmit} isLoading={isLoading} />
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowDemo(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                Back to homepage
              </button>
            </div>
          </div>
        ) : session ? (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{session.item_description}</h2>
                <p className="text-gray-400">
                  Target: ${session.target_price.toLocaleString()} • Max: ${session.max_price.toLocaleString()} •{" "}
                  <span className="capitalize">{session.strategy}</span>
                </p>
              </div>
              {isNegotiating && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Negotiating...</span>
                </div>
              )}
            </div>

            {session.status === "completed" && <ResultsSummary session={session} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {session.providers.map((provider) => (
                <ProviderCard key={provider.provider_id} provider={provider} targetPrice={session.target_price} />
              ))}
            </div>
          </div>
        ) : null}
      </main>

      <footer className="border-t border-gray-800 mt-16 py-8 text-center text-gray-500 text-sm">
        <p>Built with Pydantic AI + FastAPI + Next.js</p>
        <p className="mt-1">Portfolio project for Lanesurf Agent Engineer</p>
      </footer>
    </div>
  );
}
