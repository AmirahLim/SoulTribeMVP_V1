export interface Observation {
  observedValue: number; // 0..1 scale
}

export interface RecalibrationResult {
  originalValue: number;
  recalibratedValue: number;
  delta: number;
  observationCount: number;
  hasShifted: boolean;
  userFacingMessage?: string;
}

export function recalibrateTrait(
  selfReportValue: number,
  observations: Observation[],
  traitName: string
): RecalibrationResult {
  if (observations.length < 3) {
    return {
      originalValue: selfReportValue,
      recalibratedValue: selfReportValue,
      delta: 0,
      observationCount: observations.length,
      hasShifted: false,
    };
  }

  const learningRate = 0.10;
  const meanObserved =
    observations.reduce((sum, obs) => sum + obs.observedValue, 0) / observations.length;

  const rawShift = learningRate * (meanObserved - selfReportValue);
  const clampedShift = Math.max(-0.20, Math.min(0.20, rawShift));
  const recalibrated = Math.max(0, Math.min(1, selfReportValue + clampedShift));

  const hasShifted = Math.abs(clampedShift) >= 0.05;
  let userFacingMessage: string | undefined = undefined;

  if (hasShifted) {
    if (traitName === 'social_frequency') {
      userFacingMessage =
        clampedShift > 0
          ? "Your rhythm has shifted — you've been meeting more often than you expected to."
          : "Your rhythm has shifted — you've been taking a quieter pace recently.";
    } else if (traitName === 'opening_pace') {
      userFacingMessage =
        clampedShift > 0
          ? "Your rhythm has shifted — you've been opening up faster in recent meetups."
          : "Your rhythm has shifted — you've been taking your time opening up.";
    } else {
      userFacingMessage = `Your rhythm has shifted based on ${observations.length} recent outings.`;
    }
  }

  return {
    originalValue: selfReportValue,
    recalibratedValue: recalibrated,
    delta: clampedShift,
    observationCount: observations.length,
    hasShifted,
    userFacingMessage,
  };
}
