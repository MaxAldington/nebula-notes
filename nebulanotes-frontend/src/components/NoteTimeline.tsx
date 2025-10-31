"use client";

import { useEffect, useState } from "react";
import { DecryptPage } from "./DecryptPage";

interface NoteMeta {
  timestamp: bigint;
  tags: string;
  titleLength: bigint;
  contentLength: bigint;
  isActive: boolean;
}

interface NoteTimelineProps {
  nebulaNotes: {
    getAllNotesMeta: () => Promise<NoteMeta[]>;
    decryptTitle: (index: number) => Promise<string>;
    decryptContent: (index: number) => Promise<string>;
    isDecrypting: boolean;
    canDecrypt: boolean;
  };
}

export function NoteTimeline({ nebulaNotes }: NoteTimelineProps) {
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  const [decryptedTitles, setDecryptedTitles] = useState<Record<number, string>>({});
  const [decryptedContents, setDecryptedContents] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [decryptingNoteIndex, setDecryptingNoteIndex] = useState<number | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const notesMeta = await nebulaNotes.getAllNotesMeta();
      setNotes(notesMeta);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptTitle = async (index: number) => {
    try {
      const titleLength = await nebulaNotes.decryptTitle(index);
      setDecryptedTitles(prev => ({ ...prev, [index]: titleLength }));
    } catch (error) {
      console.error("Failed to decrypt title:", error);
    }
  };

  const handleDecryptContent = async (index: number) => {
    try {
      const contentLength = await nebulaNotes.decryptContent(index);
      setDecryptedContents(prev => ({ ...prev, [index]: contentLength }));
    } catch (error) {
      console.error("Failed to decrypt content:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl">
            <span className="text-3xl">📚</span>
          </div>
          <h2 className="text-3xl font-bold gradient-text">Your Encrypted Notes</h2>
        </div>

        {/* Loading State */}
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="text-lg text-text-secondary">Loading your encrypted notes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl">
            <span className="text-3xl">📚</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Your Encrypted Notes</h2>
            <p className="text-text-secondary">Your private thoughts, secured by mathematics</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-16 space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center mx-auto">
            <span className="text-4xl">📝</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-text">No notes yet</h3>
            <p className="text-text-secondary max-w-sm mx-auto">
              Your encrypted notes will appear here. Start writing your first secure note above!
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
            <span>All notes are homomorphically encrypted</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl">
          <span className="text-3xl">📚</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Your Encrypted Notes</h2>
          <p className="text-text-secondary">
            {notes.length} secure note{notes.length !== 1 ? 's' : ''} stored on the blockchain
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent"></div>

        <div className="space-y-6">
          {notes.map((note, index) => (
            <div key={index} className="relative flex gap-6">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg border-4 border-surface">
                  <span className="text-white font-bold text-lg">
                    {decryptedTitles[index] ? '🔓' : '🔒'}
                  </span>
                </div>
              </div>

              {/* Note card */}
              <div className="flex-1 card-hover neu-convex rounded-2xl p-6 bg-surface/80 backdrop-blur-sm border border-border/50">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {decryptedTitles[index] ? (
                      <h3 className="text-xl font-bold text-text mb-1">
                        {decryptedTitles[index]}
                      </h3>
                    ) : (
                      <button
                        onClick={() => handleDecryptTitle(index)}
                        disabled={!nebulaNotes.canDecrypt || nebulaNotes.isDecrypting}
                        className="group flex items-center gap-2 text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="w-2 h-2 bg-primary rounded-full group-hover:scale-125 transition-transform"></span>
                        <span className="font-medium">[Encrypted Title]</span>
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-text-secondary font-medium">
                    {new Date(Number(note.timestamp) * 1000).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                {/* Content preview */}
                <div className="mb-4">
                  {decryptedContents[index] ? (
                    <p className="text-text-secondary leading-relaxed">
                      {decryptedContents[index]}
                    </p>
                  ) : (
                    <button
                      onClick={() => handleDecryptContent(index)}
                      disabled={!nebulaNotes.canDecrypt || nebulaNotes.isDecrypting}
                      className="group flex items-center gap-2 text-secondary hover:text-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="w-2 h-2 bg-secondary rounded-full group-hover:scale-125 transition-transform"></span>
                      <span className="font-medium">[Encrypted Content]</span>
                    </button>
                  )}
                </div>

                {/* Tags */}
                {note.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags.split(',').map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full border border-accent/20"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setDecryptingNoteIndex(index)}
                    disabled={!nebulaNotes.canDecrypt}
                    className="btn-primary text-sm px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <span className="text-base">🔓</span>
                    <span>Decrypt Note</span>
                  </button>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span>FHE Protected</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decrypt Modal */}
      {decryptingNoteIndex !== null && (
        <DecryptPage
          note={notes[decryptingNoteIndex]}
          noteIndex={decryptingNoteIndex}
          nebulaNotes={nebulaNotes}
          onClose={() => setDecryptingNoteIndex(null)}
        />
      )}
    </div>
  );
}
