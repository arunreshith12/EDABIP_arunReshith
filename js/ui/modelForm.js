// Add / edit form: reads values, shows validator messages, builds the model.

import { MODEL_TYPES, MODEL_STATUSES } from '../config.js';
import { newModelId } from '../modelStore.js';
import { validateModel, isValid } from '../validators.js';
import { $, fillOptions } from '../utils/dom.js';

const FIELDS = ['name', 'type', 'accuracy', 'status', 'progress'];

const dialog = $('#modelFormDialog');
const form = $('#modelForm');
let editing = null;          // the model being edited, or null when adding
let options = null;          // { getModels, onSave }

const field = name => form.elements[name];
const errorOf = name => $(`[data-error-for="${name}"]`, form);

function showErrors(errors) {
  FIELDS.forEach(name => {
    const message = errors[name] ?? '';
    errorOf(name).textContent = message;
    field(name).setAttribute('aria-invalid', String(Boolean(message)));
    field(name).classList.toggle('is-invalid', Boolean(message));
  });
}

const readValues = () => Object.fromEntries(FIELDS.map(name => [name, field(name).value]));

function toggleProgressField() {
  $('#progressField').hidden = field('status').value !== 'Training';
}

function fillForm(model) {
  field('name').value = model?.name ?? '';
  field('type').value = model?.type ?? '';
  field('accuracy').value = model?.accuracy ?? '';
  field('status').value = model?.status ?? 'Active';
  field('progress').value = model?.progress ?? '';
  toggleProgressField();
}

function buildModel(values) {
  const training = values.status === 'Training';
  return {
    id: editing?.id ?? newModelId(),
    name: values.name.trim(),
    type: values.type,
    accuracy: values.accuracy.trim() === '' ? null : Number(values.accuracy),
    status: values.status,
    progress: training ? Number(values.progress) : null,
    version: editing?.version ?? 'v1.0',
    updated: 'Just now'
  };
}

function handleSubmit(event) {
  event.preventDefault();
  const errors = validateModel(readValues(), options.getModels(), editing?.id ?? null);
  showErrors(errors);

  if (!isValid(errors)) {
    field(FIELDS.find(name => errors[name])).focus();
    return;
  }
  options.onSave(buildModel(readValues()), Boolean(editing));
  dialog.close();
}

export function openModelForm(model = null) {
  editing = model;
  $('#formTitle').textContent = model ? 'Edit Model' : 'Add Model';
  fillForm(model);
  showErrors({});
  dialog.showModal();
  field('name').focus();
}

export function initModelForm(callbacks) {
  options = callbacks;
  fillOptions(field('type'), MODEL_TYPES, 'Select type');
  fillOptions(field('status'), MODEL_STATUSES);

  form.addEventListener('submit', handleSubmit);
  field('status').addEventListener('change', toggleProgressField);
  $('#formCancel').addEventListener('click', () => dialog.close());

  // clear a field's error as soon as the user starts fixing it
  FIELDS.forEach(name => field(name).addEventListener('input', () => {
    errorOf(name).textContent = '';
    field(name).classList.remove('is-invalid');
    field(name).setAttribute('aria-invalid', 'false');
  }));
}
