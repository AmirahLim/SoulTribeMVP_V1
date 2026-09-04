-- Allow 'intellectual' in outings_activity_category_check constraint if needed
ALTER TABLE outings DROP CONSTRAINT IF EXISTS outings_activity_category_check;
ALTER TABLE outings ADD CONSTRAINT outings_activity_category_check
  CHECK (activity_category IN ('coffee', 'dining', 'active', 'cultural', 'nightlife', 'creative', 'intellectual'));
