"use client";

import { useState, useEffect } from "react";

interface NoteMeta {
  timestamp: bigint;
  tags: string;
  titleLength: bigint;
  contentLength: bigint;
  isActive: boolean;
}

interface StatsPageProps {
  nebulaNotes: {
    getAllNotesMeta: () => Promise<NoteMeta[]>;
  };
}

export function StatsPage({ nebulaNotes }: StatsPageProps) {
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const notesMeta = await nebulaNotes.getAllNotesMeta();
      setNotes(notesMeta);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-text mb-4">Statistics</h3>
        <div className="text-center py-8">
          <p className="text-text-secondary">Loading statistics...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalNotes = notes.length;
  const totalContentLength = notes.reduce((sum, note) => sum + Number(note.contentLength), 0);
  const averageContentLength = totalNotes > 0 ? Math.round(totalContentLength / totalNotes) : 0;

  // Tag statistics
  const tagStats: Record<string, number> = {};
  notes.forEach(note => {
    if (note.tags.trim()) {
      const tags = note.tags.split(',').map(tag => tag.trim().toLowerCase());
      tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
    }
  });

  const topTags = Object.entries(tagStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Date statistics
  const now = new Date();
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);

  const notesThisWeek = notes.filter(note =>
    new Date(Number(note.timestamp) * 1000) >= thisWeek
  ).length;

  const notesThisMonth = notes.filter(note =>
    new Date(Number(note.timestamp) * 1000) >= thisMonth
  ).length;

  const notesThisYear = notes.filter(note =>
    new Date(Number(note.timestamp) * 1000) >= thisYear
  ).length;

  // Writing streak (simplified - consecutive days with at least one note)
  const writingDays = new Set(
    notes.map(note => {
      const date = new Date(Number(note.timestamp) * 1000);
      return date.toDateString();
    })
  );

  const sortedDates = Array.from(writingDays).sort();
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const date = new Date(sortedDates[i]);
    const prevDate = i < sortedDates.length - 1 ? new Date(sortedDates[i + 1]) : null;

    if (!prevDate || (date.getTime() - prevDate.getTime()) <= 24 * 60 * 60 * 1000) {
      tempStreak++;
      if (i === sortedDates.length - 1) {
        currentStreak = tempStreak;
      }
    } else {
      maxStreak = Math.max(maxStreak, tempStreak);
      tempStreak = 1;
    }
  }
  maxStreak = Math.max(maxStreak, tempStreak);

  return (
    <div className="bg-surface rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold text-text mb-6">Statistics</h3>

      {totalNotes === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">No notes yet. Start writing to see your statistics!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Overview statistics">
            <div className="bg-background p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-text-secondary mb-1">Total Notes</h4>
              <p className="text-2xl font-bold text-text">{totalNotes}</p>
            </div>

            <div className="bg-background p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-text-secondary mb-1">Avg Content Length</h4>
              <p className="text-2xl font-bold text-text">{averageContentLength}</p>
            </div>

            <div className="bg-background p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-text-secondary mb-1">Current Streak</h4>
              <p className="text-2xl font-bold text-text">{currentStreak} days</p>
            </div>

            <div className="bg-background p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-text-secondary mb-1">Longest Streak</h4>
              <p className="text-2xl font-bold text-text">{maxStreak} days</p>
            </div>
          </div>

          {/* Time-based Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="region" aria-label="Time-based statistics">
            <div className="bg-background p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-text-secondary mb-1">This Week</h4>
              <p className="text-xl font-bold text-text">{notesThisWeek} notes</p>
            </div>

            <div className="bg-background p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-text-secondary mb-1">This Month</h4>
              <p className="text-xl font-bold text-text">{notesThisMonth} notes</p>
            </div>

            <div className="bg-background p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-text-secondary mb-1">This Year</h4>
              <p className="text-xl font-bold text-text">{notesThisYear} notes</p>
            </div>
          </div>

          {/* Tag Statistics */}
          {topTags.length > 0 && (
            <div className="bg-background p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-text-secondary mb-3">Top Tags</h4>
              <div className="space-y-2">
                {topTags.map(([tag, count]) => (
                  <div key={tag} className="flex justify-between items-center">
                    <span className="text-text capitalize">{tag}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-border rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(count / Math.max(...topTags.map(([,c]) => c))) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-text-secondary w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Writing Activity Heatmap (simplified) */}
          <div className="bg-background p-4 rounded-lg border border-border">
            <h4 className="text-sm font-medium text-text-secondary mb-3">Writing Activity</h4>
            <div className="text-center py-4">
              <p className="text-text-secondary">
                Active writing days: {writingDays.size}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                You've written notes on {writingDays.size} different days
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
