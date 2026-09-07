# Q4: desired friend qualities

Q4 revision 2 replaces the opening-pace control with up to three desired friend qualities. Contact and planning remain expectations. All three parts use labelled buttons, not sliders. Descriptions are available in an expandable glossary. Photos remain unchanged.

`desiredQualities` is stored only in private baseline JSON, not in personal values or self-reported traits. Early Read repeats the user's choices. No new Bond Read claim or matching score is inferred from these preferences. Evidence about the other person's qualities remains unknown until independently measured. Engine integration needs explicit measured-trait mappings and evidence validation before release; this change collects preferences, not an invented compatibility signal.

New drafts carry `q4Revision: 2`. They require qualities, contact and planning but not opening. Earlier drafts retain their legacy validation, and historical opening answers are preserved. Apply `20260916000000_desired_friend_qualities.sql` after earlier onboarding migrations before live signup testing. Design preview requires no database.
