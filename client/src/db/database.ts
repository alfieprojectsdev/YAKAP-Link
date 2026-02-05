import {
    createRxDatabase,
    type RxDatabase,
    type RxCollection
} from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import {
    TransactionSchema,
    type TransactionDocType,
    InventorySchema,
    type InventoryDocType,
    PatientSchema,
    type PatientDocType
} from './schema';

export type TransactionCollection = RxCollection<TransactionDocType>;
export type InventoryCollection = RxCollection<InventoryDocType>;
export type PatientCollection = RxCollection<PatientDocType>;

export type MyDatabaseCollections = {
    transactions: TransactionCollection;
    inventory: InventoryCollection;
    patients: PatientCollection;
};

export type MyDatabase = RxDatabase<MyDatabaseCollections>;

let dbPromise: Promise<MyDatabase> | null = null;

export const getDatabase = (): Promise<MyDatabase> => {
    if (!dbPromise) {
        dbPromise = createDatabase();
    }
    return dbPromise;
};

const createDatabase = async (): Promise<MyDatabase> => {
    const db = await createRxDatabase<MyDatabaseCollections>({
        name: 'yakap_local_db',
        storage: getRxStorageDexie()
    });

    await db.addCollections({
        transactions: {
            schema: TransactionSchema
        },
        inventory: {
            schema: InventorySchema
        },
        patients: {
            schema: PatientSchema
        }
    });

    return db;
};
