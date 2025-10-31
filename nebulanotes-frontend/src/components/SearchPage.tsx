"use client";

import { useState, useEffect } from "react";

interface NoteMeta {
  timestamp: bigint;
  tags: string;
  titleLength: bigint;
  contentLength: bigint;
  isActive: boolean;
}

interface SearchPageProps {
  nebulaNotes: {
    getAllNotesMeta: () => Promise<NoteMeta[]>;
  };
}

export function SearchPage({ nebulaNotes }: SearchPageProps) {
  const [allNotes, setAllNotes] = useState<NoteMeta[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NoteMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [minLength, setMinLength] = useState("");

  useEffect(() => {
    loadAllNotes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allNotes, dateFrom, dateTo, tagFilter, minLength]);

  const loadAllNotes = async () => {
    try {
      const notes = await nebulaNotes.getAllNotesMeta();
      setAllNotes(notes);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allNotes];

    // Date range filter
    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      filtered = filtered.filter(note =>
        Number(note.timestamp) * 1000 >= fromTime
      );
    }

    if (dateTo) {
      const toTime = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000; // End of day
      filtered = filtered.filter(note =>
        Number(note.timestamp) * 1000 <= toTime
      );
    }

    // Tag filter
    if (tagFilter.trim()) {
      const searchTag = tagFilter.toLowerCase().trim();
      filtered = filtered.filter(note =>
        note.tags.toLowerCase().includes(searchTag)
      );
    }

    // Minimum content length filter
    if (minLength) {
      const minLen = parseInt(minLength);
      filtered = filtered.filter(note =>
        Number(note.contentLength) >= minLen
      );
    }

    setFilteredNotes(filtered);
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setTagFilter("");
    setMinLength("");
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-text mb-4">Search Notes</h3>
        <div className="text-center py-8">
          <p className="text-text-secondary">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold text-text mb-6">Search Notes</h3>

      {/* Search Filters */}
      <div className="mb-6 space-y-4" role="search" aria-label="Note search filters">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-text mb-1">
              From Date
            </label>
            <input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-text mb-1">
              To Date
            </label>
            <input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="tagFilter" className="block text-sm font-medium text-text mb-1">
              Tag Contains
            </label>
            <input
              id="tagFilter"
              type="text"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              placeholder="e.g., work, personal"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="minLength" className="block text-sm font-medium text-text mb-1">
              Min Content Length
            </label>
            <input
              id="minLength"
              type="number"
              value={minLength}
              onChange={(e) => setMinLength(e.target.value)}
              placeholder="e.g., 100"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-text-secondary border border-border rounded-md hover:bg-border/50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="mb-4">
        <p className="text-text-secondary">
          Found {filteredNotes.length} of {allNotes.length} notes
        </p>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">
            {allNotes.length === 0 ? "No notes yet." : "No notes match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note, index) => (
            <div key={index} className="border border-border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-text">[Encrypted Title]</h4>
                </div>
                <div className="text-sm text-text-secondary">
                  {new Date(Number(note.timestamp) * 1000).toLocaleDateString()}
                </div>
              </div>

              <p className="text-text-secondary">
                Content Length: {Number(note.contentLength)} characters
              </p>

              {note.tags && (
                <div className="mt-2">
                  <span className="text-sm text-text-secondary">Tags: {note.tags}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
