

EDABIP Analytics (React + TypeScript + Vite) — Task 4

The Analytics screen from Task 3, now fed by the Analytics API. Only src/api/ and the VITE_API_BASE_URL env var know the API exists; components receive typed UI data.

Status (11 Nov)
Frontend is finished and tested against a mock API that follows docs/api-contract.md (Unnikrishnan was not available, so the contract is still a proposal and not yet agreed).
Done: login with Bearer token, metric cards, revenue and demand charts (forecast shown dashed and labelled), sortable/filterable registry, tooltips, date-range dropdown calling the API, loading / empty / error / 401 states.
Next: agree the contract with Unnikrishnan, run against his real API, fix any field differences in src/api/mappers.ts, cross-review each other's repos, joint demo.
Run
bash
npm install
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:8000
npm run dev              # http://localhost:5173
npm run mock-api         # optional stand-in API on :8000 (login demo@edabip.test / Demo@1234)
npm test                 # 25 tests incl. contract checks against the mock
npm run lint && npm run build
Integration
Partner: Unnikrishnan S (Data Engineer) — backend / Snowflake Analytics API
Partner repo: add link here
Run both together: start the API on http://localhost:8000 (CORS must allow http://localhost:5173), then npm run dev here, sign in at /login.
Contract: ../docs/api-contract.md (also copy to docs/api-contract.md in this repo when it becomes its own repo). Currently a proposal pending agreement in the squad chat.
Integration log: ../docs/integration-log.md
What comes from the API
UI	Endpoint
Four metric cards (+ date range dropdown ?range=7/30/90)	GET /analytics/metrics
Revenue chart (actual solid, forecast dashed, method note; period ?months=)	GET /analytics/revenue-forecast
Demand chart (next 7 days)	GET /analytics/demand-prediction
ML Model Registry (search, type filter, sort, View) and notifications	GET /analytics/models

Loading, empty, error (with Retry) and 401 (back to login) states are handled. The registry is read-only because the API has no write endpoints, so there are no role-based buttons. The demand chart's period dropdown was removed because the endpoint has no range.

Structure

src/api (client, dto, mappers, analytics, auth, tokenStore) · src/components · src/hooks · src/utils · mock-api (stand-in server) · docs.
