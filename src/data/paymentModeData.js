// Master Data for Payment Mode Configurations

export const initialPaymentModeConfigs = [
  {
    id: 'PM-01',
    paymentMode: 'Cash',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'PM-02',
    paymentMode: 'KBL 1075',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'PM-03',
    paymentMode: 'KBL 1541',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'PM-04',
    paymentMode: 'SBI',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'PM-05',
    paymentMode: 'CANARA BANK',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const AVAILABLE_PAYMENT_MODES = [
  'Cash',
  'KBL 1075',
  'KBL 1541',
  'SBI',
  'CANARA BANK'
];

export const AVAILABLE_PAYMENT_TYPES = [
  'Offline',
  'Online'
];

export const AVAILABLE_BANK_ACCOUNTS = [
  'KBL 1075',
  'KBL 1541',
  'SBI',
  'CANARA BANK'
];

export const formatPaymentModeLabel = (config) => {
  if (!config) return '';
  if (typeof config === 'string') return config;
  return config.paymentMode || config.name || config.bankAccount || '';
};

