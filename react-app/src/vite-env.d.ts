/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL the API layer loads data from (see src/api/client.ts). */
  readonly VITE_API_BASE_URL?: string;
  /** "false" skips the login page (for an API that needs no token). Default: login required. */
  readonly VITE_REQUIRE_LOGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
