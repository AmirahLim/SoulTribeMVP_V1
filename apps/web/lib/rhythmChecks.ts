import { checkIsSupabaseConfigured, getSupabaseBrowserClient } from './supabase';

export interface RhythmCheckInput {
  outing_id: string;
  author_id: string;
  about_id: string;
  would_meet_again: number; // 1-5
  energy_read?: 'quieter' | 'as_expected' | 'livelier' | null;
  pace_read?: 'slower' | 'as_expected' | 'faster' | null;
  note?: string | null;
}

export interface OutingRecordInput {
  outing_id: string;
  headline?: string | null;
  attended: string[];
  photo_urls?: string[];
}

let mockRhythmChecks: RhythmCheckInput[] = [];
let mockOutingRecords: OutingRecordInput[] = [];

export function setMockRhythmChecks(checks: RhythmCheckInput[]): void {
  mockRhythmChecks = [...checks];
}

export function getMockRhythmChecks(): RhythmCheckInput[] {
  return mockRhythmChecks;
}

export function setMockOutingRecords(records: OutingRecordInput[]): void {
  mockOutingRecords = [...records];
}

export function getMockOutingRecords(): OutingRecordInput[] {
  return mockOutingRecords;
}

export function clearMockRhythmData(): void {
  mockRhythmChecks = [];
  mockOutingRecords = [];
}

/**
 * Save post-outing rhythm check feedback to rhythm_checks table in Supabase.
 * Author ID must match signed-in user.
 */
export async function saveRhythmCheck(check: RhythmCheckInput): Promise<{ success: boolean; error?: string }> {
  const existingIdx = mockRhythmChecks.findIndex(
    (r) => r.outing_id === check.outing_id && r.author_id === check.author_id && r.about_id === check.about_id
  );
  if (existingIdx >= 0) {
    mockRhythmChecks[existingIdx] = { ...check };
  } else {
    mockRhythmChecks.push({ ...check });
  }

  if (checkIsSupabaseConfigured()) {
    try {
      const client = getSupabaseBrowserClient();
      const { error } = await client
        .from('rhythm_checks')
        .upsert(
          {
            outing_id: check.outing_id,
            author_id: check.author_id,
            about_id: check.about_id,
            would_meet_again: check.would_meet_again,
            energy_read: check.energy_read || null,
            pace_read: check.pace_read || null,
            note: check.note || null,
          },
          { onConflict: 'outing_id,author_id,about_id' }
        );

      if (error) {
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to save rhythm check' };
    }
  }

  return { success: true };
}

/**
 * Save outing record to outing_records table in Supabase.
 * Writes attended UUIDs array.
 */
export async function saveOutingRecord(record: OutingRecordInput): Promise<{ success: boolean; error?: string }> {
  const existingIdx = mockOutingRecords.findIndex((r) => r.outing_id === record.outing_id);
  if (existingIdx >= 0) {
    mockOutingRecords[existingIdx] = { ...record };
  } else {
    mockOutingRecords.push({ ...record });
  }

  if (checkIsSupabaseConfigured()) {
    try {
      const client = getSupabaseBrowserClient();
      const { error } = await client
        .from('outing_records')
        .upsert(
          {
            outing_id: record.outing_id,
            headline: record.headline || null,
            attended: record.attended || [],
            photo_urls: record.photo_urls || [],
          },
          { onConflict: 'outing_id' }
        );

      if (error) {
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to save outing record' };
    }
  }

  return { success: true };
}
