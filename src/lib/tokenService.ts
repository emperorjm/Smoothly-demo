import { SMTHLY_TOKEN_ADDRESS } from "@/lib/config";

interface SigningClient {
  queryContractSmart(address: string, queryMsg: unknown): Promise<unknown>;
  execute(
    sender: string,
    contract: string,
    msg: unknown,
    fee: number | "auto" | { amount: { denom: string; amount: string }[]; gas: string },
    memo?: string,
    funds?: readonly { denom: string; amount: string }[]
  ): Promise<unknown>;
}

export async function queryBalance(
  client: SigningClient,
  address: string
): Promise<string> {
  if (!SMTHLY_TOKEN_ADDRESS) return "0";

  try {
    const result = (await client.queryContractSmart(SMTHLY_TOKEN_ADDRESS, {
      balance: { address },
    })) as { balance: string };
    return result.balance ?? "0";
  } catch (error) {
    console.warn("Failed to query SMTHLY balance:", error);
    return "0";
  }
}

export async function transferTokens(
  client: SigningClient,
  sender: string,
  recipient: string,
  amount: string
): Promise<unknown> {
  return client.execute(
    sender,
    SMTHLY_TOKEN_ADDRESS,
    {
      transfer: { recipient, amount },
    },
    "auto"
  );
}
