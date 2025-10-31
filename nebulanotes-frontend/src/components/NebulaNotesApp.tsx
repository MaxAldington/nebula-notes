"use client";

import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { createFhevmInstance } from "../../fhevm/fhevm";
import { useMetaMask } from "../../hooks/metamask/useMetaMaskProvider";
import { useMetaMaskEthersSigner } from "../../hooks/metamask/useMetaMaskEthersSigner";
import { useNebulaNotes } from "../../hooks/fhevm/useNebulaNotes";
import { GenericStringInMemoryStorage } from "../../fhevm/GenericStringStorage";
import { FhevmDecryptionSignatureStorage } from "../../fhevm/FhevmDecryptionSignature";
import { WalletConnect } from "./WalletConnect";
import { NoteTimeline } from "./NoteTimeline";
import { WriteNote } from "./WriteNote";
import { SearchPage } from "./SearchPage";
import { StatsPage } from "./StatsPage";

export function NebulaNotesApp() {
  const { provider, chainId, accounts, isConnected, connect, error } = useMetaMask();
  const { signer, provider: ethersProvider } = useMetaMaskEthersSigner();

  const [fhevmInstance, setFhevmInstance] = useState<any>(undefined);
  const [isLoadingFhevm, setIsLoadingFhevm] = useState(false);
  const [currentPage, setCurrentPage] = useState<'write' | 'timeline' | 'search' | 'stats'>('write');

  const storageRef = useRef(new GenericStringInMemoryStorage());

  const sameChainRef = useRef<(chainId: number | undefined) => boolean>((chainId) => {
    return chainId === 31337 || chainId === 11155111;
  });

  const sameSignerRef = useRef<(signer: ethers.JsonRpcSigner | undefined) => boolean>((signer) => {
    return !!signer;
  });

  const nebulaNotes = useNebulaNotes({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage: storageRef.current,
    eip1193Provider: provider,
    chainId,
    ethersSigner: signer,
    ethersReadonlyProvider: ethersProvider,
    storage: storageRef.current,
  });

  // Initialize FHEVM instance when provider or chainId changes
  useEffect(() => {
    if (!provider || !chainId) {
      setFhevmInstance(undefined);
      return;
    }

    setIsLoadingFhevm(true);
    const abortController = new AbortController();

    createFhevmInstance({
      provider: provider,
      signal: abortController.signal,
      onStatusChange: (status) => {
        console.log("FHEVM status:", status);
      },
    })
      .then((instance) => {
        if (!abortController.signal.aborted) {
          setFhevmInstance(instance);
        }
      })
      .catch((error) => {
        console.error("Failed to create FHEVM instance:", error);
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoadingFhevm(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [provider, chainId]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <WalletConnect onConnect={connect} error={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with gradient background */}
      <header className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-3xl -translate-y-1/3"></div>

        <div className="relative max-w-6xl mx-auto p-6 lg:p-8">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">✨</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">NebulaNotes</h1>
                <p className="text-sm text-text-secondary">Encrypted Memory Archive</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Network indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-surface/80 backdrop-blur-sm rounded-full border border-border/50">
                <div className={`w-2 h-2 rounded-full ${
                  chainId === 31337 ? 'bg-green-500' :
                  chainId === 11155111 ? 'bg-orange-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {chainId === 31337 ? "Localhost" : chainId === 11155111 ? "Sepolia" : "Unknown"}
                </span>
              </div>

              {/* Wallet address */}
              <div className="px-3 py-2 bg-surface/80 backdrop-blur-sm rounded-full border border-border/50">
                <span className="text-sm font-mono text-text-secondary">
                  {accounts?.[0]?.slice(0, 6)}...{accounts?.[0]?.slice(-4)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation with glassmorphism */}
          <nav className="glass rounded-2xl p-2" role="tablist" aria-label="Main navigation">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentPage('write')}
                className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface ${
                  currentPage === 'write'
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105'
                    : 'text-text-secondary hover:text-text hover:bg-white/10 hover:scale-102'
                }`}
                role="tab"
                aria-selected={currentPage === 'write'}
                aria-controls="write-panel"
                id="write-tab"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <span>Write</span>
                </span>
                {currentPage === 'write' && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                )}
              </button>
              <button
                onClick={() => setCurrentPage('timeline')}
                className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface ${
                  currentPage === 'timeline'
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105'
                    : 'text-text-secondary hover:text-text hover:bg-white/10 hover:scale-102'
                }`}
                role="tab"
                aria-selected={currentPage === 'timeline'}
                aria-controls="timeline-panel"
                id="timeline-tab"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">📚</span>
                  <span>Timeline</span>
                </span>
                {currentPage === 'timeline' && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                )}
              </button>
              <button
                onClick={() => setCurrentPage('search')}
                className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface ${
                  currentPage === 'search'
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105'
                    : 'text-text-secondary hover:text-text hover:bg-white/10 hover:scale-102'
                }`}
                role="tab"
                aria-selected={currentPage === 'search'}
                aria-controls="search-panel"
                id="search-tab"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">🔍</span>
                  <span>Search</span>
                </span>
                {currentPage === 'search' && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                )}
              </button>
              <button
                onClick={() => setCurrentPage('stats')}
                className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface ${
                  currentPage === 'stats'
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105'
                    : 'text-text-secondary hover:text-text hover:bg-white/10 hover:scale-102'
                }`}
                role="tab"
                aria-selected={currentPage === 'stats'}
                aria-controls="stats-panel"
                id="stats-tab"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span>Stats</span>
                </span>
                {currentPage === 'stats' && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto p-6 lg:p-8 pb-16">
        {isLoadingFhevm ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
              <div className="space-y-2">
                <p className="text-lg font-semibold gradient-text">Initializing FHEVM</p>
                <p className="text-sm text-text-secondary">Setting up encrypted environment...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface/30 backdrop-blur-sm rounded-3xl border border-border/50 p-6 lg:p-8 shadow-xl">
            {currentPage === 'write' && (
              <div role="tabpanel" id="write-panel" aria-labelledby="write-tab">
                <WriteNote nebulaNotes={nebulaNotes} />
              </div>
            )}
            {currentPage === 'timeline' && (
              <div role="tabpanel" id="timeline-panel" aria-labelledby="timeline-tab">
                <NoteTimeline nebulaNotes={nebulaNotes} />
              </div>
            )}
            {currentPage === 'search' && (
              <div role="tabpanel" id="search-panel" aria-labelledby="search-tab">
                <SearchPage nebulaNotes={nebulaNotes} />
              </div>
            )}
            {currentPage === 'stats' && (
              <div role="tabpanel" id="stats-panel" aria-labelledby="stats-tab">
                <StatsPage nebulaNotes={nebulaNotes} />
              </div>
            )}
          </div>
        )}

        {/* Floating action hint */}
        <div className="fixed bottom-6 right-6 z-10">
          <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-bounce">
            ✨ Powered by FHEVM
          </div>
        </div>
      </main>
    </div>
  );
}
