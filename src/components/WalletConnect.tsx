"use client";

import { useSmoothly } from "@/contexts/SmoothlyContext";

export function WalletConnect() {
  const { isConnected, isConnecting, address, login, logout } = useSmoothly();

  if (isConnected && address) {
    const truncated = `${address.slice(0, 10)}...${address.slice(-6)}`;
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-surface border border-border rounded-xl">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-text-secondary font-mono">{truncated}</span>
        </div>
        <button
          onClick={() => logout()}
          className="
            px-3 py-2.5 rounded-xl text-sm
            bg-surface border border-border text-text-muted
            hover:border-red-500 hover:text-red-400
            transition-all duration-200
          "
          title="Disconnect wallet"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => login()}
      disabled={isConnecting}
      className="
        px-6 py-2.5 rounded-xl text-sm font-semibold
        bg-surface border border-border text-foreground
        hover:border-coral hover:text-coral
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
