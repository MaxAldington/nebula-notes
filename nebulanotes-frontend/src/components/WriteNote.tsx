"use client";

import { useState } from "react";

interface WriteNoteProps {
  nebulaNotes: {
    addNote: (title: string, content: string, tags: string) => Promise<void>;
    isAddingNote: boolean;
    canAddNote: boolean;
  };
}

export function WriteNote({ nebulaNotes }: WriteNoteProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await nebulaNotes.addNote(title.trim(), content.trim(), tags.trim());
      setTitle("");
      setContent("");
      setTags("");
    } catch (error) {
      console.error("Failed to add note:", error);
      alert("Failed to add note. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl mb-4">
          <span className="text-3xl">📝</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Write a New Note</h2>
          <p className="text-text-secondary max-w-md mx-auto">
            Your thoughts will be encrypted using FHEVM technology, ensuring complete privacy on the blockchain.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-text">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field w-full"
              placeholder="Give your note a meaningful title..."
              required
            />
          </div>

          {/* Content Field */}
          <div className="space-y-2">
            <label htmlFor="content" className="flex items-center gap-2 text-sm font-semibold text-text">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="input-field w-full resize-none"
              placeholder="Pour your thoughts here... Your content will be fully encrypted and secure."
              required
            />
            <div className="flex justify-between items-center text-xs text-text-secondary">
              <span>✨ Fully encrypted with FHEVM</span>
              <span>{content.length} characters</span>
            </div>
          </div>

          {/* Tags Field */}
          <div className="space-y-2">
            <label htmlFor="tags" className="flex items-center gap-2 text-sm font-semibold text-text">
              <span className="w-2 h-2 bg-accent rounded-full"></span>
              Tags <span className="text-text-secondary font-normal">(optional)</span>
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input-field w-full"
              placeholder="personal, work, ideas, inspiration..."
            />
            <p className="text-xs text-text-secondary">
              Separate multiple tags with commas for better organization
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!nebulaNotes.canAddNote || nebulaNotes.isAddingNote}
              className={`w-full btn-primary flex items-center justify-center gap-3 font-semibold text-base transition-all duration-300 ${
                nebulaNotes.isAddingNote ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-xl'
              }`}
            >
              {nebulaNotes.isAddingNote ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Encrypting & Saving...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🔒</span>
                  <span>Save Encrypted Note</span>
                </>
              )}
            </button>

            {!nebulaNotes.canAddNote && (
              <p className="text-center text-sm text-text-secondary mt-3">
                Please connect your wallet and ensure FHEVM is initialized
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
