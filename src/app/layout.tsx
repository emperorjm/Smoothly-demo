"use client";

import { useMemo } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import { SmoothlyProvider } from "@/contexts/SmoothlyContext";
import {
  CHAIN_ID,
  TREASURY_CONTRACT_ADDRESS,
  RPC_ENDPOINT,
  REST_ENDPOINT,
} from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const treasuryConfig = useMemo(
    () => ({
      chainId: CHAIN_ID,
      treasury: TREASURY_CONTRACT_ADDRESS,
      rpcUrl:
        typeof window !== "undefined"
          ? `${window.location.origin}/api/rpc`
          : RPC_ENDPOINT,
      restUrl: REST_ENDPOINT,
    }),
    []
  );

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AbstraxionProvider config={treasuryConfig}>
          <SmoothlyProvider>
            {children}
          </SmoothlyProvider>
        </AbstraxionProvider>
      </body>
    </html>
  );
}
