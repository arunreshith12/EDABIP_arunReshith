import { useEffect, useId, useRef } from 'react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { Icon } from '../ui/Icon';

interface SearchBoxProps {
  query: string;
  onQueryChange: (query: string) => void;
}

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement;

export function SearchBox({ query, onQueryChange }: SearchBoxProps): ReactElement {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // pressing "/" anywhere (outside a form field) jumps to the search box
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === '/' && !isTypingTarget(event.target)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => onQueryChange(event.target.value);
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => event.preventDefault();
  const handleClear = (): void => {
    onQueryChange('');
    inputRef.current?.focus();
  };

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="sr-only">
        Search models
      </label>
      <Icon name="search" className="search__icon" />
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        placeholder="Search"
        autoComplete="off"
        value={query}
        onChange={handleChange}
      />
      <button type="button" className="search__clear" aria-label="Clear search" onClick={handleClear}>
        <Icon name="close" />
      </button>
    </form>
  );
}
