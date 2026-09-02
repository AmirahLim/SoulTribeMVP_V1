'use client';

import React, { useState } from 'react';
import { getThreadColor } from '@soul-tribe/tokens';

export interface NoteItem {
  id: string;
  hook: string; // e.g. "How to become friends with me"
  statement: string; // e.g. "Invite me to low-key, focused activities first"
  explanation: string; // e.g. "I feel most comfortable when there's an activity to ground our conversation."
  whatItLooksLike?: string; // e.g. "A quiet coffee walk or pottery class works better than a noisy lounge."
  sourceThreads?: string[]; // e.g. ["personality", "interests"]
}

export interface ConnectionNotesProps {
  notes: NoteItem[];
  className?: string;
}

export function ConnectionNotes({ notes = [], className = '' }: ConnectionNotesProps) {
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);

  if (!notes || notes.length === 0) return null;

  return (
    <div className={`rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-6 shadow-xl ${className}`}>
      <div>
        <h3 className="text-xl font-bold text-[#F3F0E9]">Connection Notes</h3>
        <p className="mt-0.5 text-xs text-[#A6AAA4]">
          Little things worth knowing about being friends with me.
        </p>
      </div>

      {/* Horizontal scroll cards */}
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        {notes.map((note) => {
          const primaryThread = note.sourceThreads?.[0] || 'intent';
          const colorSpec = getThreadColor(primaryThread);

          return (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className="flex h-40 w-64 shrink-0 cursor-pointer flex-col justify-between rounded-[20px] p-4.5 shadow-md transition-all hover:scale-102"
              style={{
                background: `linear-gradient(135deg, ${colorSpec.surface} 0%, #F0E7D6 100%)`,
                color: colorSpec.ink,
              }}
            >
              <p className="text-[10px] font-bold tracking-wider uppercase opacity-75">
                {note.hook}
              </p>
              <p className="text-xs font-bold leading-snug line-clamp-3">
                "{note.statement}"
              </p>
              <span className="self-start text-[10px] font-semibold underline opacity-80">
                Tap for detail →
              </span>
            </div>
          );
        })}
      </div>

      {/* Immersive detail modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1D15]/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-[28px] border border-[#F3F0E9]/20 bg-[#15261C] p-6 text-[#F3F0E9] shadow-2xl">
            <p className="text-[10px] font-bold tracking-widest text-[#8F998D] uppercase">
              {selectedNote.hook}
            </p>
            <h4 className="mt-2 text-xl font-bold text-[#D9E4D2]">
              "{selectedNote.statement}"
            </h4>
            <p className="mt-3 text-xs leading-relaxed text-[#F3F0E9]/90">
              {selectedNote.explanation}
            </p>

            {selectedNote.whatItLooksLike && (
              <div className="mt-4 rounded-xl border border-[#D9E4D2]/20 bg-[#0D1D15] p-3.5">
                <p className="text-[10px] font-bold text-[#D9E4D2] uppercase">What this can look like</p>
                <p className="mt-1 text-xs text-[#A6AAA4]">{selectedNote.whatItLooksLike}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedNote(null)}
              className="mt-6 w-full rounded-xl bg-[#2D523E] py-2.5 text-xs font-bold text-[#F3F0E9] hover:bg-[#2D523E]/80"
            >
              Close Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
