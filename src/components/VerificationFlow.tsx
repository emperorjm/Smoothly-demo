"use client";

import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { RECLAIM_CONFIG } from "@/lib/config";
import { useSmoothly } from "@/contexts/SmoothlyContext";
import { parseLikeCount } from "@/lib/parseMatchCount";
import { ReclaimProofRequest, verifyProof } from "@reclaimprotocol/js-sdk";
import type { Proof } from "@reclaimprotocol/js-sdk";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Status =
  | "idle"
  | "verifying"
  | "submitting_proof"
  | "checking_threshold"
  | "complete"
  | "error";

type VerificationMethod = "extension" | "mobile" | "web";

export function VerificationFlow() {
  const { address, setVerificationResult } = useSmoothly();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>("mobile");
  const [extensionAvailable, setExtensionAvailable] = useState<boolean | null>(null);
  const [requestUrl, setRequestUrl] = useState<string>("");
  const [showIframe, setShowIframe] = useState(false);
  const reclaimWebRef = useRef<ReclaimProofRequest | null>(null);

  useEffect(() => {
    async function detectExtension() {
      try {
        const proofRequest = await ReclaimProofRequest.init(
          RECLAIM_CONFIG.appId,
          RECLAIM_CONFIG.appSecret,
          RECLAIM_CONFIG.providerId
        );
        const available = await proofRequest.isBrowserExtensionAvailable(500);
        setExtensionAvailable(available);
        if (available) {
          setVerificationMethod("extension");
        }
      } catch {
        setExtensionAvailable(false);
      }
    }
    detectExtension();
  }, []);

  const startVerification = async () => {
    if (!address) {
      setErrorMessage("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setStatus("verifying");
    setErrorMessage(null);

    try {
      const onSuccess = async (proofs: unknown) => {
        try {
          const proofsArray = proofs as Proof[];

          setStatus("submitting_proof");

          const isValid = await verifyProof(proofsArray);
          if (!isValid) {
            throw new Error("Proof verification failed");
          }

          console.log("Reclaim proofs count:", proofsArray.length);
          proofsArray.forEach((p, i) => {
            console.log(`Proof ${i} parameters:`, p.claimData.parameters);
            console.log(`Proof ${i} context:`, p.claimData.context);
          });

          const matchCount = parseLikeCount(proofsArray);

          setStatus("checking_threshold");
          setVerificationResult(matchCount);
          setStatus("complete");
          setLoading(false);
          setShowIframe(false);
          router.push("/results");
        } catch (err) {
          console.error("Proof verification error:", err);
          setStatus("error");
          setErrorMessage(
            err instanceof Error ? err.message : "Failed to verify proof"
          );
          setLoading(false);
          setShowIframe(false);
        }
      };

      const onError = (error: unknown) => {
        console.error("Verification failed:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Verification failed. Please try again."
        );
        setLoading(false);
        setShowIframe(false);
      };

      if (verificationMethod === "web") {
        const proofRequest = await ReclaimProofRequest.init(
          RECLAIM_CONFIG.appId,
          RECLAIM_CONFIG.appSecret,
          RECLAIM_CONFIG.providerId,
          { customSharePageUrl: "https://portal.reclaimprotocol.org/kernel", useAppClip: false }
        );

        const url = await proofRequest.getRequestUrl();
        setRequestUrl(url);
        setShowIframe(true);
        reclaimWebRef.current = proofRequest;

        await proofRequest.startSession({ onSuccess, onError });
      } else {
        const useBrowserExtension = verificationMethod === "extension";
        const proofRequest = await ReclaimProofRequest.init(
          RECLAIM_CONFIG.appId,
          RECLAIM_CONFIG.appSecret,
          RECLAIM_CONFIG.providerId,
          { useBrowserExtension }
        );

        proofRequest.setRedirectUrl(window.location.href);
        proofRequest.triggerReclaimFlow();

        await proofRequest.startSession({ onSuccess, onError });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setLoading(false);
    }
  };

  const statusConfig: Record<Status, { text: string; color: string }> = {
    idle: { text: "Ready to verify", color: "text-text-muted" },
    verifying: {
      text: verificationMethod === "extension"
        ? "Verifying via browser extension..."
        : verificationMethod === "web"
        ? "Verifying via web portal..."
        : "Scan the QR code with the Reclaim app...",
      color: "text-warning",
    },
    submitting_proof: { text: "Verifying proof...", color: "text-warning" },
    checking_threshold: { text: "Checking qualification...", color: "text-warning" },
    complete: { text: "Verification complete!", color: "text-success" },
    error: { text: "Error occurred", color: "text-error" },
  };

  const getButtonText = () => {
    if (loading) return "Processing...";
    if (status === "complete") return "View Results";
    if (status === "error") return "Retry Verification";
    return "Start Verification";
  };

  const handlePress = () => {
    if (status === "complete") {
      router.push("/results");
    } else {
      startVerification();
    }
  };

  return (
    <div className="space-y-4">
      {status === "idle" || status === "error" ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-text-muted">
            Verification method
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVerificationMethod("extension")}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                verificationMethod === "extension"
                  ? "bg-surface-light text-foreground ring-1 ring-coral/50"
                  : "bg-surface text-text-muted hover:text-text-secondary"
              }`}
            >
              Browser Extension
            </button>
            <button
              type="button"
              onClick={() => setVerificationMethod("mobile")}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                verificationMethod === "mobile"
                  ? "bg-surface-light text-foreground ring-1 ring-coral/50"
                  : "bg-surface text-text-muted hover:text-text-secondary"
              }`}
            >
              Phone / QR Code
            </button>
            <button
              type="button"
              onClick={() => setVerificationMethod("web")}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                verificationMethod === "web"
                  ? "bg-surface-light text-foreground ring-1 ring-coral/50"
                  : "bg-surface text-text-muted hover:text-text-secondary"
              }`}
            >
              Web
            </button>
          </div>
          {verificationMethod === "extension" && extensionAvailable === false && (
            <p className="text-xs text-text-muted text-center">
              Extension not detected.{" "}
              <a
                href="https://chromewebstore.google.com/detail/reclaim-extension/oafieibbbcepkmenknelhmgaoahamdeh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral hover:text-coral-light underline"
              >
                Install it
              </a>{" "}
              or use Phone / QR Code instead.
            </p>
          )}
        </div>
      ) : null}

      <GradientButton onClick={handlePress} disabled={loading} className="w-full">
        {getButtonText()}
      </GradientButton>

      {status !== "idle" && (
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-muted mb-1">
            Status
          </p>
          <p className={`font-semibold ${statusConfig[status].color}`}>
            {statusConfig[status].text}
          </p>
        </Card>
      )}

      {errorMessage && (
        <Card className="border-error/30">
          <p className="text-error text-sm">{errorMessage}</p>
        </Card>
      )}

      {showIframe && requestUrl && createPortal(
        <div className="reclaim-iframe-overlay">
          <button
            type="button"
            className="reclaim-iframe-close"
            onClick={() => {
              setShowIframe(false);
              setRequestUrl("");
              setStatus("idle");
              setLoading(false);
              reclaimWebRef.current = null;
            }}
          >
            ✕
          </button>
          <iframe
            src={requestUrl}
            className="reclaim-iframe"
            allow="camera; microphone"
          />
        </div>,
        document.body
      )}
    </div>
  );
}
