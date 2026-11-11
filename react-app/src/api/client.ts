// The ONLY place that talks HTTP. It adds the Bearer token, turns every failure
// into an ApiError with a readable message, and reacts to 401 (expired or missing token).
// To point the app at another server, change VITE_API_BASE_URL.

import { isRecord } from '../utils/guards';
import { ApiError } from './errors';
import { clearToken, getToken } from './tokenStore';

export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/+$/, '');

export interface RequestOptions {
  method?: 'GET' | 'POST';
  /** Query string values. `undefined` values are left out. */
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  /** false for calls that do not use the token (login). Default true. */
  auth?: boolean;
}

interface Problem {
  message: string | null;
  fieldErrors: Record<string, string>;
}

const STATUS_MESSAGES: Readonly<Record<number, string>> = {
  400: 'The request was not accepted by the server.',
  403: 'You do not have permission to see this data.',
  404: 'That data was not found on the server.',
  422: 'Some values were not accepted by the server.',
  429: 'Too many requests. Please wait a moment and try again.'
};

function buildUrl(path: string, params: RequestOptions['params']): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) query.set(key, String(value));
  }
  const text = query.toString();
  return `${API_BASE_URL}${path}${text === '' ? '' : `?${text}`}`;
}

/** Reads the error body. Supports { detail: "text" } and the FastAPI 422 list { detail: [{ loc, msg }] }. */
function readProblem(body: unknown): Problem {
  const problem: Problem = { message: null, fieldErrors: {} };
  if (!isRecord(body)) return problem;

  const { detail } = body;
  if (typeof detail === 'string') {
    problem.message = detail;
  } else if (Array.isArray(detail)) {
    for (const entry of detail) {
      if (!isRecord(entry) || typeof entry.msg !== 'string') continue;
      const loc = Array.isArray(entry.loc) ? entry.loc : [];
      const field = loc[loc.length - 1];
      if (typeof field === 'string' && problem.fieldErrors[field] === undefined) problem.fieldErrors[field] = entry.msg;
      problem.message ??= entry.msg;
    }
  } else if (typeof body.message === 'string') {
    problem.message = body.message;
  }
  return problem;
}

async function readBody(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export async function request(path: string, options: RequestOptions = {}): Promise<unknown> {
  const { method = 'GET', params, body, auth = true } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = auth ? getToken() : null;
  if (token !== null) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    // fetch only throws when no response came back: server down, wrong URL, or CORS blocked it
    throw new ApiError(
      `Cannot reach the API at ${API_BASE_URL}. Check that it is running and that its CORS settings allow this page.`,
      0
    );
  }

  if (response.ok) {
    if (response.status === 204) return undefined;
    try {
      return (await response.json()) as unknown;
    } catch {
      throw new ApiError('The API answered with something that is not JSON.', 502);
    }
  }

  const problem = readProblem(await readBody(response));

  if (response.status === 401) {
    if (auth) {
      clearToken('expired'); // RequireAuth sees the missing token and goes to the login page
      throw new ApiError('Your session has expired. Please sign in again.', 401);
    }
    // Login itself failed. Show the server's wording; it must not say which part was wrong.
    throw new ApiError(problem.message ?? 'Incorrect email or password.', 401);
  }

  const fallback = response.status >= 500 ? 'The server had a problem. Please try again.' : undefined;
  throw new ApiError(
    problem.message ?? STATUS_MESSAGES[response.status] ?? fallback ?? `Request failed (${response.status}).`,
    response.status,
    problem.fieldErrors
  );
}
