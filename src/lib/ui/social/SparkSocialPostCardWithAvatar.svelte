<script lang="ts">
  import SparkSocialPostCard from './SparkSocialPostCard.svelte';
  import { getSocialProfile } from '$lib/social/social-model';
  import type { SocialPost } from '$lib/social/social-types';

  type Props = { post: SocialPost };
  let { post }: Props = $props();

  const author = $derived(getSocialProfile(post.authorId));
  const avatarSrc = $derived(
    author?.avatarOptimizedUrls?.avatar64 ?? 
    author?.avatarOptimizedUrls?.avatar128 ?? 
    author?.avatarUrl
  );
</script>


<div class="avatar-card-wrap" class:hasAvatar={Boolean(avatarSrc)} style={`--avatar-url: url('${avatarSrc ?? ''}')`}>
  <SparkSocialPostCard {post} />
</div>

<style>
  .avatar-card-wrap.hasAvatar :global(.social-post-card > .post-head > .avatar) {
    color: transparent;
    background-image: var(--avatar-url);
    background-size: cover;
    background-position: center;
  }
</style>
