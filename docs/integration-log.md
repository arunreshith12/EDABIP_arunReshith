# Integration log (Analytics squad)

Three problems hit while connecting. Items 1–3 were found on the frontend side while building against the contract/mock; add anything new from the real API below.

1. **Field names / shapes differ from the Task 3 data.** The old static data had one value per range and a status + progress pair; the API has value + change vs previous period, and a single string "Training 75%". Fix: all conversion lives in `src/api/mappers.ts`; each bad field is reported by exact name; components never see API JSON.
2. **CORS and network failure.** A browser blocks calls when the API does not allow `http://localhost:5173` or the `Authorization` header. `fetch` only says "Failed to fetch". Fix: `client.ts` turns it into "Cannot reach the API… CORS" (status 0), and the mock server sends the right headers incl. OPTIONS.
3. **Token expiry (401).** Several requests fail at once when a token expires. Fix: `tokenStore.clearToken('expired')` reacts only to the first one; `RequireAuth` redirects to `/login` and the login page explains the session expired.

Real-API problems (fill in after the joint run): _TBD_
