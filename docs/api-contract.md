# Analytics API contract

**Status: PROPOSAL from the frontend (Arun Reshith). Not yet agreed with Unnikrishnan S (Data Engineer, unnikrishnans@thestackly.com).**
Any change must be agreed in the squad chat before it is coded. The frontend and the mock API (`react-app/mock-api`) follow this file exactly.

Base URL: `http://localhost:8000` (frontend env var `VITE_API_BASE_URL`). CORS must allow `http://localhost:5173` and the `Authorization` and `Content-Type` headers (including the OPTIONS preflight).

## Authentication
All `/analytics/*` calls need `Authorization: Bearer <token>`. Missing, invalid or expired token → `401` and the frontend goes back to the login page.

### POST /auth/login
Request: `{ "email": "demo@edabip.test", "password": "..." }`
200: `{ "access_token": "<jwt>", "token_type": "bearer" }`
401: `{ "detail": "Invalid email or password" }` (same message whether email or password is wrong)
422: validation errors (see Errors).
Uses the Squad 1 login endpoint, or the Analytics API's own login if Squad 1 is not ready.

## GET /analytics/metrics?range=7|30|90
`range` = days; default 30. Values are percentages (92.0 = 92.0%). `change` is the difference versus the previous period of the same length, in percentage points. `trend` is optional (≥2 numbers for the small chart).
```json
{
  "range": 30,
  "generated_at": "2026-11-10T08:00:00Z",
  "metrics": [
    { "key": "accuracy", "label": "Model Accuracy", "unit": "percent", "value": 92.0,
      "change": 0.5, "change_unit": "percent", "trend": [0.89, 0.9, 0.91, 0.92] }
  ]
}
```
Keys, in order: `accuracy`, `precision`, `recall`, `f1`. `unit`: `percent` | `ratio`. `change_unit`: `percent` | `absolute` | null. `change` may be null.

## GET /analytics/revenue-forecast?months=3|6|12
`months` = how many months of **actual** revenue; default 6. The response also contains the forecast months, labelled `kind: "forecast"`. `month` is `YYYY-MM`, `value` is in `currency`.
```json
{
  "currency": "USD",
  "generated_at": "2026-11-10T08:00:00Z",
  "method": { "name": "Linear trend", "description": "Least-squares line fitted to the actual months, extended 3 months." },
  "points": [
    { "month": "2026-10", "value": 245000, "kind": "actual" },
    { "month": "2026-11", "value": 251000, "kind": "forecast" }
  ]
}
```

## GET /analytics/demand-prediction
No parameters. The next 7 days, each the same-weekday average of recent weeks.
```json
{
  "generated_at": "2026-11-10T08:00:00Z",
  "method": { "name": "Same-weekday average", "description": "Average demand on the same weekday over the last 4 weeks." },
  "days": [ { "date": "2026-11-11", "predicted_demand": 65000 } ]
}
```

## GET /analytics/models?page=1&size=10
Pagination: `page` ≥ 1, `size` 1–100. Read-only (no create, edit or delete). The frontend reads all pages with `size=100` and filters/sorts in the browser.
```json
{
  "items": [
    { "id": 3, "name": "Demand Planner", "type": "Forecasting", "accuracy": 89.5,
      "status": "Training 75%", "version": "v1.9", "updated_at": "2026-11-09T08:00:00Z" }
  ],
  "total": 6, "page": 1, "size": 10
}
```
`status`: `Active`, `Pending` or `Training NN%`. `accuracy`, `version`, `updated_at` may be null. `id` may be a number or a string.

## Errors
| Status | Body | Frontend behaviour |
|---|---|---|
| 401 | `{"detail": "Not authenticated"}` | clears token, back to login ("session expired") |
| 403 | `{"detail": "..."}` | error message with Retry |
| 422 | `{"detail": [{"loc": ["query","range"], "msg": "...", "type": "..."}]}` | message + per-field errors |
| 5xx | `{"detail": "..."}` | error message with Retry |

## Open questions for Unnikrishnan
1. Is `metrics.value` a percent (92.0) or a ratio (0.92)? This contract says percent with `unit`.
2. Revenue: `months` = actual months only, forecast is always +3. OK?
3. Demand has no range parameter, so the second dropdown from the Figma was removed. OK?
4. Is the registry read-only for good (no roles needed)?
5. Where does `/auth/login` live?
