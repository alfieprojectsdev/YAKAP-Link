export const SKUS = [
  { value: 'MED-AMOX-500', label: 'Amoxicillin 500mg' },
  { value: 'MED-PARA-500', label: 'Paracetamol 500mg' },
  { value: 'MED-DOXY-100', label: 'Doxycycline 100mg' },
] as const;

export const DEFAULT_SKU = SKUS[0].value;
