# EDABIP Analytics – React + TypeScript (Task 3)

The same screen as the HTML/CSS/JS version in the parent folder, rebuilt with
React 19, TypeScript (strict) and Vite. No UI component libraries; the CSS from
Task 2 is reused as plain CSS files in `src/styles/`.

## Run it

```bash
cd react-app
npm install
npm run dev        # http://localhost:5173
npm run lint       # ESLint
npm run build      # type-check (tsc -b) + production build
```

## Environment variable

`VITE_API_BASE_URL` (see `.env.example`) is the folder / URL the data is loaded from.
Today it is `/data`, which Vite serves from `public/data/*.json`.
To use a real backend later, change this value (and the file names inside `src/api/`) – nothing else.

## Structure

```
public/data/        JSON files (metrics, revenue, demand, models, notifications)
src/api/            typed fetch functions – the ONLY code that knows where data comes from
src/types/          interfaces and types for all data
src/hooks/          useFetch, useLocalStorage, useModels (useReducer), useTooltip, useToast, useNow
src/reducers/       modelsReducer (load / add / update / remove)
src/utils/          validators, formatting, storage (try/catch), CSV, chart maths
src/components/
  layout/           Layout (shared wrapper), Topbar, SearchBox, NotificationsMenu, Footer
  dashboard/        PageHeader, WelcomeCard, StatCard, MetricsSection, ChartCard, Revenue/Demand cards
  charts/           LineChart, BarChart, Sparkline, ChartAxes
  registry/         ModelRegistry, ModelForm, ModelDetails
  common/           DataTable (generic), AsyncContent, ConfirmDialog
  ui/               Icon, Select, Modal, Tooltip, Toast, StatePanel, FormFields
src/pages/          DashboardPage, NotFoundPage
```

## Routes

| Path | Page |
| ---- | ---- |
| `/` | Analytics dashboard |
| anything else | Not found page |

Both render inside the same `Layout`.
