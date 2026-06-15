<script lang="ts">
  type Props = {
    src?: string | null;
    srcset?: string;
    sizes?: string;
    alt: string;
    loading?: 'lazy' | 'eager';
    decoding?: 'async' | 'auto' | 'sync';
    fetchpriority?: 'high' | 'low' | 'auto';
    fit?: 'cover' | 'contain';
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    src,
    srcset = '',
    sizes = '100vw',
    alt,
    loading = 'lazy',
    decoding = 'async',
    fetchpriority = 'auto',
    fit = 'cover',
    width,
    height,
    class: className = ''
  }: Props = $props();

  let failed = $state(false);
  const canRender = $derived(Boolean(src) && !failed);
</script>

<div class={`spark-optimized-image ${className}`} data-fit={fit} data-loaded={canRender}>
  {#if canRender}
    <img
      src={src ?? ''}
      srcset={srcset || undefined}
      sizes={srcset ? sizes : undefined}
      {alt}
      {loading}
      {decoding}
      {fetchpriority}
      {width}
      {height}
      onerror={() => (failed = true)}
    />
  {:else}
    <div class="spark-optimized-image-fallback" role="img" aria-label={alt}>
      <span>{alt.slice(0, 2).toUpperCase()}</span>
    </div>
  {/if}
</div>

<style>
  .spark-optimized-image {
    position: relative;
    display: block;
    width: 100%;
    min-height: 120px;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(31, 117, 255, 0.08), rgba(124, 58, 237, 0.08));
  }

  .spark-optimized-image img,
  .spark-optimized-image-fallback {
    display: block;
    width: 100%;
    height: 100%;
    min-height: inherit;
  }

  .spark-optimized-image img {
    object-fit: cover;
  }

  .spark-optimized-image[data-fit='contain'] img {
    object-fit: contain;
  }

  .spark-optimized-image-fallback {
    display: grid;
    place-items: center;
    color: var(--spark-blue-strong);
    font-size: 12px;
    font-weight: 800;
  }
</style>
