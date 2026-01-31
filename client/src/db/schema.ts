import {
    type RxJsonSchema,
    toTypedRxJsonSchema,
    type ExtractDocumentTypeFromTypedRxJsonSchema
} from 'rxdb';

// --- Transaction Event (Write Model) ---
export const TRANSACTION_SCHEMA_LITERAL = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
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
        }
    },
    required: ['id', 'type', 'sku', 'qty', 'timestamp', 'sync_status']
} as const;

const schemaTypedTransaction = toTypedRxJsonSchema(TRANSACTION_SCHEMA_LITERAL);
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
        // We track stock broken down by batch for the Balancer, 
        // but for the basic local store read model, we might just want to store the top-level info 
        // or keep an array of batches. 
        // For simplicity and matching the prompt's "InventoryItem" schema:
        // Fields: `sku`, `batch_id`, `current_stock`, `expiry_date`.
        // This implies one document per SKU-Batch combo? 
        // Or "InventoryItem" is actually a specific batch record.
        // Let's assume unique key is composite SKU+Batch? 
        // RxDB composite keys are tricky, so we might use a generated ID like `SKU|BATCH`.
        // Prompt says: "Create a schema for InventoryItem... Fields: sku, batch_id, current_stock, expiry_date."

        // Let's use a composite ID as primary key: `${sku}|${batch_id}`
        id: {
            type: 'string',
            maxLength: 100
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
    required: ['id', 'sku', 'batch_id', 'current_stock']
} as const;

const schemaTypedInventory = toTypedRxJsonSchema(INVENTORY_SCHEMA_LITERAL);
export type InventoryDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTypedInventory>;

export const InventorySchema: RxJsonSchema<InventoryDocType> = INVENTORY_SCHEMA_LITERAL;
