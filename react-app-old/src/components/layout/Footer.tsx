import type { ReactElement } from 'react';

export function Footer(): ReactElement {
  return (
    <footer className="footer">
      <p>© 2026 EDABIP. All rights reserved. Enterprise Data Analytics &amp; Business Intelligence Platform</p>
      <nav aria-label="Footer">
        <a href="#main">Privacy Policy</a>
        <span aria-hidden="true">·</span>
        <a href="#main">Terms</a>
        <span aria-hidden="true">·</span>
        <a href="#main">Help &amp; Support</a>
        <span className="version">v2.1.0</span>
      </nav>
    </footer>
  );
}
