"use client";

import { useState } from "react";

interface NoteMeta {
  timestamp: bigint;
  tags: string;
  titleLength: bigint;
  contentLength: bigint;
  isActive: boolean;
}

interface DecryptPageProps {
  note: NoteMeta;
  noteIndex: number;
  nebulaNotes: {
    decryptTitle: (index: number) => Promise<string>;
    decryptContent: (index: number) => Promise<string>;
    isDecrypting: boolean;
  };
  onClose: () => void;
  originalTitle?: string;
  originalContent?: string;
}

export function DecryptPage({ note, noteIndex, nebulaNotes, onClose }: DecryptPageProps) {
  const [decryptedTitle, setDecryptedTitle] = useState<string | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDecrypt = async () => {
    setIsLoading(true);
    try {
      const [title, content] = await Promise.all([
        nebulaNotes.decryptTitle(noteIndex),
        nebulaNotes.decryptContent(noteIndex),
      ]);

      setDecryptedTitle(title);
      setDecryptedContent(content);
    } catch (error) {
      console.error("Failed to decrypt note:", error);
      alert("Failed to decrypt note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="decrypt-dialog-title">
      {/* Background decorations - simplified */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500 border border-gray-200 dark:border-gray-700" role="document">
        {/* Animated border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 animate-pulse opacity-50"></div>
        <div className="absolute inset-[1px] rounded-3xl bg-white dark:bg-gray-800"></div>

        {/* Header */}
        <div className="relative flex justify-between items-center p-8 border-b border-border/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center shadow-lg animate-float">
                <span className="text-3xl animate-pulse">🔓</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <h3 id="decrypt-dialog-title" className="text-3xl font-bold gradient-text mb-1">Decrypt Note</h3>
              <p className="text-sm text-text-secondary flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
                Securely decrypt your encrypted note using FHE technology
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group w-10 h-10 rounded-full neu-convex hover:neu-pressed flex items-center justify-center text-text-secondary hover:text-text transition-all duration-300 hover:scale-110"
            aria-label="Close dialog"
          >
            <span className="text-xl group-hover:rotate-90 transition-transform duration-300">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="relative p-8 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Note metadata - Enhanced with better readability */}
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                  <span className="text-accent text-lg">📅</span>
                </div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Created</span>
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-medium leading-relaxed">
                {new Date(Number(note.timestamp) * 1000).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {note.tags && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <span className="text-secondary text-lg">🏷️</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {note.tags.split(',').map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full border border-accent/30">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Decrypt button - Enhanced */}
          {!decryptedTitle && !decryptedContent && (
            <div className="text-center py-20 space-y-8">
              {/* Animated lock icon */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center neu-convex">
                  <span className="text-5xl animate-bounce">🔒</span>
                </div>
              </div>

              <div className="space-y-4 max-w-lg mx-auto">
                <h4 className="text-2xl font-bold gradient-text">Ready to Decrypt</h4>
                <p className="text-text-secondary leading-relaxed">
                  Your note is securely encrypted on the blockchain using Fully Homomorphic Encryption.
                  Click below to decrypt and reveal its contents.
                </p>

                {/* Security indicators */}
                <div className="flex justify-center gap-4 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>FHE Protected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></span>
                    <span>Blockchain Secured</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-700"></span>
                    <span>Zero-Knowledge</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDecrypt}
                disabled={nebulaNotes.isDecrypting || isLoading}
                className="group btn-primary text-xl px-10 py-5 flex items-center gap-4 mx-auto shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
              >
                {nebulaNotes.isDecrypting || isLoading ? (
                  <>
                    <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="font-bold">Decrypting...</span>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <span className="text-3xl group-hover:animate-bounce">🔓</span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                    </div>
                    <span className="font-bold">Decrypt Note</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Decrypted content - Enhanced */}
          {(decryptedTitle || decryptedContent) && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              {/* Success animation and security notice */}
              <div className="relative">
                {/* Success particles effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping delay-300"></div>
                  <div className="absolute bottom-4 left-1/4 w-1 h-1 bg-accent rounded-full animate-ping delay-700"></div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/30 rounded-3xl p-6 border-l-4 border-green-400 border border-green-200 dark:border-green-700">
                  <div className="flex items-start gap-4">
                    <div className="relative w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 animate-float">
                      <span className="text-white text-xl animate-pulse">✅</span>
                      <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping"></div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xl font-bold text-green-800 dark:text-green-200">🔓 Decryption Successful!</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                        Your note has been securely decrypted using FHE technology. The content below is now visible in your current session.
                        Remember: the original note remains encrypted on the blockchain.
                      </p>
                      <div className="flex items-center gap-4 text-xs text-green-600 dark:text-green-400">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span>Session Only</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></span>
                          <span>FHE Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title section - Enhanced */}
              {decryptedTitle && (
                <div className="space-y-4 animate-in slide-in-from-left-4 duration-300 delay-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-primary text-xl">📄</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Note Title</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">The decrypted title of your note</p>
                    </div>
                  </div>
                  <div className="relative bg-white dark:bg-gray-700 rounded-3xl p-8 border border-gray-200 dark:border-gray-600 shadow-lg">
                    <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-relaxed pr-8">
                      {decryptedTitle}
                    </p>
                  </div>
                </div>
              )}

              {/* Content section - Enhanced */}
              {decryptedContent && (
                <div className="space-y-4 animate-in slide-in-from-left-4 duration-300 delay-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <span className="text-secondary text-xl">📝</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Note Content</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">The full decrypted content of your note</p>
                    </div>
                  </div>
                  <div className="relative bg-white dark:bg-gray-700 rounded-3xl p-8 border border-gray-200 dark:border-gray-600 shadow-lg">
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-300"></div>
                    </div>
                    <div className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap font-medium text-lg">
                      {decryptedContent}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Content verified with FHE
                      </span>
                      <span>{decryptedContent.length} characters</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced action buttons */}
              <div className="flex gap-6 pt-8 border-t border-border/50">
                <button
                  onClick={onClose}
                  className="group btn-secondary flex-1 flex items-center justify-center gap-3 py-4 text-base font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <div className="w-6 h-6 bg-red-400/20 rounded-lg flex items-center justify-center group-hover:bg-red-400/30 transition-colors">
                    <span className="text-red-500 group-hover:rotate-90 transition-transform">👁️</span>
                  </div>
                  <span>Close & Secure</span>
                </button>
                <button
                  onClick={() => {
                    const text = `Title: ${decryptedTitle || 'N/A'}\n\nContent: ${decryptedContent || 'N/A'}\n\nDate: ${new Date(Number(note.timestamp) * 1000).toLocaleString()}\nTags: ${note.tags || 'N/A'}`;
                    navigator.clipboard.writeText(text);
                    // You could add a toast notification here instead of alert
                    alert("✅ Note copied to clipboard!");
                  }}
                  className="group btn-primary flex-1 flex items-center justify-center gap-3 py-4 text-base font-semibold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-primary/25"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <span className="text-lg group-hover:animate-bounce">📋</span>
                  </div>
                  <span>Copy Note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
