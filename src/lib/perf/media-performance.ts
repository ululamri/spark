export const mediaVariantWidths = {
  avatar: [64, 128],
  feed: [480, 720],
  detail: [1080, 1440]
} as const;

export type MediaVariant = keyof typeof mediaVariantWidths;

export function defaultMediaVariant(width: number): MediaVariant {
  if (width <= 160) return 'avatar';
  if (width <= 760) return 'feed';
  return 'detail';
}
