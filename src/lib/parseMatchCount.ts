interface ProofLike {
  claimData: {
    parameters: string;
    context: string;
  };
}

/**
 * Parse likes count from Reclaim proof array.
 *
 * The Tinder Likes and Matches provider makes multiple requests (matches,
 * likes, conversations). Each request produces a separate proof. We search
 * all proofs for a numeric likes value, falling back to array lengths.
 */
export function parseLikeCount(proofs: ProofLike[]): number {
  // First pass: look for a numeric "likes" value across all proofs
  for (const proof of proofs) {
    const likes = extractLikesNumeric(proof.claimData.parameters, proof.claimData.context);
    if (likes > 0) return likes;
  }

  // Second pass: fall back to array lengths (conversations, matches)
  for (const proof of proofs) {
    const count = extractArrayFallback(proof.claimData.parameters);
    if (count > 0) return count;
  }

  return 0;
}

function extractLikesNumeric(parameters: string, context?: string): number {
  try {
    const parsed = JSON.parse(parameters);

    if (parsed && typeof parsed === "object") {
      const n = extractNumeric(parsed, "likes");
      if (n > 0) return n;

      if (parsed.paramValues && typeof parsed.paramValues === "object") {
        const n2 = extractNumeric(parsed.paramValues, "likes");
        if (n2 > 0) return n2;
      }
    }

    if (context) {
      try {
        const ctx = JSON.parse(context);
        if (ctx?.extractedParameters) {
          const n3 = extractNumeric(ctx.extractedParameters, "likes");
          if (n3 > 0) return n3;
        }
      } catch {
        // context wasn't valid JSON
      }
    }
  } catch {
    // parameters wasn't valid JSON
  }
  return 0;
}

function extractArrayFallback(parameters: string): number {
  try {
    const parsed = JSON.parse(parameters);
    if (parsed && typeof parsed === "object") {
      for (const key of ["conversations", "matches"]) {
        const len = arrayLength(parsed[key]) ||
          arrayLength(parsed.paramValues?.[key]);
        if (len > 0) return len;
      }
    }
  } catch {
    // parameters wasn't valid JSON
  }
  return 0;
}

function extractNumeric(obj: Record<string, unknown>, key: string): number {
  const val = obj[key];
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    if (!isNaN(n) && val.trim() !== "") return n;
  }
  return 0;
}

function arrayLength(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "string") {
    try {
      const arr = JSON.parse(value);
      if (Array.isArray(arr)) return arr.length;
    } catch {
      // not valid JSON
    }
  }
  return 0;
}
