/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL the API layer loads data from (see src/api/client.ts). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
