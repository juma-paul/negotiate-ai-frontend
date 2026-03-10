"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface HeaderProps {
  onNewNegotiation?: () => void;
  showNewButton?: boolean;
}

export default function Header({ onNewNegotiation, showNewButton }: HeaderProps) {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <Link href="/">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              NegotiateAI
            </h1>
          </Link>
          <p className="text-sm text-gray-400">Multi-Agent Parallel Negotiation</p>
        </div>

        <div className="flex items-center gap-4">
          {showNewButton && onNewNegotiation && (
            <button
              onClick={onNewNegotiation}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
            >
              New Negotiation
            </button>
          )}

          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-300 hidden sm:inline">
                  {user.email}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/history"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    History
                  </Link>
                  <Link
                    href="/companies"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Companies
                  </Link>
                  <div className="border-t border-gray-700 my-1" />
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-sm font-semibold transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
