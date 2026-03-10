"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { getAnalytics, Analytics } from "@/lib/api";

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics();
    }
  }, [isAuthenticated]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
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

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Track your negotiation performance and savings</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 bg-gray-800/50 rounded-xl animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : analytics ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <StatCard
                title="Total Negotiations"
                value={analytics.stats.total_negotiations.toString()}
                icon="negotiations"
              />
              <StatCard
                title="Total Savings"
                value={`$${analytics.stats.total_savings.toLocaleString()}`}
                icon="savings"
                highlight
              />
              <StatCard
                title="Avg. Savings"
                value={`${analytics.stats.avg_savings_percent.toFixed(1)}%`}
                icon="percent"
              />
              <StatCard
                title="Avg. Rounds"
                value={analytics.stats.avg_rounds.toFixed(1)}
                icon="rounds"
              />
            </div>

            {/* Strategy Performance */}
            {analytics.by_strategy.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-semibold mb-4">Performance by Strategy</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics.by_strategy.map((s) => (
                    <div
                      key={s.strategy}
                      className="p-4 bg-gray-800/50 rounded-xl border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="capitalize text-gray-300">{s.strategy}</span>
                        <span className="text-sm text-gray-500">{s.count} negotiations</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">
                        {s.avg_savings.toFixed(1)}% avg savings
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Results */}
            {analytics.recent_results.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Deals</h2>
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700 text-left text-gray-400 text-sm">
                        <th className="px-4 py-3">Company</th>
                        <th className="px-4 py-3">Initial</th>
                        <th className="px-4 py-3">Final</th>
                        <th className="px-4 py-3">Savings</th>
                        <th className="px-4 py-3">Strategy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recent_results.map((result, i) => (
                        <tr key={i} className="border-b border-gray-700/50 last:border-0">
                          <td className="px-4 py-3">{result.company_name}</td>
                          <td className="px-4 py-3 text-gray-400">
                            ${result.initial_price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            ${result.final_price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-green-400">
                            ${result.savings_amount.toLocaleString()} ({result.savings_percent.toFixed(1)}%)
                          </td>
                          <td className="px-4 py-3 capitalize text-gray-400">{result.strategy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {analytics.stats.total_negotiations === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg mb-4">No negotiations yet</p>
                <a
                  href="/"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold"
                >
                  Start Your First Negotiation
                </a>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  highlight = false,
}: {
  title: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) {
  const icons: Record<string, React.ReactNode> = {
    negotiations: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    savings: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    percent: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
    rounds: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  };

  return (
    <div
      className={`p-6 rounded-xl border ${
        highlight
          ? "bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-700/50"
          : "bg-gray-800/50 border-gray-700"
      }`}
    >
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        {icons[icon]}
        <span className="text-sm">{title}</span>
      </div>
      <div className={`text-3xl font-bold ${highlight ? "text-green-400" : ""}`}>
        {value}
      </div>
    </div>
  );
}
