"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { Input } from "@/components/ui/Input";
import { WalletConnect } from "@/components/WalletConnect";
import {
  SMTHLY_TOKEN_DENOM,
  SMTHLY_ADMIN_ADDRESS,
  EXPLORER_BASE_URL,
} from "@/lib/config";
import { queryBalance } from "@/lib/tokenService";
import { transferTokens } from "@/lib/tokenService";
import {
  buildMintMsg,
  buildBurnMsg,
  buildChangeAdminMsg,
  buildSetMetadataMsg,
  executeTokenFactoryMsg,
  queryTotalSupply,
  queryDenomMetadata,
  formatTokenAmount,
  toBaseUnits,
} from "@/lib/tokenFactoryService";
import { useSmoothly } from "@/contexts/SmoothlyContext";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OpStatus = "idle" | "pending" | "success" | "error";
interface OpResult {
  status: OpStatus;
  txHash?: string;
  error?: string;
}

const INITIAL_RESULT: OpResult = { status: "idle" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function TxStatus({ result }: { result: OpResult }) {
  if (result.status === "idle") return null;
  if (result.status === "pending")
    return <p className="text-sm text-text-muted mt-3">Processing...</p>;
  if (result.status === "success")
    return (
      <p className="text-sm text-success mt-3">
        Success!{" "}
        {result.txHash && (
          <a
            href={`${EXPLORER_BASE_URL}/tx/${result.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-success/80"
          >
            View tx
          </a>
        )}
      </p>
    );
  return (
    <p className="text-sm text-error mt-3 break-all">
      Error: {result.error}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold tracking-tight mb-4">{children}</h2>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const { isConnected, address, client } = useSmoothly();

  // --- Read-only state ---
  const [totalSupply, setTotalSupply] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Awaited<
    ReturnType<typeof queryDenomMetadata>
  >>(null);
  const [balanceLookupAddr, setBalanceLookupAddr] = useState("");
  const [balanceLookupResult, setBalanceLookupResult] = useState<string | null>(
    null
  );

  // --- Mint ---
  const [mintAmount, setMintAmount] = useState("");
  const [mintTo, setMintTo] = useState("");
  const [mintResult, setMintResult] = useState<OpResult>(INITIAL_RESULT);

  // --- Burn ---
  const [burnAmount, setBurnAmount] = useState("");
  const [burnFrom, setBurnFrom] = useState("");
  const [burnResult, setBurnResult] = useState<OpResult>(INITIAL_RESULT);

  // --- Change Admin ---
  const [newAdmin, setNewAdmin] = useState("");
  const [changeAdminConfirm, setChangeAdminConfirm] = useState(false);
  const [changeAdminResult, setChangeAdminResult] =
    useState<OpResult>(INITIAL_RESULT);

  // --- Set Metadata ---
  const [metaName, setMetaName] = useState("");
  const [metaSymbol, setMetaSymbol] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [setMetaResult, setSetMetaResult] =
    useState<OpResult>(INITIAL_RESULT);

  // --- Transfer ---
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferResult, setTransferResult] =
    useState<OpResult>(INITIAL_RESULT);

  // --- Auto-fetch read-only data ---
  const fetchSupply = useCallback(async () => {
    const supply = await queryTotalSupply();
    setTotalSupply(supply);
  }, []);

  const fetchMetadata = useCallback(async () => {
    const meta = await queryDenomMetadata();
    setMetadata(meta);
  }, []);

  useEffect(() => {
    fetchSupply();
    fetchMetadata();
  }, [fetchSupply, fetchMetadata]);

  // --- Refresh supply after any write op ---
  const afterWrite = useCallback(() => {
    fetchSupply();
  }, [fetchSupply]);

  // --- Operation handlers ---

  async function handleMint() {
    if (!client || !address || !mintAmount) return;
    setMintResult({ status: "pending" });
    try {
      const base = toBaseUnits(mintAmount);
      const msg = buildMintMsg(address, base, mintTo || undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await executeTokenFactoryMsg(client as any, address, msg);
      setMintResult({ status: "success", txHash: res.transactionHash });
      setMintAmount("");
      setMintTo("");
      afterWrite();
    } catch (err) {
      setMintResult({
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function handleBurn() {
    if (!client || !address || !burnAmount) return;
    setBurnResult({ status: "pending" });
    try {
      const base = toBaseUnits(burnAmount);
      const msg = buildBurnMsg(address, base, burnFrom || undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await executeTokenFactoryMsg(client as any, address, msg);
      setBurnResult({ status: "success", txHash: res.transactionHash });
      setBurnAmount("");
      setBurnFrom("");
      afterWrite();
    } catch (err) {
      setBurnResult({
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function handleChangeAdmin() {
    if (!client || !address || !newAdmin) return;
    setChangeAdminResult({ status: "pending" });
    try {
      const msg = buildChangeAdminMsg(address, newAdmin);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await executeTokenFactoryMsg(client as any, address, msg);
      setChangeAdminResult({
        status: "success",
        txHash: res.transactionHash,
      });
      setNewAdmin("");
      setChangeAdminConfirm(false);
    } catch (err) {
      setChangeAdminResult({
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function handleSetMetadata() {
    if (!client || !address) return;
    setSetMetaResult({ status: "pending" });
    try {
      const msg = buildSetMetadataMsg(address, {
        description: metaDescription,
        denomUnits: [
          { denom: SMTHLY_TOKEN_DENOM, exponent: 0, aliases: [] },
          { denom: metaSymbol || "SMTHLY", exponent: 6, aliases: [] },
        ],
        base: SMTHLY_TOKEN_DENOM,
        display: metaSymbol || "SMTHLY",
        name: metaName,
        symbol: metaSymbol,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await executeTokenFactoryMsg(client as any, address, msg);
      setSetMetaResult({ status: "success", txHash: res.transactionHash });
      fetchMetadata();
    } catch (err) {
      setSetMetaResult({
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function handleTransfer() {
    if (!client || !address || !transferRecipient || !transferAmount) return;
    setTransferResult({ status: "pending" });
    try {
      const base = toBaseUnits(transferAmount);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await transferTokens(client as any, address, transferRecipient, base);
      const txRes = res as { transactionHash?: string };
      setTransferResult({
        status: "success",
        txHash: txRes.transactionHash,
      });
      setTransferRecipient("");
      setTransferAmount("");
      afterWrite();
    } catch (err) {
      setTransferResult({
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function handleBalanceLookup() {
    if (!balanceLookupAddr) return;
    const bal = await queryBalance(balanceLookupAddr);
    setBalanceLookupResult(bal);
  }

  function handleLoadCurrentMetadata() {
    if (!metadata) return;
    setMetaName(metadata.name);
    setMetaSymbol(metadata.symbol);
    setMetaDescription(metadata.description);
  }

  // --- Derived ---
  const highestExponent =
    metadata?.denomUnits?.reduce(
      (max, u) => (u.exponent > max ? u.exponent : max),
      0
    ) ?? 0;

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[5%] right-[15%] w-[400px] h-[400px] rounded-full bg-coral/[0.04] blur-[120px]" />
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
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Token Factory Admin
          </h1>
          <Badge variant="coral">DEMO</Badge>
        </div>
        <p className="text-sm text-text-muted font-mono mb-1 break-all">
          Denom: {SMTHLY_TOKEN_DENOM}
        </p>
        <p className="text-sm text-text-muted font-mono mb-8 break-all">
          Admin: {SMTHLY_ADMIN_ADDRESS}
        </p>

        {!isConnected && (
          <Card className="mb-8 text-center">
            <p className="text-text-secondary mb-4">
              Connect your wallet to use admin operations.
            </p>
          </Card>
        )}

        {/* ============================================================= */}
        {/* READ-ONLY QUERIES */}
        {/* ============================================================= */}
        <SectionTitle>Read-Only Queries</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {/* Total Supply */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-[0.15em] text-text-muted">
                Total Supply
              </p>
              <button
                onClick={fetchSupply}
                className="text-xs text-text-muted hover:text-coral transition-colors"
              >
                Refresh
              </button>
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-coral to-purple bg-clip-text text-transparent">
              {totalSupply !== null ? formatTokenAmount(totalSupply) : "..."}
            </p>
          </Card>

          {/* Denom Metadata */}
          <Card>
            <p className="text-xs uppercase tracking-[0.15em] text-text-muted mb-2">
              Denom Metadata
            </p>
            {metadata ? (
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-text-muted">Name:</span>{" "}
                  {metadata.name || "—"}
                </p>
                <p>
                  <span className="text-text-muted">Symbol:</span>{" "}
                  {metadata.symbol || "—"}
                </p>
                <p>
                  <span className="text-text-muted">Desc:</span>{" "}
                  {metadata.description || "—"}
                </p>
                <p>
                  <span className="text-text-muted">Exponent:</span>{" "}
                  {highestExponent}
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-muted">No metadata set</p>
            )}
          </Card>

          {/* Balance Lookup */}
          <Card>
            <p className="text-xs uppercase tracking-[0.15em] text-text-muted mb-2">
              Balance Lookup
            </p>
            <Input
              value={balanceLookupAddr}
              onChange={setBalanceLookupAddr}
              placeholder="xion1..."
              mono
              className="mb-2"
            />
            <button
              onClick={handleBalanceLookup}
              disabled={!balanceLookupAddr}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-surface-light border border-border text-foreground hover:border-coral hover:text-coral transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Query
            </button>
            {balanceLookupResult !== null && (
              <p className="text-sm mt-2 font-mono">
                {formatTokenAmount(balanceLookupResult)} SMTHLY
              </p>
            )}
          </Card>
        </div>

        {/* ============================================================= */}
        {/* ADMIN OPERATIONS */}
        {/* ============================================================= */}
        <SectionTitle>Admin Operations</SectionTitle>
        <Card className="mb-6 !bg-surface-light/50 !border-warning/20">
          <p className="text-sm text-warning">
            Admin operations require the connected wallet to be the token admin.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {/* Mint */}
          <Card>
            <p className="text-xs uppercase tracking-[0.15em] text-text-muted mb-4">
              Mint Tokens
            </p>
            <Input
              label="Amount (display units)"
              value={mintAmount}
              onChange={setMintAmount}
              placeholder="100"
              type="number"
              className="mb-3"
            />
            <Input
              label="Mint To (optional)"
              value={mintTo}
              onChange={setMintTo}
              placeholder="xion1... (defaults to you)"
              mono
              className="mb-4"
            />
            <GradientButton
              onClick={handleMint}
              disabled={
                !isConnected || !mintAmount || mintResult.status === "pending"
              }
              className="w-full !py-3 !text-sm"
            >
              {mintResult.status === "pending" ? "Processing..." : "Mint"}
            </GradientButton>
            <TxStatus result={mintResult} />
          </Card>

          {/* Burn */}
          <Card>
            <p className="text-xs uppercase tracking-[0.15em] text-text-muted mb-4">
              Burn Tokens
            </p>
            <Input
              label="Amount (display units)"
              value={burnAmount}
              onChange={setBurnAmount}
              placeholder="100"
              type="number"
              className="mb-3"
            />
            <Input
              label="Burn From (optional)"
              value={burnFrom}
              onChange={setBurnFrom}
              placeholder="xion1... (defaults to you)"
              mono
              className="mb-4"
            />
            <GradientButton
              onClick={handleBurn}
              disabled={
                !isConnected || !burnAmount || burnResult.status === "pending"
              }
              className="w-full !py-3 !text-sm"
            >
              {burnResult.status === "pending" ? "Processing..." : "Burn"}
            </GradientButton>
            <TxStatus result={burnResult} />
          </Card>

          {/* Change Admin */}
          <Card>
            <p className="text-xs uppercase tracking-[0.15em] text-text-muted mb-4">
              Change Admin
            </p>
            <Input
              label="New Admin Address"
              value={newAdmin}
              onChange={(v) => {
                setNewAdmin(v);
                setChangeAdminConfirm(false);
              }}
              placeholder="xion1..."
              mono
              className="mb-4"
            />
            {!changeAdminConfirm ? (
              <button
                onClick={() => setChangeAdminConfirm(true)}
                disabled={!isConnected || !newAdmin}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-surface-light border border-error/30 text-error hover:border-error hover:bg-error/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Change Admin
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-error">
                  This is irreversible! Are you sure?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChangeAdminConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-xl text-sm bg-surface-light border border-border text-text-muted hover:border-text-muted transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangeAdmin}
                    disabled={changeAdminResult.status === "pending"}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-error/20 border border-error text-error hover:bg-error/30 transition-all duration-200 disabled:opacity-50"
                  >
                    {changeAdminResult.status === "pending"
                      ? "Processing..."
                      : "Confirm"}
                  </button>
                </div>
              </div>
            )}
            <TxStatus result={changeAdminResult} />
          </Card>

          {/* Set Metadata */}
          <Card className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-[0.15em] text-text-muted">
                Modify Metadata
              </p>
              <button
                onClick={handleLoadCurrentMetadata}
                disabled={!metadata}
                className="text-xs text-text-muted hover:text-coral transition-colors disabled:opacity-50"
              >
                Load Current
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Input
                label="Name"
                value={metaName}
                onChange={setMetaName}
                placeholder="Smoothly Token"
              />
              <Input
                label="Symbol"
                value={metaSymbol}
                onChange={setMetaSymbol}
                placeholder="SMTHLY"
              />
              <Input
                label="Description"
                value={metaDescription}
                onChange={setMetaDescription}
                placeholder="The Smoothly governance token"
              />
            </div>
            <GradientButton
              onClick={handleSetMetadata}
              disabled={
                !isConnected || setMetaResult.status === "pending"
              }
              className="w-full !py-3 !text-sm"
            >
              {setMetaResult.status === "pending"
                ? "Processing..."
                : "Set Metadata"}
            </GradientButton>
            <TxStatus result={setMetaResult} />
          </Card>
        </div>

        {/* ============================================================= */}
        {/* USER OPERATIONS */}
        {/* ============================================================= */}
        <SectionTitle>User Operations</SectionTitle>
        <Card>
          <p className="text-xs uppercase tracking-[0.15em] text-text-muted mb-4">
            Transfer Tokens
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Input
              label="Recipient"
              value={transferRecipient}
              onChange={setTransferRecipient}
              placeholder="xion1..."
              mono
            />
            <Input
              label="Amount (display units)"
              value={transferAmount}
              onChange={setTransferAmount}
              placeholder="100"
              type="number"
            />
          </div>
          <GradientButton
            onClick={handleTransfer}
            disabled={
              !isConnected ||
              !transferRecipient ||
              !transferAmount ||
              transferResult.status === "pending"
            }
            className="w-full !py-3 !text-sm"
          >
            {transferResult.status === "pending"
              ? "Processing..."
              : "Transfer"}
          </GradientButton>
          <TxStatus result={transferResult} />
        </Card>
      </div>
    </main>
  );
}
