"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { WalletConnect } from "@/components/WalletConnect";
import { TINDER_PRO_THRESHOLD, SMTHLY_REWARDS_AMOUNT } from "@/lib/config";
import { transferTokens } from "@/lib/tokenService";
import { useSmoothly } from "@/contexts/SmoothlyContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResultsPage() {
  const {
    matchCount,
    isQualified,
    isVerified,
    client,
    address,
    tokensClaimed,
    setTokensClaimed,
    refreshBalance,
  } = useSmoothly();
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const remaining = Math.max(TINDER_PRO_THRESHOLD - matchCount, 0);

  const handleClaimTokens = async () => {
    if (!client || !address) return;
    setClaiming(true);
    setClaimError(null);

    try {
      await transferTokens(
        client,
        address,
        address,
        SMTHLY_REWARDS_AMOUNT
      );
      setTokensClaimed(true);
      await refreshBalance();
    } catch (err) {
      console.error("Token claim error:", err);
      setClaimError(
        err instanceof Error ? err.message : "Failed to claim tokens"
      );
    } finally {
      setClaiming(false);
    }
  };

  if (!isVerified) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-3">No Verification Yet</h2>
          <p className="text-text-secondary mb-6">
            Complete a verification first to see your results.
          </p>
          <Link href="/verify">
            <GradientButton>Go to Verification</GradientButton>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        {isQualified && (
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.06] blur-[120px]" />
        )}
        <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-coral/[0.04] blur-[100px]" />
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
      <div className="relative z-10 max-w-lg mx-auto px-6 pt-12">
        {/* Match Count Hero */}
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-text-muted mb-4">
            Verified Likes
          </p>
          <div className="text-8xl font-black tracking-tight bg-gradient-to-r from-coral to-purple bg-clip-text text-transparent mb-4">
            {matchCount}
          </div>
          {isQualified ? (
            <Badge variant="gold" className="text-base px-5 py-2">
              TINDER PRO
            </Badge>
          ) : (
            <p className="text-text-secondary">
              {remaining} more like{remaining !== 1 ? "s" : ""} to Tinder Pro
            </p>
          )}
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <h3 className="font-semibold mb-4">Pro Qualification Progress</h3>
          <ProgressBar value={matchCount} max={TINDER_PRO_THRESHOLD} />
        </Card>

        {/* Actions */}
        {isQualified ? (
          <Card glow className="mb-6">
            <div className="text-center">
              <p className="text-gold font-semibold mb-1">
                You&apos;re qualified!
              </p>
              <p className="text-sm text-text-secondary mb-5">
                Claim your SMTHLY token reward
              </p>
              {tokensClaimed ? (
                <div className="space-y-3">
                  <Badge variant="gold">Tokens Claimed</Badge>
                  <div className="mt-4">
                    <Link href="/dashboard">
                      <GradientButton variant="gold" className="w-full">
                        Go to Dashboard
                      </GradientButton>
                    </Link>
                  </div>
                </div>
              ) : (
                <GradientButton
                  variant="gold"
                  onClick={handleClaimTokens}
                  disabled={claiming}
                  className="w-full"
                >
                  {claiming ? "Claiming..." : `Claim ${SMTHLY_REWARDS_AMOUNT} SMTHLY`}
                </GradientButton>
              )}
              {claimError && (
                <p className="text-error text-sm mt-3">{claimError}</p>
              )}
            </div>
          </Card>
        ) : (
          <div className="text-center">
            <GradientButton
              onClick={() => router.push("/verify")}
              className="w-full"
            >
              Re-verify Likes
            </GradientButton>
          </div>
        )}
      </div>
    </main>
  );
}
