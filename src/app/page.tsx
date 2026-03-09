"use client";

import { GradientButton } from "@/components/ui/GradientButton";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Verify",
    description: "Prove your Tinder likes with zero-knowledge cryptography. Your data stays private.",
  },
  {
    number: "02",
    title: "Earn",
    description: "Submit your proof on-chain to XION. Hit 10+ likes to unlock Tinder Pro status.",
  },
  {
    number: "03",
    title: "Unlock",
    description: "Claim SMTHLY tokens and access exclusive features for verified power daters.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-coral/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple/[0.06] blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <span className="text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-coral to-purple bg-clip-text text-transparent">
            smoothly
          </span>
          <span className="text-text-muted">.me</span>
        </span>
        <Link href="/verify">
          <span className="text-sm text-text-secondary hover:text-coral transition-colors cursor-pointer">
            Launch App
          </span>
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-32 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border text-sm text-text-secondary mb-8 animate-[fadeInUp_0.6s_ease-out]">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Powered by Reclaim Protocol + XION
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
          Your dating game,{" "}
          <span className="bg-gradient-to-r from-coral via-coral-light to-purple bg-clip-text text-transparent">
            verified on-chain
          </span>
        </h1>

        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-12 leading-relaxed animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
          Prove your Tinder likes with zero-knowledge proofs.
          Earn SMTHLY tokens. Unlock Tinder Pro status.
          All without revealing your private data.
        </p>

        <div className="animate-[fadeInUp_0.6s_ease-out_0.3s_both]">
          <Link href="/verify">
            <GradientButton>Get Started</GradientButton>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 md:px-12 pb-32 max-w-5xl mx-auto">
        <h2 className="text-sm uppercase tracking-[0.2em] text-text-muted text-center mb-16">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="group relative p-8 rounded-2xl bg-surface/50 border border-border hover:border-border-light transition-all duration-300"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <span className="text-6xl font-black text-surface-light group-hover:text-coral/20 transition-colors duration-300 absolute top-4 right-6 select-none">
                {step.number}
              </span>
              <div className="relative">
                <h3 className="text-2xl font-bold mb-3 mt-8">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
