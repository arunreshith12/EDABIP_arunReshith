// Login. This follows the Squad 1 (Authentication) contract: POST /auth/login.
// The token is kept by tokenStore.ts and sent by client.ts as "Authorization: Bearer <token>".

import type { LoginValues } from '../types';
import { request } from './client';
import { asRecord, asString } from './parse';
import { setToken } from './tokenStore';

export async function login(values: LoginValues): Promise<void> {
  const body = asRecord(
    await request('/auth/login', { method: 'POST', body: { email: values.email.trim(), password: values.password }, auth: false }),
    'response'
  );
  setToken(asString(body.access_token, 'access_token'));
}
