# Karyra Admin CMS

## Purpose

Admin CMS is the private operational layer for structured Karyra Spark learning content. It is separate from `ksbuilder`, which owns public website copy, CTA, and web-builder surfaces.

## Scope

Current backend foundation supports two CMS kinds:

| Kind | Purpose |
| --- | --- |
| `core_lesson` | Learn/Core lessons imported from the current source-controlled Spark catalog |
| `lab` | Safe Practice Lab modules imported from the current source-controlled Spark catalog |

Future CMS expansion may add glossary, resource, checkpoint, and prerequisite models, but these are intentionally kept inside the structured learning/admin system rather than the public web builder.

## Workflow

Every CMS item has:

- stable `kind` and `slug`;
- lifecycle status: `draft`, `review`, `published`, or `archived`;
- immutable revisions in `admin_cms_revisions`;
- current revision pointer on `admin_cms_items`;
- publish/archive events in `admin_cms_publish_events`;
- audit events in `admin_audit_events` for admin actions.

## Current source import

PASS 17D seeds the current `src/lib/content/spark-content.ts` catalog into Admin CMS using a database migration:

```txt
migrations/202606170007_seed_cms_from_spark_content.sql
```

The import is additive and non-destructive. Existing CMS items are not overwritten. On the current catalog it seeds:

- 7 `core_lesson` items;
- 3 `lab` items.

Seeded content is marked as published revision `1` with `source = spark-content.ts` in the JSON payload/metadata.

## Admin API

Backend routes:

```txt
GET  /api/admin/cms/scope
GET  /api/admin/cms/items
POST /api/admin/cms/items
GET  /api/admin/cms/items/:item_id
POST /api/admin/cms/items/:item_id/revisions
POST /api/admin/cms/items/:item_id/publish
POST /api/admin/cms/items/:item_id/archive
```

## Authorization

The legacy superadmin root can access all CMS routes through the server-side admin token. Delegated user-based roles require capabilities:

| Action | Capability |
| --- | --- |
| List/read CMS items | `content_read` |
| Create item | `content_create` |
| Create revision | `content_edit` |
| Publish item | `content_publish` |
| Archive item | `content_archive` |

## Deployment check

```bash
curl -s https://spark.user.cloudjkt01.com/api/admin/cms/scope \
  -H "x-karyra-admin-token: $KARYRA_ADMIN_TOKEN" | head

curl -s https://spark.user.cloudjkt01.com/api/admin/cms/items \
  -H "x-karyra-admin-token: $KARYRA_ADMIN_TOKEN" | head
```

Expected after PASS 17D seed: CMS items list should include source-imported `core_lesson` and `lab` items.

## Boundary

Admin CMS is not a public route and does not replace the learner UI yet. It prepares backend data, revisions, publish state, and auditability before the Admin CMS UI pass.
