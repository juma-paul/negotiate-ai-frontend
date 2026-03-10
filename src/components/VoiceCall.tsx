"use client";

import { useState, useEffect, useCallback } from "react";
import {
  initiateCall,
  getCallState,
  hangupCall,
  streamCall,
  getVoiceStatus,
  CallState,
} from "@/lib/api";

interface VoiceCallProps {
  providerId: string;
  providerName: string;
  providerPhone: string;
  itemDescription: string;
  targetPrice: number;
  maxPrice: number;
  onClose: () => void;
}

export default function VoiceCall({
  providerId,
  providerName,
  providerPhone,
  itemDescription,
  targetPrice,
  maxPrice,
  onClose,
}: VoiceCallProps) {
  const [callId, setCallId] = useState<string | null>(null);
  const [callState, setCallState] = useState<CallState | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceAvailable, setVoiceAvailable] = useState<boolean | null>(null);

  // Check if voice is available
  useEffect(() => {
    getVoiceStatus()
      .then((status) => setVoiceAvailable(status.available))
      .catch(() => setVoiceAvailable(false));
  }, []);

  // Start call
  const startCall = useCallback(async () => {
    setIsInitiating(true);
    setError(null);

    try {
      const response = await initiateCall({
        provider_id: providerId,
        item_description: itemDescription,
        target_price: targetPrice,
        max_price: maxPrice,
      });

      setCallId(response.call_id);

      // Start streaming updates
      const cleanup = streamCall(response.call_id, {
        onUpdate: async (data) => {
          if (data.type === "state" || data.type === "status" || data.type === "completed") {
            const state = await getCallState(response.call_id);
            setCallState(state);
          } else if (data.type === "transcript") {
            // Refresh state to get new transcript
            const state = await getCallState(response.call_id);
            setCallState(state);
          }
        },
        onComplete: () => {
          // Final state update
          getCallState(response.call_id).then(setCallState);
        },
        onError: (err) => {
          setError(err.message);
        },
      });

      // Initial state
      const state = await getCallState(response.call_id);
      setCallState(state);

      return cleanup;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start call");
    } finally {
      setIsInitiating(false);
    }
  }, [providerId, itemDescription, targetPrice, maxPrice]);

  // End call
  const endCall = useCallback(async () => {
    if (!callId) return;
    try {
      await hangupCall(callId);
    } catch (err) {
      console.error("Failed to end call:", err);
    }
  }, [callId]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      initiating: "text-yellow-400",
      ringing: "text-yellow-400",
      connected: "text-green-400",
      negotiating: "text-blue-400",
      completed: "text-green-400",
      failed: "text-red-400",
      cancelled: "text-gray-400",
    };
    return colors[status] || "text-gray-400";
  };

  const isCallActive =
    callState &&
    !["completed", "failed", "cancelled"].includes(callState.status);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Voice Call</h2>
            <p className="text-gray-400 text-sm">
              {providerName} - {providerPhone}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {voiceAvailable === false && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Voice Calling Not Available</h3>
              <p className="text-gray-400">
                Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and
                TWILIO_PHONE_NUMBER environment variables to enable voice calls.
              </p>
            </div>
          )}

          {voiceAvailable === null && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}

          {voiceAvailable && !callId && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ready to Call</h3>
              <p className="text-gray-400 mb-6">
                AI will negotiate for: {itemDescription}
                <br />
                Target: ${targetPrice.toLocaleString()} | Max: ${maxPrice.toLocaleString()}
              </p>
              <button
                onClick={startCall}
                disabled={isInitiating}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-semibold disabled:opacity-50 transition-all"
              >
                {isInitiating ? "Initiating Call..." : "Start Call"}
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {callState && (
            <div>
              {/* Call Status */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {isCallActive && (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                  <span className={`font-semibold capitalize ${getStatusColor(callState.status)}`}>
                    {callState.status.replace("_", " ")}
                  </span>
                </div>
                {isCallActive && (
                  <button
                    onClick={endCall}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold"
                  >
                    End Call
                  </button>
                )}
              </div>

              {/* Transcript */}
              <div className="bg-gray-800/50 rounded-xl p-4 max-h-64 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Live Transcript</h4>
                {callState.transcript.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Waiting for conversation...</p>
                ) : (
                  <div className="space-y-3">
                    {callState.transcript.map((entry, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 ${
                          entry.role === "agent" ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            entry.role === "agent"
                              ? "bg-blue-600/20 text-blue-100"
                              : "bg-gray-700 text-gray-100"
                          }`}
                        >
                          <p className="text-xs font-semibold mb-1 opacity-70">
                            {entry.role === "agent" ? "AI Agent" : "Dispatcher"}
                          </p>
                          <p className="text-sm">{entry.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outcome */}
              {callState.outcome && (
                <div
                  className={`mt-4 p-4 rounded-lg border ${
                    callState.outcome === "accepted"
                      ? "bg-green-900/30 border-green-500 text-green-300"
                      : "bg-gray-800 border-gray-600 text-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize">
                      {callState.outcome === "accepted" ? "Deal Accepted!" : callState.outcome}
                    </span>
                    {callState.final_price && (
                      <span className="text-xl font-bold">
                        ${callState.final_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
