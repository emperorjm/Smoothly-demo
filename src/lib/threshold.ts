import { TINDER_PRO_THRESHOLD } from "@/lib/config";

export function isProQualified(matchCount: number): boolean {
  return matchCount >= TINDER_PRO_THRESHOLD;
}
