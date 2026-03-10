"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import VoiceCall from "@/components/VoiceCall";
import { useAuth } from "@/contexts/AuthContext";
import { getCompanies, getVoiceStatus, Company } from "@/lib/api";

export default function CompaniesPage() {
  const { isAuthenticated } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [callConfig, setCallConfig] = useState({
    itemDescription: "",
    targetPrice: 0,
    maxPrice: 0,
  });
  const [showCallModal, setShowCallModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [companiesData, voiceStatus] = await Promise.all([
        getCompanies(),
        getVoiceStatus().catch(() => ({ available: false })),
      ]);
      setCompanies(companiesData);
      setVoiceAvailable(voiceStatus.available);
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallClick = (company: Company) => {
    setSelectedCompany(company);
    setShowConfigModal(true);
  };

  const handleStartCall = () => {
    if (!callConfig.itemDescription || !callConfig.targetPrice || !callConfig.maxPrice) {
      return;
    }
    setShowConfigModal(false);
    setShowCallModal(true);
  };

  const getPersonalityBadge = (personality: string) => {
    const styles: Record<string, string> = {
      firm: "bg-red-500/20 text-red-400 border-red-500/30",
      flexible: "bg-green-500/20 text-green-400 border-green-500/30",
      desperate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      premium: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return (
      <span className={`px-2 py-1 text-xs rounded border capitalize ${styles[personality] || ""}`}>
        {personality}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trucking Companies</h1>
            <p className="text-gray-400">
              Browse {companies.length} carriers and initiate negotiations
            </p>
          </div>
          {voiceAvailable && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Voice Calling Available
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 bg-gray-800/50 rounded-xl animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{company.name}</h3>
                    <p className="text-sm text-gray-400">{company.phone}</p>
                  </div>
                  {getPersonalityBadge(company.personality)}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= company.rating ? "text-yellow-400" : "text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">{company.rating.toFixed(1)}</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {company.service_areas.slice(0, 3).map((area) => (
                    <span
                      key={area}
                      className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded"
                    >
                      {area}
                    </span>
                  ))}
                  {company.service_areas.length > 3 && (
                    <span className="px-2 py-1 text-gray-500 text-xs">
                      +{company.service_areas.length - 3} more
                    </span>
                  )}
                </div>

                {isAuthenticated && voiceAvailable && (
                  <button
                    onClick={() => handleCallClick(company)}
                    className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call to Negotiate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Call Configuration Modal */}
      {showConfigModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-2">Configure Call</h2>
            <p className="text-gray-400 text-sm mb-6">
              Set up your negotiation with {selectedCompany.name}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Shipment Description
                </label>
                <input
                  type="text"
                  value={callConfig.itemDescription}
                  onChange={(e) =>
                    setCallConfig((c) => ({ ...c, itemDescription: e.target.value }))
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="e.g., 40ft container LA to Chicago"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Target Price ($)
                  </label>
                  <input
                    type="number"
                    value={callConfig.targetPrice || ""}
                    onChange={(e) =>
                      setCallConfig((c) => ({ ...c, targetPrice: Number(e.target.value) }))
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    value={callConfig.maxPrice || ""}
                    onChange={(e) =>
                      setCallConfig((c) => ({ ...c, maxPrice: Number(e.target.value) }))
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="3500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleStartCall}
                disabled={
                  !callConfig.itemDescription ||
                  !callConfig.targetPrice ||
                  !callConfig.maxPrice
                }
                className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Call Modal */}
      {showCallModal && selectedCompany && (
        <VoiceCall
          providerId={selectedCompany.id}
          providerName={selectedCompany.name}
          providerPhone={selectedCompany.phone}
          itemDescription={callConfig.itemDescription}
          targetPrice={callConfig.targetPrice}
          maxPrice={callConfig.maxPrice}
          onClose={() => {
            setShowCallModal(false);
            setSelectedCompany(null);
            setCallConfig({ itemDescription: "", targetPrice: 0, maxPrice: 0 });
          }}
        />
      )}
    </div>
  );
}
