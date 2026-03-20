#!/usr/bin/env bash
set -euo pipefail

# Transfer SMTHLY token factory admin and all admin-held tokens to a new owner.

DENOM="factory/xion15r5yxaeqwlx5zz5f2vwg87vz3m7d6dd5pdd6qp/SMTHLY"
CURRENT_ADMIN="xion1z9ta8lhj65qs65h7q8atyc5uxu3wjua7aujyt5hjfs97tq6jna8splmrhr"
NEW_OWNER="xion1ygmvmvzf5w23ef0f0n86mjjns0wm4ujx9f752rnt2n56y6dmktvq9q5a3j"
CHAIN_ID="xion-testnet-2"
RPC="https://rpc.xion-testnet-2.burnt.com:443"

# --- Parse arguments ---
KEY_NAME=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --from)
      KEY_NAME="$2"
      shift 2
      ;;
    *)
      echo "Usage: $0 --from <key-name>"
      exit 1
      ;;
  esac
done

if [[ -z "$KEY_NAME" ]]; then
  echo "Error: --from <key-name> is required"
  echo "Usage: $0 --from <key-name>"
  exit 1
fi

echo "=== SMTHLY Ownership Transfer ==="
echo "Denom:         $DENOM"
echo "Current admin: $CURRENT_ADMIN"
echo "New owner:     $NEW_OWNER"
echo "Signing key:   $KEY_NAME"
echo ""

# --- Step 1: Query current admin's SMTHLY balance ---
echo "Querying current admin SMTHLY balance..."
BALANCE_JSON=$(xiond query bank balance "$CURRENT_ADMIN" "$DENOM" --node "$RPC" --output json)
BALANCE=$(echo "$BALANCE_JSON" | jq -r '.amount // .balance.amount // "0"')

echo "Balance: ${BALANCE} SMTHLY"
echo ""

if [[ "$BALANCE" == "0" || -z "$BALANCE" ]]; then
  echo "Warning: Admin holds 0 SMTHLY tokens. Skipping token transfer."
  SKIP_TRANSFER=true
else
  SKIP_TRANSFER=false
fi

# --- Confirmation ---
echo "This script will:"
if [[ "$SKIP_TRANSFER" == false ]]; then
  echo "  1. Transfer ${BALANCE} SMTHLY tokens to the new owner"
fi
echo "  2. Change token factory admin to the new owner"
echo ""
read -rp "Proceed? (y/N): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi
echo ""

# --- Step 2: Transfer all SMTHLY tokens ---
if [[ "$SKIP_TRANSFER" == false ]]; then
  echo "Transferring ${BALANCE} SMTHLY tokens..."
  TX_TRANSFER=$(xiond tx bank send "$CURRENT_ADMIN" "$NEW_OWNER" "${BALANCE}${DENOM}" \
    --from "$KEY_NAME" --chain-id "$CHAIN_ID" --node "$RPC" \
    --gas auto --gas-adjustment 1.3 -y --output json)

  TX_HASH=$(echo "$TX_TRANSFER" | jq -r '.txhash // "unknown"')
  echo "Token transfer tx: $TX_HASH"
  echo "Waiting for confirmation..."
  sleep 6
  echo ""
fi

# --- Step 3: Change token factory admin ---
echo "Changing token factory admin..."
TX_ADMIN=$(xiond tx tokenfactory change-admin "$DENOM" "$NEW_OWNER" \
  --from "$KEY_NAME" --chain-id "$CHAIN_ID" --node "$RPC" \
  --gas auto --gas-adjustment 1.3 -y --output json)

TX_HASH=$(echo "$TX_ADMIN" | jq -r '.txhash // "unknown"')
echo "Admin change tx: $TX_HASH"
echo ""

echo "=== Transfer complete ==="
echo ""
echo "Verify with:"
echo "  xiond query bank balance $NEW_OWNER \"$DENOM\" --node $RPC"
echo "  xiond query tokenfactory denom-authority-metadata \"$DENOM\" --node $RPC"
