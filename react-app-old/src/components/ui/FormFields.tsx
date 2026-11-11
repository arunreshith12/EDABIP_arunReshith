// Controlled form fields. Each one shows its own label and error message and
// wires up aria-invalid / aria-describedby so screen readers read the error.

import type { ChangeEvent, ReactElement } from 'react';
import type { SelectOption } from '../../types';

interface FieldBaseProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  optional?: boolean;
}

interface TextFieldProps extends FieldBaseProps {
  inputMode?: 'text' | 'decimal' | 'numeric';
  placeholder?: string;
  maxLength?: number;
}

interface SelectFieldProps extends FieldBaseProps {
  options: readonly SelectOption[];
  placeholder?: string;
}

interface FieldShellProps {
  id: string;
  label: string;
  optional: boolean;
  error: string | undefined;
  children: ReactElement;
}

function FieldShell({ id, label, optional, error, children }: FieldShellProps): ReactElement {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {optional && <span className="optional"> (optional)</span>}
      </label>
      {children}
      <p className="field-error" id={`${id}-error`}>
        {error}
      </p>
    </div>
  );
}

export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  optional = false,
  inputMode = 'text',
  placeholder,
  maxLength
}: TextFieldProps): ReactElement {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => onChange(event.target.value);
  const invalid = error !== undefined && error !== '';

  return (
    <FieldShell id={id} label={label} optional={optional} error={error}>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={handleChange}
        inputMode={inputMode}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        className={invalid ? 'is-invalid' : undefined}
        aria-invalid={invalid}
        aria-describedby={`${id}-error`}
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  optional = false,
  options,
  placeholder
}: SelectFieldProps): ReactElement {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => onChange(event.target.value);
  const invalid = error !== undefined && error !== '';

  return (
    <FieldShell id={id} label={label} optional={optional} error={error}>
      <select
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        className={invalid ? 'is-invalid' : undefined}
        aria-invalid={invalid}
        aria-describedby={`${id}-error`}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
