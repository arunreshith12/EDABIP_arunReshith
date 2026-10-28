import { useId, useRef, useState } from 'react';
import type { FormEvent, ReactElement } from 'react';
import { MODEL_STATUSES, MODEL_TYPES } from '../../constants';
import type { MlModel, ModelFormErrors, ModelFormValues, SelectOption } from '../../types';
import { buildModel, toFormValues } from '../../utils/models';
import { hasErrors, validateModel } from '../../utils/validators';
import { SelectField, TextField } from '../ui/FormFields';

const TYPE_OPTIONS: readonly SelectOption[] = MODEL_TYPES.map(type => ({ value: type, label: type }));
const STATUS_OPTIONS: readonly SelectOption[] = MODEL_STATUSES.map(status => ({ value: status, label: status }));
/** Field order, used to focus the first invalid field. */
const FIELD_ORDER: readonly (keyof ModelFormValues)[] = ['name', 'type', 'accuracy', 'status', 'progress'];

interface ModelFormProps {
  /** The model being edited, or null when adding a new one. */
  editing: MlModel | null;
  /** All models, so the validator can reject duplicate names. */
  models: readonly MlModel[];
  onSubmit: (model: MlModel) => void;
  onCancel: () => void;
}

export function ModelForm({ editing, models, onSubmit, onCancel }: ModelFormProps): ReactElement {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<ModelFormValues>(() => toFormValues(editing));
  const [errors, setErrors] = useState<ModelFormErrors>({});

  // update one field and clear its error as soon as the user starts fixing it
  const setField = (field: keyof ModelFormValues, value: string): void => {
    setValues(current => ({ ...current, [field]: value }));
    setErrors(current => {
      if (current[field] === undefined) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const focusField = (field: keyof ModelFormValues): void => {
    const element = formRef.current?.elements.namedItem(field);
    if (element instanceof HTMLElement) element.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const found = validateModel(values, models, editing?.id ?? null);
    setErrors(found);
    if (hasErrors(found)) {
      const firstInvalid = FIELD_ORDER.find(field => found[field] !== undefined);
      if (firstInvalid !== undefined) focusField(firstInvalid);
      return;
    }

    const model = buildModel(values, editing);
    if (model !== null) onSubmit(model);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <TextField
        id={`${uid}-name`}
        name="name"
        label="Model name"
        value={values.name}
        onChange={value => setField('name', value)}
        error={errors.name}
        maxLength={40}
      />
      <SelectField
        id={`${uid}-type`}
        name="type"
        label="Type"
        value={values.type}
        onChange={value => setField('type', value)}
        error={errors.type}
        options={TYPE_OPTIONS}
        placeholder="Select type"
      />
      <TextField
        id={`${uid}-accuracy`}
        name="accuracy"
        label="Accuracy %"
        optional
        value={values.accuracy}
        onChange={value => setField('accuracy', value)}
        error={errors.accuracy}
        inputMode="decimal"
        placeholder="e.g. 93.5"
      />
      <SelectField
        id={`${uid}-status`}
        name="status"
        label="Status"
        value={values.status}
        onChange={value => setField('status', value)}
        error={errors.status}
        options={STATUS_OPTIONS}
      />
      {values.status === 'Training' && (
        <TextField
          id={`${uid}-progress`}
          name="progress"
          label="Training progress %"
          value={values.progress}
          onChange={value => setField('progress', value)}
          error={errors.progress}
          inputMode="numeric"
          placeholder="0 – 100"
        />
      )}

      <div className="dialog-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          Save model
        </button>
      </div>
    </form>
  );
}
