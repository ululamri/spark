# Pass 68G — One-Domain Spark + Hub Topology

Karyra Spark beta keeps one public domain first:

- `/` serves Spark.
- `/hub` serves Hub.
- `/api` remains available for Spark API when the unified reverse proxy is ready.

This pass prepares Spark frontend topology so Hub links can point to `/hub` without requiring a subdomain.

## Runtime rule

For beta/staging, use:

```env
PUBLIC_SPARK_HUB_URL=/hub
```

An absolute URL is still supported:

```env
PUBLIC_SPARK_HUB_URL=https://spark.user.cloudjkt01.com/hub
```

`getHubUrl('/')` must resolve to `/hub` or `https://spark.user.cloudjkt01.com/hub`.

`getHubUrl('/resources')` must resolve to `/hub/resources` or `https://spark.user.cloudjkt01.com/hub/resources`.

## Why this matters

Spark, Spark API, and Hub now live in separate repositories, but beta deployment can still use one domain. Domain/subdomain separation can happen later when production is ready.
