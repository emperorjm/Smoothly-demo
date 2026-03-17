import { SMTHLY_TOKEN_DENOM, REST_ENDPOINT } from "@/lib/config";
import type { EncodeObject } from "@cosmjs/proto-signing";
import type { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";

const TYPE_PREFIX = "/osmosis.tokenfactory.v1beta1";

// ---------------------------------------------------------------------------
// Message Builders
// ---------------------------------------------------------------------------

export function buildMintMsg(
  sender: string,
  amount: string,
  mintToAddress?: string
): EncodeObject {
  return {
    typeUrl: `${TYPE_PREFIX}.MsgMint`,
    value: {
      sender,
      amount: { denom: SMTHLY_TOKEN_DENOM, amount },
      mintToAddress: mintToAddress || sender,
    },
  };
}

export function buildBurnMsg(
  sender: string,
  amount: string,
  burnFromAddress?: string
): EncodeObject {
  return {
    typeUrl: `${TYPE_PREFIX}.MsgBurn`,
    value: {
      sender,
      amount: { denom: SMTHLY_TOKEN_DENOM, amount },
      burnFromAddress: burnFromAddress || sender,
    },
  };
}

export function buildChangeAdminMsg(
  sender: string,
  newAdmin: string
): EncodeObject {
  return {
    typeUrl: `${TYPE_PREFIX}.MsgChangeAdmin`,
    value: {
      sender,
      denom: SMTHLY_TOKEN_DENOM,
      newAdmin,
    },
  };
}

export function buildSetMetadataMsg(
  sender: string,
  metadata: {
    description: string;
    denomUnits: { denom: string; exponent: number; aliases: string[] }[];
    base: string;
    display: string;
    name: string;
    symbol: string;
  }
): EncodeObject {
  return {
    typeUrl: `${TYPE_PREFIX}.MsgSetDenomMetadata`,
    value: {
      sender,
      metadata,
    },
  };
}

// ---------------------------------------------------------------------------
// Execute Helper
// ---------------------------------------------------------------------------

export async function executeTokenFactoryMsg(
  client: SigningStargateClient,
  signerAddress: string,
  msg: EncodeObject
): Promise<DeliverTxResponse> {
  return client.signAndBroadcast(signerAddress, [msg], "auto");
}

// ---------------------------------------------------------------------------
// REST Query Functions
// ---------------------------------------------------------------------------

export async function queryTotalSupply(): Promise<string> {
  if (!SMTHLY_TOKEN_DENOM || !REST_ENDPOINT) return "0";
  try {
    const url = `${REST_ENDPOINT}/cosmos/bank/v1beta1/supply/by_denom?denom=${encodeURIComponent(SMTHLY_TOKEN_DENOM)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { amount?: { amount?: string } };
    return data.amount?.amount ?? "0";
  } catch (error) {
    console.warn("Failed to query total supply:", error);
    return "0";
  }
}

export async function queryDenomMetadata(): Promise<{
  name: string;
  symbol: string;
  description: string;
  denomUnits: { denom: string; exponent: number; aliases: string[] }[];
  base: string;
  display: string;
} | null> {
  if (!SMTHLY_TOKEN_DENOM || !REST_ENDPOINT) return null;
  try {
    const url = `${REST_ENDPOINT}/cosmos/bank/v1beta1/denoms_metadata/${encodeURIComponent(SMTHLY_TOKEN_DENOM)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      metadata?: {
        name: string;
        symbol: string;
        description: string;
        denom_units: { denom: string; exponent: number; aliases: string[] }[];
        base: string;
        display: string;
      };
    };
    if (!data.metadata) return null;
    return {
      name: data.metadata.name,
      symbol: data.metadata.symbol,
      description: data.metadata.description,
      denomUnits: data.metadata.denom_units ?? [],
      base: data.metadata.base,
      display: data.metadata.display,
    };
  } catch (error) {
    console.warn("Failed to query denom metadata:", error);
    return null;
  }
}

export async function queryDenomsByCreator(
  address: string
): Promise<string[]> {
  if (!REST_ENDPOINT) return [];
  try {
    const url = `${REST_ENDPOINT}/osmosis/tokenfactory/v1beta1/denoms_from_creator/${address}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { denoms?: string[] };
    return data.denoms ?? [];
  } catch (error) {
    console.warn("Failed to query denoms by creator:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function formatTokenAmount(
  baseAmount: string,
  decimals: number = 6
): string {
  if (!baseAmount || baseAmount === "0") return "0";
  const str = baseAmount.padStart(decimals + 1, "0");
  const intPart = str.slice(0, str.length - decimals) || "0";
  const fracPart = str.slice(str.length - decimals);
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmedFrac = fracPart.replace(/0+$/, "");
  return trimmedFrac ? `${formattedInt}.${trimmedFrac}` : formattedInt;
}

export function toBaseUnits(
  displayAmount: string,
  decimals: number = 6
): string {
  if (!displayAmount || displayAmount === "0") return "0";
  const parts = displayAmount.split(".");
  const intPart = parts[0] || "0";
  const fracPart = (parts[1] || "").slice(0, decimals).padEnd(decimals, "0");
  const full = intPart + fracPart;
  // Strip leading zeros
  const stripped = full.replace(/^0+/, "") || "0";
  return stripped;
}
