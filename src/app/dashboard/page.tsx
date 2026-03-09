"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { WalletConnect } from "@/components/WalletConnect";
import { useSmoothly } from "@/contexts/SmoothlyContext";
import Link from "next/link";
import { useEffect } from "react";

const mockChat = [
  { role: "assistant" as const, text: "Welcome to Smoothly.me! You're a verified Tinder Pro. How can I help you level up your dating game?" },
  { role: "user" as const, text: "What can I do with my SMTHLY tokens?" },
  { role: "assistant" as const, text: "Great question! SMTHLY tokens unlock premium features like AI-powered profile optimization, priority matching insights, and exclusive community access. More features coming soon!" },
];

export default function DashboardPage() {
  const { matchCount, smthlyBalance, isQualified, refreshBalance, isConnected } =
    useSmoothly();

  useEffect(() => {
    if (isConnected) {
      refreshBalance();
    }
  }, [isConnected, refreshBalance]);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[5%] right-[15%] w-[400px] h-[400px] rounded-full bg-gold/[0.04] blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] rounded-full bg-purple/[0.04] blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <Link href="/">
          <span className="text-xl font-bold tracking-tight cursor-pointer">
            <span className="bg-gradient-to-r from-coral to-purple bg-clip-text text-transparent">
              smoothly
            </span>
            <span className="text-text-muted">.me</span>
          </span>
        </Link>
        <WalletConnect />
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          {isQualified && <Badge variant="gold">PRO</Badge>}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <p className="text-xs uppercase tracking-[0.15em] text-text-muted mb-1">
              SMTHLY Balance
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-gold to-gold-dark bg-clip-text text-transparent">
              {smthlyBalance}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.15em] text-text-muted mb-1">
              Verified Likes
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-coral to-purple bg-clip-text text-transparent">
              {matchCount}
            </p>
          </Card>
        </div>

        {/* AI Chat Preview */}
        <Card className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
            <p className="text-xs uppercase tracking-[0.15em] text-text-muted">
              AI Dating Coach
            </p>
            <Badge variant="muted" className="ml-auto text-xs">Preview</Badge>
          </div>

          <div className="space-y-4">
            {mockChat.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-coral to-purple text-white rounded-br-sm"
                        : "bg-surface-light text-text-secondary rounded-bl-sm"
                    }
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <input
              type="text"
              placeholder="Ask your AI coach..."
              disabled
              className="flex-1 bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm text-text-muted placeholder:text-text-muted/50 disabled:cursor-not-allowed"
            />
            <button
              disabled
              className="px-4 py-2.5 bg-surface-light border border-border rounded-xl text-text-muted text-sm disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}
