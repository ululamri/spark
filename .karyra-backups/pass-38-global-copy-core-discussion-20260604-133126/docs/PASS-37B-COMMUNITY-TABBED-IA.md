# Pass 37B — Community Tabbed IA & Discussion Placement

Pass 37B repositions the Pass 37 discussion/social layer so Community remains the home for workshop, cohort, and interaction without stacking every feature vertically on one mobile screen.

## Product decision

Community stays as the parent surface.

Discussion is not moved to a separate `/discuss` route. Instead, `/community` becomes a tabbed community mini-app:

- Ringkasan
- Workshop
- Cohort
- Diskusi

This keeps the kaidah product intact: community is where people meet, discuss, coordinate, and join local activities.

## Implementation

Updated files:

- `src/routes/community/+page.svelte`
- `src/lib/ui/SparkCommunityCommandCenter.svelte`

New files:

- `src/lib/ui/SparkCommunityTabbedSurface.svelte`
- `scripts/karyra-pass37b-community-tabs-audit.mjs`
- `docs/PASS-37B-COMMUNITY-TABBED-IA.md`

## Deep links

Supported query state:

- `/community` or `/community?tab=ringkasan`
- `/community?tab=workshop#community-tabs`
- `/community?tab=cohort#community-tabs`
- `/community?tab=diskusi#community-tabs`

Legacy query aliases accepted by the tab component:

- `workshops` -> `workshop`
- `cohorts` -> `cohort`
- `discuss`, `discussion`, `feed` -> `diskusi`

## Why tabbed IA

The first Pass 37 version placed the full discussion layer directly above workshops and cohorts. Technically it worked, but on mobile it competed with core Community features.

Tabbed IA makes the user choose a mode. It prevents Diskusi from dominating Workshop and Cohort, while still keeping Diskusi visible and semantically inside Community.

## Next pattern

If this pattern feels good, it can be reused later for Core/Learn pages:

- Ringkasan
- Jalur Belajar
- Lesson
- Diskusi
- Resource

The principle is the same: do not stack every major feature vertically on mobile.
