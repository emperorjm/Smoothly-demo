# Smoothly.me Integration Guide

> How to integrate **Reclaim Protocol zkTLS** and **XION Abstraxion wallet** into your application.
> This guide walks through the demo app (smoothly-web) as a reference implementation.

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Prerequisites](#2-prerequisites)
3. [Environment Configuration](#3-environment-configuration)
4. [Reclaim Protocol Integration (zkTLS)](#4-reclaim-protocol-integration-zktls)
5. [XION Abstraxion Wallet Integration](#5-xion-abstraxion-wallet-integration)
6. [Application Flow](#6-application-flow)
7. [Key Files Reference](#7-key-files-reference)
8. [Adapting for Production](#8-adapting-for-production)

---

## 1. Overview & Architecture

### What the Demo Does

Smoothly.web lets users **prove their Tinder likes count** using zero-knowledge proofs (via Reclaim Protocol), then **claim on-chain token rewards** (via XION) if they meet a qualification threshold. No personal dating data is ever exposed.

**End-to-end flow:**

1. User connects their XION wallet (Abstraxion)
2. User verifies their Tinder likes via Reclaim zkTLS (browser extension, QR/mobile, or web iframe)
3. Proof is verified client-side
4. If likes >= threshold, user can claim SMTHLY tokens on XION testnet
5. User is redirected to a dashboard showing balance and status

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| zkTLS Proofs | Reclaim Protocol JS SDK v4 — [Tinder Likes and Matches provider](https://dev.reclaimprotocol.org/provider/details/ae25fa88-2572-4c3e-81cf-e9f980cf18aa) |
| Blockchain | XION (Cosmos-based, testnet) |
| Wallet | Abstraxion (XION's account abstraction wallet) |
| Token Standard | CW20 (CosmWasm) |

### Architecture Diagram

```
+------------------+       +---------------------+       +------------------+
|                  |       |                     |       |                  |
|  Landing Page    +------>+  /verify            +------>+  /results        |
|  (src/app/page)  |       |  Connect wallet     |       |  Show likes      |
|                  |       |  + Reclaim zkTLS     |       |  Claim tokens    |
+------------------+       +---------------------+       +--------+---------+
                                                                  |
                                                                  v
                                                         +------------------+
                                                         |  /dashboard      |
                                                         |  Balance + Chat  |
                                                         +------------------+

 Providers (src/app/layout.tsx):
 +-----------------------------------------------------------------+
 |  AbstraxionProvider  (wallet, signing client, RPC config)       |
 |  +-----------------------------------------------------------+ |
 |  |  SmoothlyProvider  (app state: verification, balance, etc) | |
 |  |  +-------------------------------------------------------+| |
 |  |  |  Page Components                                       || |
 |  |  +-------------------------------------------------------+| |
 |  +-----------------------------------------------------------+ |
 +-----------------------------------------------------------------+

 API Routes:
 Browser --> /api/reclaim --> Reclaim SDK init (keeps appSecret server-side)
 Browser --> /api/rpc    --> XION RPC node (avoids CORS issues)
```

### Provider Hierarchy

```
<AbstraxionProvider>        # XION wallet context (connection, signing)
  <SmoothlyProvider>        # App-level state (verification results, balance)
    {children}              # Page components
  </SmoothlyProvider>
</AbstraxionProvider>
```

---

## 2. Prerequisites

### Reclaim Protocol

You need three values from the [Reclaim Developer Portal](https://dev.reclaimprotocol.org/):

| Value | Description |
|-------|------------|
| `appId` | Your application identifier |
| `appSecret` | Secret key for signing proof requests |
| `providerId` | The specific data provider to verify against (e.g., Tinder Likes and Matches) |

**This demo uses the [Tinder Likes and Matches](https://dev.reclaimprotocol.org/provider/details/ae25fa88-2572-4c3e-81cf-e9f980cf18aa) provider** (ID: `ae25fa88-2572-4c3e-81cf-e9f980cf18aa`).

**Steps to obtain credentials:**
1. Sign up at the Reclaim Developer Portal
2. Create a new application
3. Select the "Tinder Likes and Matches" provider (or your own)
4. Copy the `appId`, `appSecret`, and `providerId`

### XION Blockchain

| Value | Description |
|-------|------------|
| Treasury contract | An XION meta-account contract that sponsors gas fees for users |
| CW20 token contract | The SMTHLY token contract address on XION testnet |
| RPC endpoint | XION testnet RPC URL (default: `https://rpc.xion-testnet-2.burnt.com:443`) |
| REST endpoint | XION testnet REST URL |

### Dependencies

```json
{
  "dependencies": {
    "@burnt-labs/abstraxion": "^1.0.0-alpha.75",
    "@reclaimprotocol/js-sdk": "^4.14.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "patch-package": "^8.0.1"
  }
}
```

Install with:

```bash
npm install
```

> **Note:** The `postinstall` script runs `patch-package` automatically to apply required patches (see [Abstraxion Core Patch](#abstraxion-core-patch) below).

---

## 3. Environment Configuration

### Environment Variables

Create a `.env.local` file in the project root. You can use the demo values below to get started quickly on XION testnet — replace them with your own credentials for production:

```env
# ── XION Blockchain ──
NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS="xion1wewwvuf2rrg7ae3e43u6k0x2nq3edeycp0nmwpyz7whaw7a4zrnsfthzea"
NEXT_PUBLIC_RPC_ENDPOINT="/api/rpc"
NEXT_PUBLIC_REST_ENDPOINT="https://api.xion-testnet-2.burnt.com"
NEXT_PUBLIC_SMTHLY_TOKEN_ADDRESS=""

# ── XION RPC Proxy (server-side only, no NEXT_PUBLIC_ prefix) ──
XION_RPC_ENDPOINT="https://rpc.xion-testnet-2.burnt.com:443"

# ── Reclaim Protocol (appId and appSecret are server-side only) ──
RECLAIM_APP_ID="0x7a21a5B5206dd21Ab17699ec1CD25F4Dbe8DA3D0"
NEXT_PUBLIC_RECLAIM_PROVIDER_ID="ae25fa88-2572-4c3e-81cf-e9f980cf18aa"
RECLAIM_APP_SECRET="0xc9a728575873aa641e5407ee9e86622d4014638ef0210f27e57695035bdf2375"

# ── Token Configuration ──
NEXT_PUBLIC_SMTHLY_REWARDS_AMOUNT="1000000"
NEXT_PUBLIC_TINDER_PRO_THRESHOLD="10"
NEXT_PUBLIC_RUM_CONTRACT_ADDRESS="xion19ytfcva9m2xkflfaeh58vzyl6m3s6aansztctrsk723pssw6rhxqpaa9ea"
```

> **Note:** These demo values are pre-configured for XION testnet and the [Tinder Likes and Matches](https://dev.reclaimprotocol.org/provider/details/ae25fa88-2572-4c3e-81cf-e9f980cf18aa) Reclaim provider. They are suitable for development and testing. For production, replace all values with your own — see [Adapting for Production](#8-adapting-for-production).

All `NEXT_PUBLIC_` variables are exposed to the browser. `XION_RPC_ENDPOINT`, `RECLAIM_APP_ID`, and `RECLAIM_APP_SECRET` are server-side only — they are never sent to the browser.

Other config values are read in `src/lib/config.ts`:

```typescript
export const TREASURY_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS ?? "";

export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT ?? "";
// ... etc.
```

Reclaim credentials (`RECLAIM_APP_ID`, `RECLAIM_APP_SECRET`, `NEXT_PUBLIC_RECLAIM_PROVIDER_ID`) are read directly in the API route (`src/app/api/reclaim/route.ts`) — see [Server-Side Initialization](#server-side-initialization) below.

### .npmrc Requirement

The `.npmrc` file must contain:

```
legacy-peer-deps=true
```

This is required because `@burnt-labs/abstraxion` has peer dependency conflicts with React 19. The `legacy-peer-deps` flag tells npm to skip strict peer dependency resolution.

### Abstraxion Core Patch

The file `patches/@burnt-labs+abstraxion-core+1.0.0-alpha.67.patch` fixes a bug in `@burnt-labs/abstraxion-core` where the `decodeAuthorizationToRestFormat` function was missing the `typeUrl` property in its fallback return objects. Without this patch, certain authorization types fail to decode correctly when communicating with the XION REST API.

The patch adds `typeUrl: typeUrl` to two fallback return blocks in the authorization decoder:

```diff
  return {
    "@type": typeUrl,
+   typeUrl: typeUrl,
    value: authorization.value
  };
```

This is applied automatically via `patch-package` in the `postinstall` script.

---

## 4. Reclaim Protocol Integration (zkTLS)

> **Source file:** `src/components/VerificationFlow.tsx`

### Server-Side Initialization

The Reclaim SDK is initialized server-side via an API route to keep the `appSecret` out of the browser bundle. The API route creates the proof request and serializes it using `toJsonString()`. The client deserializes it with `fromJsonString()` and uses it normally.

> **Source file:** `src/app/api/reclaim/route.ts`

```typescript
// Server-side API route (src/app/api/reclaim/route.ts)
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";

const APP_ID = process.env.RECLAIM_APP_ID ?? "";
const APP_SECRET = process.env.RECLAIM_APP_SECRET ?? "";
const PROVIDER_ID = process.env.NEXT_PUBLIC_RECLAIM_PROVIDER_ID ?? "";

export async function POST(req: NextRequest) {
  const { method, redirectUrl } = await req.json();

  const proofRequest = await ReclaimProofRequest.init(
    APP_ID, APP_SECRET, PROVIDER_ID, options
  );

  // Serialize the proof request (safe to send to client)
  const reclaimProofRequestConfig = proofRequest.toJsonString();
  return NextResponse.json({ reclaimProofRequestConfig });
}
```

```typescript
// Client-side (src/components/VerificationFlow.tsx)
import { ReclaimProofRequest, verifyProof } from "@reclaimprotocol/js-sdk";

async function initReclaim(method, redirectUrl?) {
  const res = await fetch("/api/reclaim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, redirectUrl }),
  });
  const { reclaimProofRequestConfig } = await res.json();
  // Reconstruct the proof request on the client
  return ReclaimProofRequest.fromJsonString(reclaimProofRequestConfig);
}
```

### Three Verification Methods

The demo supports three ways for users to complete verification. All methods use the `initReclaim()` helper above to get a proof request from the server.

#### 1. Browser Extension

Uses the Reclaim browser extension (Chrome). Fastest method if installed.

```typescript
const proofRequest = await initReclaim("extension", window.location.href);

// Check if extension is available
const available = await proofRequest.isBrowserExtensionAvailable(500);

proofRequest.triggerReclaimFlow();
await proofRequest.startSession({ onSuccess, onError });
```

#### 2. QR Code / Mobile

Opens a QR code for the user to scan with the Reclaim mobile app.

```typescript
const proofRequest = await initReclaim("mobile", window.location.href);

proofRequest.triggerReclaimFlow();
await proofRequest.startSession({ onSuccess, onError });
```

#### 3. Web Iframe

Opens verification in an embedded iframe using Reclaim's web portal.

```typescript
const proofRequest = await initReclaim("web");

const url = await proofRequest.getRequestUrl();
// Render url in an iframe
setShowIframe(true);

await proofRequest.startSession({ onSuccess, onError });
```

### Proof Structure and Verification

The `onSuccess` callback receives an array of `Proof` objects:

```typescript
const onSuccess = async (proofs: unknown) => {
  const proofsArray = proofs as Proof[];

  // Verify the proof cryptographically
  const isValid = await verifyProof(proofsArray);
  if (!isValid) {
    throw new Error("Proof verification failed");
  }

  // Extract data from the proof
  const matchCount = parseLikeCount(proofsArray);
};
```

Each `Proof` contains:

```typescript
interface Proof {
  claimData: {
    parameters: string;  // JSON string with provider-specific data
    context: string;     // JSON string with extracted parameters
  };
  // ... signature fields
}
```

### Parsing Proof Data

> **Source file:** `src/lib/parseMatchCount.ts`

The Tinder provider returns multiple proofs (for matches, likes, conversations). The parser searches all proofs for likes data:

```typescript
export function parseLikeCount(proofs: ProofLike[]): number {
  // First pass: look for a numeric "likes" value
  for (const proof of proofs) {
    const likes = extractLikesNumeric(
      proof.claimData.parameters,
      proof.claimData.context
    );
    if (likes > 0) return likes;
  }

  // Second pass: fall back to array lengths (conversations, matches)
  for (const proof of proofs) {
    const count = extractArrayFallback(proof.claimData.parameters);
    if (count > 0) return count;
  }

  return 0;
}
```

The function checks three locations for likes data:
1. `parameters.likes` (direct numeric value)
2. `parameters.paramValues.likes` (nested under paramValues)
3. `context.extractedParameters.likes` (in the context object)

If no numeric likes value is found, it falls back to counting array lengths of `conversations` or `matches` fields.

---

## 5. XION Abstraxion Wallet Integration

### Provider Setup

> **Source file:** `src/app/layout.tsx`

Wrap your app with `AbstraxionProvider` in the root layout:

```typescript
import { AbstraxionProvider } from "@burnt-labs/abstraxion";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const treasuryConfig = useMemo(
    () => ({
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
      <body>
        <AbstraxionProvider config={treasuryConfig as any}>
          <SmoothlyProvider>
            {children}
          </SmoothlyProvider>
        </AbstraxionProvider>
      </body>
    </html>
  );
}
```

Key configuration:
- **`treasury`** — The meta-account contract that sponsors gas fees (users don't pay gas)
- **`rpcUrl`** — Points to `/api/rpc` proxy in the browser to avoid CORS issues
- **`restUrl`** — Direct REST endpoint for queries

### Wallet Connection

> **Source files:** `src/contexts/SmoothlyContext.tsx`, `src/components/WalletConnect.tsx`

Use Abstraxion's hooks to manage wallet state:

```typescript
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";

// In your provider/component:
const { client } = useAbstraxionSigningClient();
const {
  data: account,      // { bech32Address: "xion1..." }
  isConnected,        // boolean
  login,              // () => void — opens Abstraxion login modal
  logout,             // () => Promise<void>
  isConnecting,       // boolean
} = useAbstraxionAccount();

// User's address
const address = account?.bech32Address;
```

The `WalletConnect` component provides a simple connect/disconnect UI:

```typescript
export function WalletConnect() {
  const { isConnected, address, login, logout } = useSmoothly();

  if (isConnected && address) {
    return (
      <div>
        <span>{address.slice(0, 10)}...{address.slice(-6)}</span>
        <button onClick={() => logout()}>Disconnect</button>
      </div>
    );
  }

  return <button onClick={() => login()}>Connect Wallet</button>;
}
```

### Signing Client Usage

> **Source file:** `src/lib/tokenService.ts`

The signing client from `useAbstraxionSigningClient` provides two key methods:

#### Query a CW20 Balance

```typescript
export async function queryBalance(
  client: SigningClient,
  address: string
): Promise<string> {
  const result = await client.queryContractSmart(SMTHLY_TOKEN_ADDRESS, {
    balance: { address },
  });
  return (result as { balance: string }).balance ?? "0";
}
```

#### Transfer CW20 Tokens

```typescript
export async function transferTokens(
  client: SigningClient,
  sender: string,
  recipient: string,
  amount: string
): Promise<unknown> {
  return client.execute(
    sender,
    SMTHLY_TOKEN_ADDRESS,
    { transfer: { recipient, amount } },
    "auto"  // auto gas estimation
  );
}
```

### RPC Proxy Setup

> **Source file:** `src/app/api/rpc/[[...path]]/route.ts`

A Next.js API route proxies RPC requests to the XION node to avoid browser CORS issues:

```typescript
const RPC_TARGET =
  process.env.XION_RPC_ENDPOINT || "https://rpc.xion-testnet-2.burnt.com:443";

async function proxy(req: NextRequest) {
  const url = new URL(req.url);
  const subPath = url.pathname.replace(/^\/api\/rpc/, "");
  const target = `${RPC_TARGET}${subPath}${url.search}`;

  const init: RequestInit = {
    method: req.method,
    headers: { "Content-Type": "application/json" },
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const resp = await fetch(target, init);
  const data = await resp.text();

  return new NextResponse(data, {
    status: resp.status,
    headers: { "Content-Type": resp.headers.get("Content-Type") || "application/json" },
  });
}

export const GET = proxy;
export const POST = proxy;
```

The catch-all route `[[...path]]` forwards any sub-path (e.g., `/api/rpc/status` -> `https://rpc.xion-testnet-2.burnt.com:443/status`).

---

## 6. Application Flow

### Step-by-Step User Journey

```
1. Landing Page (/)
   └── User clicks "Get Started"

2. Verify Page (/verify)
   ├── Step 1: Connect wallet via Abstraxion
   │   └── login() opens Abstraxion modal → user signs in
   ├── Step 2: Choose verification method (Extension / QR / Web)
   │   └── Reclaim SDK opens verification flow
   │       └── User logs into Tinder in the secure environment
   │           └── Reclaim generates zkTLS proof of likes count
   └── onSuccess callback fires
       ├── verifyProof() validates the proof
       ├── parseLikeCount() extracts the likes number
       ├── setVerificationResult() stores in context
       └── Router pushes to /results

3. Results Page (/results)
   ├── Shows likes count and progress toward threshold
   ├── If qualified (likes >= threshold):
   │   └── "Claim SMTHLY" button calls transferTokens()
   │       └── Abstraxion signing client executes CW20 transfer
   │           └── Treasury contract sponsors the gas fee
   └── After claiming → link to /dashboard

4. Dashboard (/dashboard)
   └── Shows SMTHLY balance, verified likes, and AI coach preview
```

### State Management

> **Source file:** `src/contexts/SmoothlyContext.tsx`

All shared state lives in `SmoothlyContext`, which wraps Abstraxion hooks and adds app-specific state:

```typescript
interface SmoothlyState {
  // Verification
  isVerified: boolean;
  matchCount: number;
  isQualified: boolean;       // matchCount >= TINDER_PRO_THRESHOLD
  setVerificationResult: (count: number) => void;

  // Wallet (from Abstraxion)
  isConnected: boolean;
  isConnecting: boolean;
  address: string | undefined;
  login: () => void;
  logout: () => Promise<void>;
  client: SigningClient | null;

  // Tokens
  smthlyBalance: string;
  refreshBalance: () => Promise<void>;
  tokensClaimed: boolean;
  setTokensClaimed: (claimed: boolean) => void;
  rewardsAmount: string;
}
```

Access it via the `useSmoothly()` hook from any component.

### Qualification Logic

> **Source file:** `src/lib/threshold.ts`

```typescript
import { TINDER_PRO_THRESHOLD } from "@/lib/config";

export function isProQualified(matchCount: number): boolean {
  return matchCount >= TINDER_PRO_THRESHOLD;
}
```

The threshold defaults to 50 but is configurable via `NEXT_PUBLIC_TINDER_PRO_THRESHOLD`.

### Token Claiming Flow

In `src/app/results/page.tsx`, qualified users can claim tokens:

```typescript
const handleClaimTokens = async () => {
  await transferTokens(
    client,                  // Abstraxion signing client
    SMTHLY_TOKEN_ADDRESS,    // CW20 contract (sender = treasury)
    address,                 // User's XION address (recipient)
    SMTHLY_REWARDS_AMOUNT    // Amount to transfer
  );
  setTokensClaimed(true);
  await refreshBalance();
};
```

> **Note:** In this demo, the token contract address is passed as the `sender` to `transferTokens`. In production, the treasury meta-account would execute the transfer on behalf of the user, so gas is sponsored.

---

## 7. Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout; sets up `AbstraxionProvider` and `SmoothlyProvider` |
| `src/app/page.tsx` | Landing page with "How it works" steps |
| `src/app/verify/page.tsx` | Wallet connection + verification UI |
| `src/app/results/page.tsx` | Results display, qualification check, token claiming |
| `src/app/dashboard/page.tsx` | Post-claim dashboard with balance and AI chat preview |
| `src/app/api/reclaim/route.ts` | Server-side Reclaim SDK initialization (keeps appSecret off client) |
| `src/app/api/rpc/[[...path]]/route.ts` | RPC proxy to XION node (avoids CORS) |
| `src/components/VerificationFlow.tsx` | Reclaim SDK integration: all three verification methods |
| `src/components/WalletConnect.tsx` | Wallet connect/disconnect button |
| `src/components/ui/` | Reusable UI components (Badge, Card, GradientButton, ProgressBar) |
| `src/contexts/SmoothlyContext.tsx` | Central state: wallet + verification + token balance |
| `src/lib/config.ts` | Environment variable loading and exports |
| `src/lib/parseMatchCount.ts` | Extract likes count from Reclaim proof data |
| `src/lib/threshold.ts` | Qualification threshold logic |
| `src/lib/tokenService.ts` | CW20 query and transfer functions |
| `patches/@burnt-labs+abstraxion-core+...patch` | Fix for Abstraxion authorization decoder |
| `.npmrc` | `legacy-peer-deps=true` for Abstraxion compatibility |

---

## 8. Adapting for Production

### What to Replace

| Demo Value | Production Replacement |
|-----------|----------------------|
| Reclaim `appId` / `appSecret` / `providerId` | Your own credentials from Reclaim Developer Portal |
| `SMTHLY_TOKEN_ADDRESS` | Your production CW20 token contract |
| `TREASURY_CONTRACT_ADDRESS` | Your production treasury/meta-account |
| RPC/REST endpoints | XION mainnet endpoints (when available) |
| `TINDER_PRO_THRESHOLD` | Your desired qualification threshold |
| `SMTHLY_REWARDS_AMOUNT` | Your desired reward amount |

### Security Considerations

**`appSecret` handling:**

The Reclaim `appSecret` is kept server-side. `ReclaimProofRequest.init()` is called in the API route (`src/app/api/reclaim/route.ts`) using non-`NEXT_PUBLIC_` env vars (`RECLAIM_APP_ID`, `RECLAIM_APP_SECRET`), so the secret is never included in the client bundle. The serialized proof request config returned to the client via `toJsonString()` contains only the signed request data — not the secret itself.

- **Never** use the Reclaim `appSecret` for any other authentication purpose.
- The `NEXT_PUBLIC_RECLAIM_PROVIDER_ID` is not sensitive and remains public.

**Token transfer authorization:**

In production, the token claim should be validated server-side:
- Verify the Reclaim proof on your backend before executing the transfer
- Use a server-side signing key or treasury allowance to execute the CW20 transfer
- Prevent double-claiming by tracking which addresses have already claimed

**RPC proxy:**

The `/api/rpc` proxy forwards all requests to the XION node without authentication. In production, consider adding rate limiting or restricting the proxy to specific RPC methods.

### Custom Provider Creation

To verify data other than Tinder likes:

1. Go to the [Reclaim Developer Portal](https://dev.reclaimprotocol.org/)
2. Browse existing providers or create a custom one
3. A provider defines:
   - The website/API to fetch data from
   - What data points to extract
   - How to structure the proof output
4. Update `NEXT_PUBLIC_RECLAIM_PROVIDER_ID` with your new provider's ID
5. Update `src/lib/parseMatchCount.ts` to parse the new provider's proof structure

### Removing the Abstraxion Patch

Check if newer versions of `@burnt-labs/abstraxion-core` have fixed the `typeUrl` issue. If so:
1. Delete `patches/@burnt-labs+abstraxion-core+1.0.0-alpha.67.patch`
2. Update the package version in `package.json`
3. Run `npm install`
4. Test that wallet connection and token operations still work
