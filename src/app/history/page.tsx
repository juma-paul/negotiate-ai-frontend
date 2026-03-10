"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { getHistory, HistorySession } from "@/lib/api";

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await getHistory();
      setSessions(data.sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      error: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return (
      <span className={`px-2 py-1 text-xs rounded border ${styles[status] || styles.error}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Negotiation History</h1>
            <p className="text-gray-400">View all your past negotiations</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold"
          >
            New Negotiation
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-gray-800/50 rounded-xl animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/3 mb-4" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {session.item_description}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Target: ${session.target_price.toLocaleString()} • Max: $
                      {session.max_price.toLocaleString()} •{" "}
                      <span className="capitalize">{session.strategy}</span>
                    </p>
                  </div>
                  {getStatusBadge(session.status)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-gray-400">
                      {formatDate(session.created_at)}
                    </span>
                    <span className="text-gray-400">
                      {session.total_rounds} rounds
                    </span>
                    {session.best_deal_price && (
                      <span className="text-green-400 font-semibold">
                        Best deal: ${session.best_deal_price.toLocaleString()}
                        {session.target_price > 0 && (
                          <span className="text-gray-400 font-normal ml-1">
                            (
                            {(
                              ((session.target_price - session.best_deal_price) /
                                session.target_price) *
                              100
                            ).toFixed(1)}
                            % below target)
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-lg mb-4">No negotiations yet</p>
            <p className="text-gray-500 mb-6">
              Start your first negotiation to see it here
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold"
            >
              Start Negotiation
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
