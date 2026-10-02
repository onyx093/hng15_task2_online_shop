'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Database, Mail, ShieldCheck, ChevronRight, X, Sparkles, Check } from 'lucide-react';

export function SetupBanner() {
  const { services, user, demoSignIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const allConnected = services.neon && services.google && services.mailgun;

  if (dismissed && !isOpen) return null;

  return (
    <>
      {/* Subtle indicator bar */}
      <div className="bg-zinc-950 text-zinc-300 text-xs py-2 px-4 border-b border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${allConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${allConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              System Integrations:
            </span>

            {/* Neon DB Indicator */}
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Database className="w-3.5 h-3.5" />
              <span>Neon DB:</span>
              {services.neon ? (
                <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="text-amber-400 font-medium">Local Seed Fallback</span>
              )}
            </div>

            {/* Google Auth Indicator */}
            <div className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Google Cloud Auth:</span>
              {services.google ? (
                <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="text-amber-400 font-medium">Demo Auth Ready</span>
              )}
            </div>

            {/* Mailgun Indicator */}
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Mail className="w-3.5 h-3.5" />
              <span>Mailgun:</span>
              {services.mailgun ? (
                <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="text-amber-400 font-medium">UI Preview Mode</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="text-zinc-300 hover:text-white underline underline-offset-2 flex items-center gap-1 transition"
            >
              <span>Setup Guide / Status</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Setup Guide Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                <h3 className="font-serif text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  Integration Configuration Guide
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm text-zinc-700 dark:text-zinc-300">
              <p className="text-zinc-600 dark:text-zinc-400">
                AURA is fully wired to integrate with <strong>Neon PostgreSQL</strong>, <strong>Google Cloud Console</strong>, and <strong>Mailgun</strong>. You can configure your credentials in a <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-xs">.env.local</code> file in the project root.
              </p>

              {/* Service Cards */}
              <div className="space-y-4">
                {/* 1. Neon */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      1. Neon PostgreSQL Database
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${services.neon ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                      {services.neon ? 'Connected' : 'Using Local Seed'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    Create a free PostgreSQL database at <strong>neon.tech</strong> and copy the connection string.
                  </p>
                  <pre className="p-2.5 rounded bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto">
                    DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
                  </pre>
                </div>

                {/* 2. Google OAuth */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      2. Google Cloud Console OAuth 2.0
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${services.google ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'}`}>
                      {services.google ? 'Active' : 'Demo Auth Available'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    In Google Cloud Console, create OAuth 2.0 Credentials (Web Application) with Authorized redirect URI:
                    <br />
                    <code className="text-zinc-800 dark:text-zinc-200 font-mono">http://localhost:3000/api/auth/callback/google</code>
                  </p>
                  <pre className="p-2.5 rounded bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto">
                    GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
                    <br />
                    GOOGLE_CLIENT_SECRET="your-client-secret"
                    <br />
                    NEXT_PUBLIC_APP_URL="http://localhost:3000"
                  </pre>
                  {!user && (
                    <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Test authentication flow immediately:</span>
                      <button
                        onClick={async () => {
                          await demoSignIn();
                          setIsOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition"
                      >
                        Sign In as Demo Customer
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Mailgun */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      3. Mailgun Confirmation Emails
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${services.mailgun ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'}`}>
                      {services.mailgun ? 'Live Delivery' : 'Interactive Preview'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    Retrieve your API key and sandbox domain from your Mailgun dashboard.
                  </p>
                  <pre className="p-2.5 rounded bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto">
                    MAILGUN_API_KEY="your-mailgun-api-key"
                    <br />
                    MAILGUN_DOMAIN="sandbox-xyz.mailgun.org"
                    <br />
                    EMAIL_FROM="AURA Home & Living &lt;orders@sandbox-xyz.mailgun.org&gt;"
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
