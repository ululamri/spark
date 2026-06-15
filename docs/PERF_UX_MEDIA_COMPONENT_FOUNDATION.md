# PERF-UX-04 Optimized Media Component Foundation

**Priority:** UI/UX performance before Admin UI and Starknet integration.

This pass prepares frontend social media rendering for optimized variants while keeping the current public media URL fallback stable.

## Added frontend component

```text
src/lib/ui/SparkOptimizedImage.svelte
```

The component provides:

```text
src fallback
srcset support
auto async decoding
lazy loading by default
error fallback
cover/contain fit modes
```

## Social media integration

```text
src/lib/ui/social/SparkSocialPostCard.svelte
```

Social post image attachments now render through `SparkOptimizedImage`.

Current fallback path:

```text
optimizedUrls.feed720
optimizedUrls.feed480
publicUrl
```

Open/original link fallback:

```text
optimizedUrls.original
publicUrl
```

This means the UI is ready for optimized imgproxy variants without breaking current media rendering when the backend still only returns `public_url`.

## Schema and gateway support

```text
src/lib/social/social-schema.ts
src/lib/social/social-backend-gateway.ts
```

The frontend can now preserve optional backend media variant fields:

```text
optimized_urls.avatar_64  -> optimizedUrls.avatar64
optimized_urls.avatar_128 -> optimizedUrls.avatar128
optimized_urls.feed_480   -> optimizedUrls.feed480
optimized_urls.feed_720   -> optimizedUrls.feed720
optimized_urls.detail_1080 -> optimizedUrls.detail1080
optimized_urls.detail_1440 -> optimizedUrls.detail1440
optimized_urls.original    -> optimizedUrls.original
```

## Guardrails

```text
Do not require optimizedUrls for rendering.
Do not break existing publicUrl media.
Do not enable imgproxy globally until backend + Caddy are verified.
Do not load original images in feed once optimized variants are returned.
```

## Next step

Backend social/media responses should include `optimized_urls` when `SPARK_MEDIA_OPTIMIZER_ENABLED=true` and imgproxy is live.
