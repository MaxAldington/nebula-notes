"use client";

import { useMetaMask } from "../../hooks/metamask/useMetaMaskProvider";
import { useEip6963 } from "../../hooks/metamask/useEip6963";

interface WalletConnectProps {
  onConnect: () => void;
  error?: Error;
}

export function WalletConnect({ onConnect, error }: WalletConnectProps) {
  const { providers } = useEip6963();
  const { isConnected } = useMetaMask();

  if (isConnected) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-8 mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl shadow-2xl float">
          <span className="text-4xl">🔐</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold gradient-text">Welcome to NebulaNotes</h1>
          <p className="text-xl text-text-secondary max-w-md mx-auto leading-relaxed">
            Your private thoughts, secured by mathematics. Connect your wallet to start your encrypted journaling journey.
          </p>
        </div>
      </div>

      {/* Connect Card */}
      <div className="glass rounded-3xl p-8 shadow-2xl border border-border/50">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text">Connect Your Wallet</h2>
            <p className="text-text-secondary">
              Choose your preferred wallet to access NebulaNotes
            </p>
          </div>

          {error && (
            <div className="neu-flat rounded-2xl p-4 border-l-4 border-red-500 bg-red-50/50">
              <div className="flex items-center gap-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <p className="text-red-800 text-sm font-medium">{error.message}</p>
              </div>
            </div>
          )}

          {/* Primary Connect Button */}
          <button
            onClick={onConnect}
            className="w-full btn-primary text-xl py-4 flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300 shadow-xl"
          >
            <span className="text-2xl">🔗</span>
            <span>Connect Wallet</span>
          </button>

          {/* Available Wallets */}
          {providers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-text-secondary font-medium">Available Wallets</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {providers.slice(0, 4).map((provider) => (
                  <div
                    key={provider.info.uuid}
                    className="neu-convex rounded-xl p-4 bg-surface/50 border border-border/50 hover:scale-105 transition-all duration-200 cursor-pointer"
                    onClick={onConnect}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={provider.info.icon}
                        alt={provider.info.name}
                        className="w-8 h-8 rounded-lg"
                      />
                      <span className="font-medium text-text">{provider.info.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="neu-flat rounded-2xl p-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-accent">🔒</span>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-text mb-1">Your Privacy Matters</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  All notes are encrypted using Fully Homomorphic Encryption (FHE) technology.
                  Only you can decrypt and view your content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="neu-convex rounded-2xl p-4 bg-surface/30 backdrop-blur-sm border border-border/50 text-center">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-primary text-xl">🔐</span>
          </div>
          <h3 className="font-semibold text-text mb-1">FHE Encrypted</h3>
          <p className="text-xs text-text-secondary">Military-grade encryption</p>
        </div>

        <div className="neu-convex rounded-2xl p-4 bg-surface/30 backdrop-blur-sm border border-border/50 text-center">
          <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-secondary text-xl">📱</span>
          </div>
          <h3 className="font-semibold text-text mb-1">Self-Sovereign</h3>
          <p className="text-xs text-text-secondary">You own your data</p>
        </div>

        <div className="neu-convex rounded-2xl p-4 bg-surface/30 backdrop-blur-sm border border-border/50 text-center">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-accent text-xl">⚡</span>
          </div>
          <h3 className="font-semibold text-text mb-1">Instant Access</h3>
          <p className="text-xs text-text-secondary">Always available</p>
        </div>
      </div>
    </div>
  );
}
