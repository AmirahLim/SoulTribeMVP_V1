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
    <div
      className={`relative rounded-[26px] p-5 backdrop-blur-xl transition-all ${className}`}
      style={{
        backgroundColor: '#F2EEE5',
        border: '1px solid rgba(32,59,48,0.18)',
        boxShadow: '0 4px 16px rgba(32,59,48,0.04)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-85"
        style={{
          background: 'radial-gradient(120% 80% at 12% 0%, rgba(91,217,154,0.10) 0%, transparent 62%)',
        }}
      />

      <div className="relative z-10">
        <div>
          <h3 className="font-sans text-xl font-semibold text-[#203B30]">Connection Notes</h3>
          <p className="mt-0.5 text-xs text-[#536657]">
            Little things worth knowing about being friends with me.
          </p>
        </div>

        {/* Horizontal scroll cards in dark glass style */}
        <div className="mt-4 flex gap-3.5 overflow-x-auto pb-2 scrollbar-none">
          {notes.map((note) => {
            const primaryThread = note.sourceThreads?.[0] || 'intent';
            const colorSpec = getThreadColor(primaryThread);

            return (
              <button type="button"
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="relative flex h-36 w-60 shrink-0 cursor-pointer flex-col justify-between rounded-[20px] p-4 border border-[rgba(32,59,48,0.18)] bg-[rgba(255,255,255,0.03)] backdrop-blur-md shadow-md transition-all hover:border-[rgba(32,59,48,0.18)] hover:scale-102 overflow-hidden"
              >
                <div
                  className="absolute inset-0 pointer-events-none opacity-75"
                  style={{
                    background: `radial-gradient(120% 80% at 12% 0%, ${colorSpec.wash} 0%, transparent 62%)`,
                  }}
                />
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-[#826044]">
                    {note.hook}
                  </p>
                  <p className="text-xs font-semibold leading-snug text-[#203B30] line-clamp-3">
                    "{note.statement}"
                  </p>
                  <span className="self-start text-[10px] font-bold text-[#38654D] hover:underline">
                    Tap for detail →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Immersive detail modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(7,9,8,0.85)] p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-[28px] border border-[rgba(32,59,48,0.18)] bg-[#F8F5EE] p-6 text-[#203B30] shadow-2xl">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#826044]">
              {selectedNote.hook}
            </p>
            <h4 className="font-sans mt-2 text-xl font-bold text-[#203B30]">
              "{selectedNote.statement}"
            </h4>
            <p className="mt-3 text-xs leading-relaxed text-[#536657]">
              {selectedNote.explanation}
            </p>

            {selectedNote.whatItLooksLike && (
              <div className="mt-4 rounded-xl border border-[rgba(32,59,48,0.18)] bg-[rgba(255,255,255,0.03)] p-3.5">
                <p className="text-[10px] font-bold text-[#38654D] uppercase">What this can look like</p>
                <p className="mt-1 text-xs text-[#536657]">{selectedNote.whatItLooksLike}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedNote(null)}
              className="mt-6 w-full rounded-xl bg-[#38654D] py-2.5 text-xs font-bold text-[#F5F2EA] hover:brightness-110"
            >
              Close Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
