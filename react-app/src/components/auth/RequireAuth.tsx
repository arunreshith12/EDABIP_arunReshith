import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { REQUIRE_LOGIN } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import type { LayoutContext } from '../../types';

/** Route guard: no token (never signed in, signed out, or expired after a 401) means back to /login. */
export function RequireAuth(): ReactElement {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const context = useOutletContext<LayoutContext>(); // handed on to the page below

  if (REQUIRE_LOGIN && !isSignedIn) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet context={context} />;
}
