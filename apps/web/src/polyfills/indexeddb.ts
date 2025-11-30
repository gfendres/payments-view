import { IDBKeyRange as FakeIDBKeyRange, indexedDB as fakeIndexedDB } from 'fake-indexeddb';

/**
 * WalletConnect pulls in an IndexedDB-backed storage even during SSR.
 * Provide a lightweight polyfill so static generation doesn't crash on Node.
 */
if (typeof indexedDB === 'undefined') {
  (globalThis as typeof globalThis & { indexedDB?: IDBFactory; IDBKeyRange?: typeof IDBKeyRange }).indexedDB = fakeIndexedDB;
  (globalThis as typeof globalThis & { indexedDB?: IDBFactory; IDBKeyRange?: typeof IDBKeyRange }).IDBKeyRange ??= FakeIDBKeyRange as unknown as typeof IDBKeyRange;
}
