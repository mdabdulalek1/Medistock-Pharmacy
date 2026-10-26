import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  query,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Branch,
  Medicine,
  BatchInventory,
  Supplier,
  SaleInvoice,
  OnlineOrder,
  StockMovement,
} from '../types/pharmacy';
import {
  INITIAL_BRANCHES,
  INITIAL_MEDICINES,
  INITIAL_BATCHES,
  INITIAL_SUPPLIERS,
  INITIAL_SALES_INVOICES,
  INITIAL_ONLINE_ORDERS,
  INITIAL_STOCK_MOVEMENTS,
} from '../data/initialData';

/**
 * Bootstraps initial Bangladesh pharmacy data into Cloud Firestore if collections are empty.
 */
export async function seedFirestoreIfEmpty(): Promise<{ seeded: boolean; message: string }> {
  try {
    const branchesRef = collection(db, 'branches');
    const existingSnap = await getDocs(query(branchesRef, limit(1)));

    if (!existingSnap.empty) {
      return { seeded: false, message: 'Cloud Firestore already contains pharmacy records.' };
    }

    console.log('[Firebase Sync] Bootstrapping Cloud Firestore with MediStock initial data...');
    const batch = writeBatch(db);

    // Seed Branches
    INITIAL_BRANCHES.forEach((b) => {
      const docRef = doc(db, 'branches', b.id);
      batch.set(docRef, b);
    });

    // Seed Medicines
    INITIAL_MEDICINES.forEach((m) => {
      const docRef = doc(db, 'medicines', m.id);
      batch.set(docRef, m);
    });

    // Seed Batches
    INITIAL_BATCHES.forEach((bt) => {
      const docRef = doc(db, 'batches', bt.id);
      batch.set(docRef, bt);
    });

    // Seed Suppliers
    INITIAL_SUPPLIERS.forEach((s) => {
      const docRef = doc(db, 'suppliers', s.id);
      batch.set(docRef, s);
    });

    // Seed Sales
    INITIAL_SALES_INVOICES.forEach((inv) => {
      const docRef = doc(db, 'sales', inv.id);
      batch.set(docRef, inv);
    });

    // Seed Online Orders
    INITIAL_ONLINE_ORDERS.forEach((ord) => {
      const docRef = doc(db, 'onlineOrders', ord.id);
      batch.set(docRef, ord);
    });

    // Seed Stock Movements
    INITIAL_STOCK_MOVEMENTS.forEach((mov) => {
      const docRef = doc(db, 'stockMovements', mov.id);
      batch.set(docRef, mov);
    });

    await batch.commit();
    console.log('[Firebase Sync] Cloud Firestore successfully populated!');
    return { seeded: true, message: 'Cloud Firestore successfully seeded with Bangladeshi pharmacy data.' };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'bootstrap');
    return { seeded: false, message: 'Failed to seed Cloud Firestore.' };
  }
}

/**
 * Loads collections directly from Cloud Firestore
 */
export async function loadFirestoreData(): Promise<{
  branches: Branch[];
  medicines: Medicine[];
  batches: BatchInventory[];
  sales: SaleInvoice[];
  onlineOrders: OnlineOrder[];
  stockMovements: StockMovement[];
} | null> {
  try {
    const [branchesSnap, medSnap, batchSnap, salesSnap, ordersSnap, movSnap] = await Promise.all([
      getDocs(collection(db, 'branches')),
      getDocs(collection(db, 'medicines')),
      getDocs(collection(db, 'batches')),
      getDocs(collection(db, 'sales')),
      getDocs(collection(db, 'onlineOrders')),
      getDocs(collection(db, 'stockMovements')),
    ]);

    if (branchesSnap.empty) {
      return null;
    }

    return {
      branches: branchesSnap.docs.map((d) => d.data() as Branch),
      medicines: medSnap.docs.map((d) => d.data() as Medicine),
      batches: batchSnap.docs.map((d) => d.data() as BatchInventory),
      sales: salesSnap.docs.map((d) => d.data() as SaleInvoice),
      onlineOrders: ordersSnap.docs.map((d) => d.data() as OnlineOrder),
      stockMovements: movSnap.docs.map((d) => d.data() as StockMovement),
    };
  } catch (error) {
    console.warn('Could not read from Firestore, using local fullstack database:', error);
    return null;
  }
}

/**
 * Persists a new or updated sale invoice into Cloud Firestore
 */
export async function persistSaleToFirestore(invoice: SaleInvoice) {
  try {
    await setDoc(doc(db, 'sales', invoice.id), invoice);
  } catch (err) {
    console.warn('Failed to persist sale to Firestore:', err);
  }
}

/**
 * Persists updated batch stock into Cloud Firestore
 */
export async function persistBatchToFirestore(batch: BatchInventory) {
  try {
    await setDoc(doc(db, 'batches', batch.id), batch);
  } catch (err) {
    console.warn('Failed to persist batch to Firestore:', err);
  }
}
