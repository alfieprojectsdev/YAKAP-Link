export const TRANSACTION_TYPES = {
    DISPENSE: 'DISPENSE',
    RECEIVE: 'RECEIVE',
    ADJUST: 'ADJUST'
} as const;

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
