
import { Report, Client } from '../types';

const DB_NAME = 'EquiScribeDB';
const STORE_NAME = 'reports';
const CLIENT_STORE = 'clients';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2); // Version 2 pour le nouveau store
    request.onupgradeneeded = (event: any) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CLIENT_STORE)) {
        db.createObjectStore(CLIENT_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Reports ---
export const saveReport = async (report: Report): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.put(report);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllReports = async (): Promise<Report[]> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as Report[]);
    request.onerror = () => reject(request.error);
  });
};

export const deleteReport = async (id: string): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getReportById = async (id: string): Promise<Report | undefined> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const request = store.get(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as Report);
    request.onerror = () => reject(request.error);
  });
};

// --- Clients ---
export const saveClient = async (client: Client): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(CLIENT_STORE, 'readwrite');
  const store = tx.objectStore(CLIENT_STORE);
  store.put(client);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllClients = async (): Promise<Client[]> => {
  const db = await openDB();
  const tx = db.transaction(CLIENT_STORE, 'readonly');
  const store = tx.objectStore(CLIENT_STORE);
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as Client[]);
    request.onerror = () => reject(request.error);
  });
};

export const deleteClient = async (id: string): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(CLIENT_STORE, 'readwrite');
  const store = tx.objectStore(CLIENT_STORE);
  store.delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};
