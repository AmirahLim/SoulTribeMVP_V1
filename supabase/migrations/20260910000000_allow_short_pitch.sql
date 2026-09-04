-- Lower minimum pitch character length from 20 to 1 on outings table
ALTER TABLE outings DROP CONSTRAINT IF EXISTS outings_pitch_check;
ALTER TABLE outings ADD CONSTRAINT outings_pitch_check CHECK (char_length(pitch) between 1 and 600);
