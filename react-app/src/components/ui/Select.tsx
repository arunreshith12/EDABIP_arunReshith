import type { ChangeEvent, ReactElement } from 'react';
import type { IconName, SelectOption } from '../../types';
import { Icon } from './Icon';

interface SelectProps<V extends string> {
  /** Accessible name (visually hidden, like the label in the design). */
  label: string;
  value: V;
  options: readonly SelectOption<V>[];
  onChange: (value: V) => void;
  icon?: IconName;
  variant?: 'default' | 'outline';
}

export function Select<V extends string>({
  label,
  value,
  options,
  onChange,
  icon,
  variant = 'default'
}: SelectProps<V>): ReactElement {
  // Look the value up in `options` instead of casting, so `onChange` always gets a valid V.
  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const match = options.find(option => option.value === event.target.value);
    if (match !== undefined) onChange(match.value);
  };

  const className = ['select', icon ? 'select--icon' : '', variant === 'outline' ? 'select--outline' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <label className={className}>
      <span className="sr-only">{label}</span>
      {icon !== undefined && <Icon name={icon} className="select__lead" />}
      <select value={value} onChange={handleChange}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
