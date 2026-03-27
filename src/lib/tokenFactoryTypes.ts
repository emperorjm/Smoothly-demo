/**
 * Protobuf type definitions for Osmosis Token Factory v1beta1 messages.
 *
 * The Abstraxion signing client's default Registry doesn't include these types,
 * so we define them here and register them at runtime to enable signAndBroadcast
 * for token factory operations (mint, burn, change admin, set metadata).
 */

import { BinaryReader, BinaryWriter } from "cosmjs-types/binary";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import {
  Metadata,
  DenomUnit,
} from "cosmjs-types/cosmos/bank/v1beta1/bank";
import type { Registry } from "@cosmjs/proto-signing";

const TYPE_PREFIX = "/osmosis.tokenfactory.v1beta1";

// ---------------------------------------------------------------------------
// MsgChangeAdmin
// ---------------------------------------------------------------------------

interface IMsgChangeAdmin {
  sender: string;
  denom: string;
  newAdmin: string;
}

function createBaseMsgChangeAdmin(): IMsgChangeAdmin {
  return { sender: "", denom: "", newAdmin: "" };
}

export const MsgChangeAdmin = {
  typeUrl: `${TYPE_PREFIX}.MsgChangeAdmin`,
  encode(message: IMsgChangeAdmin, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== "") writer.uint32(10).string(message.sender);
    if (message.denom !== "") writer.uint32(18).string(message.denom);
    if (message.newAdmin !== "") writer.uint32(26).string(message.newAdmin);
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): IMsgChangeAdmin {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgChangeAdmin();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: message.sender = reader.string(); break;
        case 2: message.denom = reader.string(); break;
        case 3: message.newAdmin = reader.string(); break;
        default: reader.skipType(tag & 7); break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<IMsgChangeAdmin>): IMsgChangeAdmin {
    const message = createBaseMsgChangeAdmin();
    message.sender = object.sender ?? "";
    message.denom = object.denom ?? "";
    message.newAdmin = object.newAdmin ?? "";
    return message;
  },
};

// ---------------------------------------------------------------------------
// MsgMint
// ---------------------------------------------------------------------------

interface IMsgMint {
  sender: string;
  amount: { denom: string; amount: string } | undefined;
  mintToAddress: string;
}

function createBaseMsgMint(): IMsgMint {
  return { sender: "", amount: undefined, mintToAddress: "" };
}

export const MsgMint = {
  typeUrl: `${TYPE_PREFIX}.MsgMint`,
  encode(message: IMsgMint, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== "") writer.uint32(10).string(message.sender);
    if (message.amount !== undefined) Coin.encode(message.amount, writer.uint32(18).fork()).ldelim();
    if (message.mintToAddress !== "") writer.uint32(26).string(message.mintToAddress);
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): IMsgMint {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgMint();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: message.sender = reader.string(); break;
        case 2: message.amount = Coin.decode(reader, reader.uint32()); break;
        case 3: message.mintToAddress = reader.string(); break;
        default: reader.skipType(tag & 7); break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<IMsgMint>): IMsgMint {
    const message = createBaseMsgMint();
    message.sender = object.sender ?? "";
    message.amount = object.amount !== undefined ? Coin.fromPartial(object.amount) : undefined;
    message.mintToAddress = object.mintToAddress ?? "";
    return message;
  },
};

// ---------------------------------------------------------------------------
// MsgBurn
// ---------------------------------------------------------------------------

interface IMsgBurn {
  sender: string;
  amount: { denom: string; amount: string } | undefined;
  burnFromAddress: string;
}

function createBaseMsgBurn(): IMsgBurn {
  return { sender: "", amount: undefined, burnFromAddress: "" };
}

export const MsgBurn = {
  typeUrl: `${TYPE_PREFIX}.MsgBurn`,
  encode(message: IMsgBurn, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== "") writer.uint32(10).string(message.sender);
    if (message.amount !== undefined) Coin.encode(message.amount, writer.uint32(18).fork()).ldelim();
    if (message.burnFromAddress !== "") writer.uint32(26).string(message.burnFromAddress);
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): IMsgBurn {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBurn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: message.sender = reader.string(); break;
        case 2: message.amount = Coin.decode(reader, reader.uint32()); break;
        case 3: message.burnFromAddress = reader.string(); break;
        default: reader.skipType(tag & 7); break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<IMsgBurn>): IMsgBurn {
    const message = createBaseMsgBurn();
    message.sender = object.sender ?? "";
    message.amount = object.amount !== undefined ? Coin.fromPartial(object.amount) : undefined;
    message.burnFromAddress = object.burnFromAddress ?? "";
    return message;
  },
};

// ---------------------------------------------------------------------------
// MsgSetDenomMetadata
// ---------------------------------------------------------------------------

interface IMsgSetDenomMetadata {
  sender: string;
  metadata: {
    description: string;
    denomUnits: { denom: string; exponent: number; aliases: string[] }[];
    base: string;
    display: string;
    name: string;
    symbol: string;
  } | undefined;
}

function createBaseMsgSetDenomMetadata(): IMsgSetDenomMetadata {
  return { sender: "", metadata: undefined };
}

export const MsgSetDenomMetadata = {
  typeUrl: `${TYPE_PREFIX}.MsgSetDenomMetadata`,
  encode(message: IMsgSetDenomMetadata, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== "") writer.uint32(10).string(message.sender);
    if (message.metadata !== undefined) {
      Metadata.encode(
        Metadata.fromPartial({
          ...message.metadata,
          denomUnits: message.metadata.denomUnits.map((u) =>
            DenomUnit.fromPartial(u)
          ),
        }),
        writer.uint32(18).fork(),
      ).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): IMsgSetDenomMetadata {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetDenomMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: message.sender = reader.string(); break;
        case 2: {
          const meta = Metadata.decode(reader, reader.uint32());
          message.metadata = {
            description: meta.description,
            denomUnits: meta.denomUnits,
            base: meta.base,
            display: meta.display,
            name: meta.name,
            symbol: meta.symbol,
          };
          break;
        }
        default: reader.skipType(tag & 7); break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<IMsgSetDenomMetadata>): IMsgSetDenomMetadata {
    const message = createBaseMsgSetDenomMetadata();
    message.sender = object.sender ?? "";
    message.metadata = object.metadata
      ? {
          description: object.metadata.description ?? "",
          denomUnits: object.metadata.denomUnits?.map((u) => ({
            denom: u.denom ?? "",
            exponent: u.exponent ?? 0,
            aliases: u.aliases ?? [],
          })) ?? [],
          base: object.metadata.base ?? "",
          display: object.metadata.display ?? "",
          name: object.metadata.name ?? "",
          symbol: object.metadata.symbol ?? "",
        }
      : undefined;
    return message;
  },
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeneratedType = { encode: any; decode: any; fromPartial: any };

const tokenFactoryTypes: [string, GeneratedType][] = [
  [MsgMint.typeUrl, MsgMint],
  [MsgBurn.typeUrl, MsgBurn],
  [MsgChangeAdmin.typeUrl, MsgChangeAdmin],
  [MsgSetDenomMetadata.typeUrl, MsgSetDenomMetadata],
];

export function registerTokenFactoryTypes(registry: Registry): void {
  for (const [typeUrl, type] of tokenFactoryTypes) {
    registry.register(typeUrl, type);
  }
}
