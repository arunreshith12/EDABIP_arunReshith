import type { ReactElement, ReactNode } from 'react';
import type { IconName } from '../../types';

// All icons are inline SVG paths drawn for this project (no icon library).
const ICON_PATHS: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  bell: (
    <>
      <path d="M6 17V11a6 6 0 0 1 6-6M18 11v6M4 17h16M10 20.5h4" />
      <circle cx="18" cy="6" r="2" className="fill" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4M8 13.5h2M13 13.5h2" />
    </>
  ),
  refresh: <path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" />,
  export: <path d="M7 3h7l4 4v14H7zM14 3v4h4M10.5 14.5l2-2 2 2M12.5 12.5V18" />,
  history: <path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4h4M12 8v4l3 2" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="M7 10l5 5 5-5" />,
  bars: <path d="M5 20V10M10 20V4M15 20v-7M20 20V8" />,
  trend: <path d="M4 18l5-6 4 3 7-9M4 20h16" />,
  gauge: (
    <>
      <path d="M4 17a8 8 0 1 1 16 0M12 17l4-5" />
      <circle cx="12" cy="17" r="1.2" className="fill" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M9.5 5l2.5 2 2.5-2M12 10v6M10 11.5h3.2a1.2 1.2 0 0 1 0 2.4H10.8a1.2 1.2 0 0 0 0 2.4H14" />
    </>
  ),
  up: <path d="M4 17l6-6 4 4 6-8M15 7h5v5" />,
  down: <path d="M4 7l6 6 4-4 6 8M15 17h5v-5" />
};

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className }: IconProps): ReactElement {
  return (
    <svg className={className === undefined ? 'icon' : `icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  );
}
