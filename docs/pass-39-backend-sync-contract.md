# Pass 39 — Backend Sync Contract Draft

## Event envelope

```ts
type SyncEvent = {
  id: string;
  name: SyncEventName;
  entity: SyncEntity;
  action: string;
  subjectId?: string;
  payload?: Record<string, unknown>;
  source: 'local' | 'backend' | 'migration';
  status: 'queued' | 'synced' | 'failed' | 'ignored';
  attempts: number;
  createdAt: string;
  updatedAt: string;
  schemaVersion: 1;
};
```

## REST endpoints masa depan

```txt
POST /api/sync/events
GET  /api/sync/snapshot
POST /api/sync/resolve
DELETE /api/local-cache
```

## Event awal

```txt
learning.lesson.completed
learning.mode.changed
learning.note.changed
learning.bookmark.toggled
lab.simulation.completed
community.workshop.saved
community.cohort.joined
hub.resource.saved
social.post.created
social.comment.created
social.reaction.toggled
social.follow.toggled
social.post.hidden
social.post.reported
social.post.shared
message.notification.read
message.message.read
profile.passport.updated
settings.preference.changed
system.local.reset
```

## Tabel backend awal

```sql
users
learning_progress
learning_notes
learning_bookmarks
lab_runs
workshop_registrations
hub_saved_resources
social_posts
social_comments
social_reactions
social_follows
social_reports
notification_reads
sync_events
```

## Conflict policy awal

- Learning completion: idempotent by `(user_id, lesson_slug)`.
- Notes: last-write-wins dengan `updated_at`, lalu audit log disimpan.
- Social post/comment: server canonical ID setelah sync.
- Reaction: upsert by `(user_id, post_id)`.
- Notification read: monotonic, read tidak kembali unread kecuali user action eksplisit.
- Reset lokal: tidak menghapus server.
- Reset server: endpoint berbeda, butuh auth kuat dan konfirmasi eksplisit.
