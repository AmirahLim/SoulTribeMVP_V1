import { completeDraft, isDraft, type BaselineDraft } from './sixQuestionOnboarding';

export class OnboardingHandoffError extends Error {
  constructor(message: string, readonly requiresDetails = false) { super(message); }
}

/** Success is a committed profile, never merely a saved anonymous draft. */
export async function claimOnboarding(
  details: {displayName?: string; birthYear?: number; expectedUserId?: string} = {},
  send: typeof fetch = fetch,
): Promise<BaselineDraft> {
  const response = await send('/api/onboarding/claim', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(details),
  });
  const data = await response.json();
  if (!response.ok) throw new OnboardingHandoffError(data.error || 'Your answers could not be saved to your profile. Please retry.', data.requiresDetails === true);
  if (data.saved !== true || !isDraft(data.draft) || !completeDraft(data.draft)) throw new OnboardingHandoffError('The profile save could not be confirmed. Please retry.');
  return data.draft;
}
