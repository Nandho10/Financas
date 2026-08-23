const DB_NAME = 'organizador_consumo_db';
const DB_VERSION = 2;

export function initDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store transactions
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' });
      }
      
      // Store custom categorization rules
      if (!db.objectStoreNames.contains('rules')) {
        db.createObjectStore('rules', { keyPath: 'id', autoIncrement: true });
      }

      // Store loans
      if (!db.objectStoreNames.contains('loans')) {
        db.createObjectStore('loans', { keyPath: 'id' });
      }

      // Store loan payments
      if (!db.objectStoreNames.contains('loan_payments')) {
        db.createObjectStore('loan_payments', { keyPath: 'id' });
      }
    };
  });
}

// Transaction Helpers
export async function getTransactions() {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('transactions', 'readonly');
    const store = transaction.objectStore('transactions');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveTransactions(transactionsList) {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('transactions', 'readwrite');
    const store = transaction.objectStore('transactions');
    
    transactionsList.forEach(t => {
      store.put(t);
    });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function updateTransactionCategory(id, type, category, subcategory) {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('transactions', 'readwrite');
    const store = transaction.objectStore('transactions');
    const getReq = store.get(id);
    
    getReq.onsuccess = () => {
      const data = getReq.result;
      if (data) {
        if (type) data.type = type;
        data.category = category;
        if (subcategory) data.subcategory = subcategory;
        store.put(data);
      }
    };
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function deleteTransaction(id) {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('transactions', 'readwrite');
    const store = transaction.objectStore('transactions');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllTransactions() {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('transactions', 'readwrite');
    const store = transaction.objectStore('transactions');
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Rules Helpers
export async function getRules() {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('rules', 'readonly');
    const store = transaction.objectStore('rules');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRule(rule) {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('rules', 'readwrite');
    const store = transaction.objectStore('rules');
    const request = store.put(rule);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteRule(id) {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('rules', 'readwrite');
    const store = transaction.objectStore('rules');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Loans Helpers
export async function getLoans() {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('loans', 'readonly');
    const store = transaction.objectStore('loans');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLoan(loan) {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('loans', 'readwrite');
    const store = transaction.objectStore('loans');
    const request = store.put(loan);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteLoan(id) {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('loans', 'readwrite');
    const store = transaction.objectStore('loans');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Loan Payments Helpers
export async function getLoanPayments() {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('loan_payments', 'readonly');
    const store = transaction.objectStore('loan_payments');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLoanPayment(payment) {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('loan_payments', 'readwrite');
    const store = transaction.objectStore('loan_payments');
    const request = store.put(payment);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteLoanPayment(id) {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('loan_payments', 'readwrite');
    const store = transaction.objectStore('loan_payments');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
