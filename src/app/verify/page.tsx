"use client";

import { VerificationFlow } from "@/components/VerificationFlow";
import { WalletConnect } from "@/components/WalletConnect";
import { Card } from "@/components/ui/Card";
import { useSmoothly } from "@/contexts/SmoothlyContext";
import Link from "next/link";

export default function VerifyPage() {
  const { isConnected, address } = useSmoothly();

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-purple/[0.05] blur-[100px]" />
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
      <div className="relative z-10 max-w-lg mx-auto px-6 pt-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          Verify Your Likes
        </h1>
        <p className="text-text-secondary mb-10">
          Connect your wallet, then prove your Tinder likes using zero-knowledge proofs.
        </p>

        {/* Step 1: Wallet */}
        <Card className="mb-6" glow={!isConnected}>
          <div className="flex items-start gap-4">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
                ${isConnected ? "bg-success/20 text-success" : "bg-surface-light text-text-muted"}
              `}
            >
              {isConnected ? "\u2713" : "1"}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Connect Wallet</h3>
              {isConnected && address ? (
                <p className="text-sm text-text-secondary font-mono">
                  {address.slice(0, 16)}...{address.slice(-8)}
                </p>
              ) : (
                <p className="text-sm text-text-muted">
                  Link your XION wallet to receive tokens
                </p>
              )}
              {!isConnected && (
                <div className="mt-3">
                  <WalletConnect />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Step 2: Verify */}
        <Card className={!isConnected ? "opacity-50 pointer-events-none" : ""} glow={isConnected}>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold bg-surface-light text-text-muted">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Verify Tinder Likes</h3>
              <p className="text-sm text-text-muted mb-4">
                A secure browser window will open for you to verify your Tinder data.
                No personal information is shared.
              </p>
              <VerificationFlow />
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
