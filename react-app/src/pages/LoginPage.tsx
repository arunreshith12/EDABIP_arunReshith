// Sign-in page. It calls POST /auth/login through src/api/auth.ts, shows the server's
// message for a failed login, and puts 422 field errors under the right field.

import { useId, useState } from 'react';
import type { FormEvent, ReactElement } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { ApiError } from '../api/errors';
import { TextField } from '../components/ui/FormFields';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { LoginErrors, LoginValues } from '../types';
import { errorMessage, isRecord } from '../utils/guards';
import { hasErrors, validateLogin } from '../utils/validators';

/** Where to go after signing in: the page that sent the user here, or the dashboard. */
function targetAfterLogin(state: unknown): string {
  return isRecord(state) && typeof state.from === 'string' && state.from.startsWith('/') ? state.from : '/';
}

export function LoginPage(): ReactElement {
  useDocumentTitle('Sign in | EDABIP');
  const uid = useId();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, sessionExpired } = useAuth();

  const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isSignedIn) return <Navigate to={targetAfterLogin(location.state)} replace />;

  const setField = (field: keyof LoginValues, value: string): void => {
    setValues(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const found = validateLogin(values);
    setErrors(found);
    setFormError(null);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      await login(values);
      void navigate(targetAfterLogin(location.state), { replace: true });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 422) {
        setErrors({ email: error.fieldErrors.email, password: error.fieldErrors.password });
      }
      setFormError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login">
      <form className="card login__card" onSubmit={event => void handleSubmit(event)} noValidate aria-labelledby={`${uid}-title`}>
        <h1 id={`${uid}-title`}>Sign in to Analytics</h1>
        {sessionExpired && (
          <p className="login__notice" role="status">
            Your session has expired. Please sign in again.
          </p>
        )}

        <TextField
          id={`${uid}-email`}
          name="email"
          label="Email"
          type="email"
          autoComplete="username"
          value={values.email}
          onChange={value => setField('email', value)}
          error={errors.email}
        />
        <TextField
          id={`${uid}-password`}
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={value => setField('password', value)}
          error={errors.password}
        />

        {formError !== null && (
          <p className="login__error" role="alert">
            {formError}
          </p>
        )}

        <button type="submit" className="btn btn--primary login__submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
