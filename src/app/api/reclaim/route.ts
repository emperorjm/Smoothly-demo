import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import { NextRequest, NextResponse } from "next/server";

const APP_ID = process.env.RECLAIM_APP_ID ?? "";
const APP_SECRET = process.env.RECLAIM_APP_SECRET ?? "";
const PROVIDER_ID = process.env.NEXT_PUBLIC_RECLAIM_PROVIDER_ID ?? "";

interface RequestBody {
  method: "extension" | "mobile" | "web";
  redirectUrl?: string;
}

export async function POST(req: NextRequest) {
  if (!APP_ID || !APP_SECRET || !PROVIDER_ID) {
    return NextResponse.json(
      { error: "Reclaim credentials not configured" },
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { method, redirectUrl } = body;

  if (!method || !["extension", "mobile", "web"].includes(method)) {
    return NextResponse.json(
      { error: "Invalid method. Must be 'extension', 'mobile', or 'web'" },
      { status: 400 }
    );
  }

  try {
    const options: Record<string, unknown> = {};

    if (method === "web") {
      options.customSharePageUrl =
        "https://portal.reclaimprotocol.org/kernel";
      options.useAppClip = false;
    } else {
      options.useBrowserExtension = method === "extension";
    }

    const proofRequest = await ReclaimProofRequest.init(
      APP_ID,
      APP_SECRET,
      PROVIDER_ID,
      options
    );

    if (redirectUrl && method !== "web") {
      proofRequest.setRedirectUrl(redirectUrl);
    }

    const reclaimProofRequestConfig = proofRequest.toJsonString();

    return NextResponse.json({ reclaimProofRequestConfig });
  } catch (err) {
    console.error("Reclaim init error:", err);
    return NextResponse.json(
      { error: "Failed to initialize Reclaim proof request" },
      { status: 500 }
    );
  }
}
