import {
    type RxJsonSchema,
    toTypedRxJsonSchema,
    type ExtractDocumentTypeFromTypedRxJsonSchema
} from 'rxdb';

// --- Transaction Event (Write Model) ---
export const TRANSACTION_SCHEMA_LITERAL = {
    version: 1,
    primaryKey: 'id',
    type: 'object',
    indexes: [['sku', 'timestamp']],
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        type: {
            type: 'string',
            enum: ['DISPENSE', 'RECEIVE', 'ADJUST'],
            maxLength: 20
        },
        sku: {
            type: 'string',
            maxLength: 50
        },
        batch_id: {
            type: 'string',
            maxLength: 50
        },
        qty: {
            type: 'number'
        },
        timestamp: {
            type: 'string',
            format: 'date-time',
            maxLength: 50
        },
        sync_status: {
            type: 'string',
            enum: ['PENDING', 'SYNCED'],
            maxLength: 10
        },
        hash: {
            type: 'string',
            maxLength: 64
        }
    },
    required: ['id', 'type', 'sku', 'qty', 'timestamp', 'sync_status']
} as const;

export const schemaTypedTransaction = toTypedRxJsonSchema(TRANSACTION_SCHEMA_LITERAL);
export type TransactionDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTypedTransaction>;

export const TransactionSchema: RxJsonSchema<TransactionDocType> = TRANSACTION_SCHEMA_LITERAL;

// --- Inventory Item (Read Model) ---
export const INVENTORY_SCHEMA_LITERAL = {
    version: 0,
    primaryKey: 'sku',
    type: 'object',
    properties: {
        sku: {
            type: 'string',
            maxLength: 50
        },
        batch_id: {
            type: 'string',
            maxLength: 50
        },
        current_stock: {
            type: 'number'
        },
        expiry_date: {
            type: 'string',
            format: 'date',
            maxLength: 20
        }
    },
    required: ['sku', 'batch_id', 'current_stock']
} as const;

export const schemaTypedInventory = toTypedRxJsonSchema(INVENTORY_SCHEMA_LITERAL);
export type InventoryDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTypedInventory>;

export const InventorySchema: RxJsonSchema<InventoryDocType> = INVENTORY_SCHEMA_LITERAL;

// --- Patient (Reference Data) ---
export const PATIENT_SCHEMA_LITERAL = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        name: {
            type: 'string',
            maxLength: 100
        },
        municipality: {
            type: 'string', // e.g. "Lubuagan", "Tabuk"
            maxLength: 100
        },
        last_sync_date: {
            type: 'string', // When we last saw this patient's data from server
            format: 'date-time'
        }
    },
    required: ['id', 'name', 'municipality']
} as const;

export const schemaTypedPatient = toTypedRxJsonSchema(PATIENT_SCHEMA_LITERAL);
export type PatientDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTypedPatient>;

export const PatientSchema: RxJsonSchema<PatientDocType> = PATIENT_SCHEMA_LITERAL;
