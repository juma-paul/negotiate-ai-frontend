"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface CTASectionProps {
  onTryDemo: () => void;
}

export default function CTASection({ onTryDemo }: CTASectionProps) {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-12">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Save on Freight?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
              Join logistics teams saving thousands every month with AI-powered negotiation.
              No credit card required to start.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onTryDemo}
                className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-xl font-semibold text-lg transition-all"
              >
                Try Free Demo
              </button>
              {!isAuthenticated && (
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white/10 rounded-xl font-semibold text-lg transition-all"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
