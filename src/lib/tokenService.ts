import { SMTHLY_TOKEN_DENOM, REST_ENDPOINT } from "@/lib/config";
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export async function queryBalance(address: string): Promise<string> {
  if (!SMTHLY_TOKEN_DENOM || !REST_ENDPOINT) return "0";

  try {
    const url = `${REST_ENDPOINT}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${encodeURIComponent(SMTHLY_TOKEN_DENOM)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { balance?: { amount?: string } };
    return data.balance?.amount ?? "0";
  } catch (error) {
    console.warn("Failed to query SMTHLY balance:", error);
    return "0";
  }
}

export async function transferTokens(
  client: SigningCosmWasmClient,
  sender: string,
  recipient: string,
  amount: string
): Promise<unknown> {
  return client.sendTokens(
    sender,
    recipient,
    [{ denom: SMTHLY_TOKEN_DENOM, amount }],
    "auto"
  );
}
