# Early Read reward and self-reported town matching

The final onboarding action now opens Early Read before signup. Existing capability-token draft protections remain in place. Signup, adult eligibility and profile claim are still required before meeting members. Errors show an error state, never a sample reading.

The reading combines exact answers into tentative, explainable patterns. Each card lists its evidence and invites correction. The engine does not infer diagnoses, protected traits, opening speed or initiation behaviour from absent answers. Desired qualities are interpreted as possible needs or values, never proof of possessing a trait. Custom text is quoted as evidence without assigning unsupported semantic traits.

Feedback is stored privately in baselineV2.earlyReadFeedback and excluded from the public-answer projection. Rejected interpretations are suppressed in favour of the member's correction. Feedback is tied to the evidence that produced the reading; changing that evidence invalidates stale feedback. Corrections change the narrative, not numeric matching traits. Editing the underlying explicit answers changes matching preferences. Current-version custom answers are preserved when reopening onboarding.

After the founder chose not to configure a geocoding provider, location matching is deliberately limited to a small preference for the same reported town AND country. SAME_REPORTED_TOWN_BOOST is a configurable 0.02 ranking hypothesis, never proof that two people are within a radius. Unknown/different town names do not become guessed coordinates or travel times. New kilometre preferences are preserved but cannot drive radius exclusion without mapped places. Legacy minute-based policy remains unchanged for legacy profiles.

No geocoder, device location, home address, new database migration, or automatic publication is introduced. Before production release, confirm real-member draft resume, correction save/reload, signup, profile claim and match rendering. No production deployment is implied by a successful local build.
