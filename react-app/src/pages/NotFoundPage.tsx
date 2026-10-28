import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage(): ReactElement {
  useDocumentTitle('Page not found | EDABIP');

  return (
    <section className="card not-found" aria-labelledby="not-found-title">
      <p className="not-found__code" aria-hidden="true">
        404
      </p>
      <h1 id="not-found-title">Page not found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link className="btn btn--primary" to="/">
        Back to Analytics
      </Link>
    </section>
  );
}
