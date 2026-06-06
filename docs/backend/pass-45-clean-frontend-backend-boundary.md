# Frontend / Backend Boundary

Spark frontend remains in `~/spark`.
Spark backend lives separately in `~/spark-api`.

The frontend should treat backend APIs as external service calls through `VITE_SPARK_API_BASE_URL`.

Recommended local value:

```env
VITE_SPARK_API_BASE_URL=http://127.0.0.1:8787
```

Do not re-add `services/api` into the frontend repository. Backend work belongs in the separate Rust/Axum workspace.
