/** Every failure of the API layer is an ApiError, so the UI only has one kind of error to show. */
export class ApiError extends Error {
  /** HTTP status, or 0 when the API could not be reached at all. */
  readonly status: number;
  /** Per-field messages from a 422 response, keyed by field name (e.g. "email"). */
  readonly fieldErrors: Readonly<Record<string, string>>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}
