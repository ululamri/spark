# Pass 37 Social Layer Backend Contract

This document describes the backend path for the local-first diskusi komunitas.

## Core entities

```text
social_profiles
social_posts
social_comments
social_reactions
social_follows
social_reports
social_events
```

## Suggested Postgres schema

```sql
create table social_profiles (
  id text primary key,
  user_id text unique,
  display_name text not null,
  handle text not null unique,
  role text not null check (role in ('learner','facilitator','mentor','spark')),
  bio text,
  location text,
  trusted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table social_posts (
  id text primary key,
  author_id text not null references social_profiles(id),
  kind text not null check (kind in ('progress','question','resource','workshop','lab')),
  body text not null,
  tags text[] not null default '{}',
  visibility text not null default 'community' check (visibility in ('community','followers','public')),
  status text not null default 'active' check (status in ('active','hidden','reported','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table social_comments (
  id text primary key,
  post_id text not null references social_posts(id) on delete cascade,
  author_id text not null references social_profiles(id),
  body text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table social_reactions (
  post_id text not null references social_posts(id) on delete cascade,
  profile_id text not null references social_profiles(id),
  reaction text not null check (reaction in ('support','helpful','inspiring')),
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table social_follows (
  follower_id text not null references social_profiles(id),
  followed_id text not null references social_profiles(id),
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

create table social_reports (
  id text primary key,
  reporter_id text not null references social_profiles(id),
  target_type text not null check (target_type in ('post','comment','profile')),
  target_id text not null,
  reason text not null,
  note text,
  status text not null default 'open' check (status in ('open','reviewed','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create table social_events (
  id text primary key,
  kind text not null,
  actor_id text not null references social_profiles(id),
  target_id text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

## REST API contract

```text
GET    /api/social/feed?filter=all&cursor=<cursor>
POST   /api/social/posts
POST   /api/social/posts/:postId/reactions
DELETE /api/social/posts/:postId/reactions
POST   /api/social/posts/:postId/comments
POST   /api/social/posts/:postId/share
POST   /api/social/follows/:profileId
DELETE /api/social/follows/:profileId
POST   /api/social/reports
GET    /api/social/events
POST   /api/social/events/read
```

## Event contract

```json
{
  "id": "evt_...",
  "kind": "comment.created",
  "actorId": "profile_...",
  "targetId": "post_...",
  "createdAt": "2026-06-04T00:00:00.000Z",
  "title": "Komentar baru",
  "copy": "Seseorang menanggapi post kamu.",
  "href": "/community#post_..."
}
```

## Backend implementation paths

### Path A: SvelteKit API routes + Postgres
Good for first production backend. Keep gateway simple and colocated.

### Path B: Rust/Axum API + Postgres
Good for stronger long-term backend and Starknet account abstraction showcase.

### Path C: Supabase prototype
Fast for prototyping auth/database/realtime, but avoid locking UI to Supabase client directly. Use `social-gateway.ts` adapter.

### Path D: Realtime layer
Start with polling or SSE. Upgrade to WebSocket/Socket.IO/NATS/Redis Streams only when activity volume justifies it.

## Moderation baseline

- Reject secret leaks and obvious private key/seed phrase sharing.
- Add report queue.
- Add hide/mute controls client-side.
- Keep media upload disabled until moderation pipeline exists.
- Rate limit `createPost`, `comment`, and `reaction` server-side.

## Migration from local-first

1. Keep current UI components.
2. Add `rest-social-gateway.ts` implementing the same functions as `local-social-gateway.ts`.
3. Use TanStack Query or SvelteKit load/actions for feed fetch and mutations.
4. Sync local drafts/events to server after login.
5. Keep local event log as offline queue.
