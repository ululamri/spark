export type SparkAnimationLevel = 'off' | 'calm' | 'rich';

export function browserWantsLowMotion() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function canPlayAnimation(level: SparkAnimationLevel = 'calm') {
  if (level === 'off') return false;
  return !browserWantsLowMotion();
}
