// Pure validation for the login form. Messages are shown under the fields.
// Only the shape is checked here: password strength rules belong to sign-up, and the server decides who may log in.

import type { LoginErrors, LoginValues } from '../types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};
  const email = values.email.trim();

  if (email === '') errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address, for example name@company.com.';

  if (values.password === '') errors.password = 'Password is required.';
  return errors;
}

export const hasErrors = (errors: LoginErrors): boolean => Object.keys(errors).length > 0;
