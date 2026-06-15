export const feedRenderingDefaults = {
  initialBatchSize: 12,
  nextBatchSize: 8,
  virtualizeAfter: 40,
  preserveScroll: true,
  imagePriorityAboveFold: 2
} as const;

export function shouldVirtualizeFeed(itemCount: number) {
  return itemCount >= feedRenderingDefaults.virtualizeAfter;
}
