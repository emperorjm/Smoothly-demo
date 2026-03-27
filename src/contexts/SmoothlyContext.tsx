"use client";

import { SMTHLY_REWARDS_AMOUNT } from "@/lib/config";
import { isProQualified } from "@/lib/threshold";
import { registerTokenFactoryTypes } from "@/lib/tokenFactoryTypes";
import { queryBalance } from "@/lib/tokenService";
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface SmoothlyState {
  isVerified: boolean;
  matchCount: number;
  isQualified: boolean;
  smthlyBalance: string;
  isConnected: boolean;
  isConnecting: boolean;
  address: string | undefined;
  login: () => void;
  logout: () => Promise<void>;
  client: ReturnType<typeof useAbstraxionSigningClient>["client"];
  setVerificationResult: (count: number) => void;
  refreshBalance: () => Promise<void>;
  setTokensClaimed: (claimed: boolean) => void;
  tokensClaimed: boolean;
  rewardsAmount: string;
}

const SmoothlyContext = createContext<SmoothlyState | null>(null);

export function SmoothlyProvider({ children }: { children: React.ReactNode }) {
  const { client } = useAbstraxionSigningClient();
  const {
    data: account,
    isConnected,
    login,
    logout,
    isConnecting,
  } = useAbstraxionAccount();

  const [isVerified, setIsVerified] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [smthlyBalance, setSmthlyBalance] = useState("0");
  const [tokensClaimed, setTokensClaimed] = useState(false);

  useEffect(() => {
    if (client && "registry" in client) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerTokenFactoryTypes((client as any).registry);
    }
  }, [client]);

  const isQualified = isProQualified(matchCount);

  const setVerificationResult = useCallback((count: number) => {
    setMatchCount(count);
    setIsVerified(true);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!account?.bech32Address) return;
    const balance = await queryBalance(account.bech32Address);
    setSmthlyBalance(balance);
  }, [account?.bech32Address]);

  return (
    <SmoothlyContext.Provider
      value={{
        isVerified,
        matchCount,
        isQualified,
        smthlyBalance,
        isConnected,
        isConnecting,
        address: account?.bech32Address,
        login,
        logout,
        client,
        setVerificationResult,
        refreshBalance,
        setTokensClaimed,
        tokensClaimed,
        rewardsAmount: SMTHLY_REWARDS_AMOUNT,
      }}
    >
      {children}
    </SmoothlyContext.Provider>
  );
}

export function useSmoothly(): SmoothlyState {
  const ctx = useContext(SmoothlyContext);
  if (!ctx) {
    throw new Error("useSmoothly must be used within SmoothlyProvider");
  }
  return ctx;
}
