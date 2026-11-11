import type { ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/auth/RequireAuth';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * /login          sign-in page
 * /               the dashboard (needs a token: RequireAuth sends you to /login otherwise)
 * anything else   not-found page
 */
export function App(): ReactElement {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route element={<RequireAuth />}>
          <Route index element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
