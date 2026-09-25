import { ReconRecord, DomainNote } from '../types/recon';

const STORAGE_KEYS = {
  RECORDS: 'web_recon_records',
  NOTES: 'web_recon_domain_notes',
};

/**
 * Get cross-browser extension API object (Firefox browser / Chrome chrome).
 */
function getExtensionAPI(): any {
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
    return browser;
  }
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return chrome;
  }
  return null;
}

/**
 * Sanitize text against CSV Formula Injection (=, +, -, @, tab, cr).
 */
function sanitizeCSVCell(value: string): string {
  if (!value) return '""';
  let str = String(value).replace(/"/g, '""');
  // Prevent CSV Formula Injection
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
}

/**
 * Safely parse JSON string with fallback.
 */
function safeJSONParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}

/**
 * Fetch all saved reconnaissance records.
 */
export async function getRecords(): Promise<ReconRecord[]> {
  const api = getExtensionAPI();
  if (api) {
    return new Promise((resolve) => {
      try {
        const result = api.storage.local.get([STORAGE_KEYS.RECORDS]);
        if (result && typeof result.then === 'function') {
          result.then((res: any) => resolve(res[STORAGE_KEYS.RECORDS] || []))
                .catch(() => resolve([]));
        } else {
          api.storage.local.get([STORAGE_KEYS.RECORDS], (res: any) => {
            resolve(res ? res[STORAGE_KEYS.RECORDS] || [] : []);
          });
        }
      } catch {
        resolve([]);
      }
    });
  } else {
    // Fallback to localStorage for dev preview
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return safeJSONParse<ReconRecord[]>(data, []);
  }
}

/**
 * Save a new reconnaissance record or update an existing one.
 */
export async function saveRecord(record: ReconRecord): Promise<ReconRecord[]> {
  const currentRecords = await getRecords();
  const filtered = currentRecords.filter(r => r.id !== record.id);
  const updated = [record, ...filtered];

  const api = getExtensionAPI();
  if (api) {
    await new Promise<void>((resolve) => {
      try {
        const res = api.storage.local.set({ [STORAGE_KEYS.RECORDS]: updated });
        if (res && typeof res.then === 'function') {
          res.then(() => resolve()).catch(() => resolve());
        } else {
          api.storage.local.set({ [STORAGE_KEYS.RECORDS]: updated }, () => resolve());
        }
      } catch {
        resolve();
      }
    });
  } else {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
    } catch {
      // Storage quota exceeded fallback
    }
  }

  // Sync note for domain
  if (record.domain && record.notes) {
    await saveDomainNote(record.domain, record.notes, record.pinned || false);
  }

  return updated;
}

/**
 * Delete a specific record by ID.
 */
export async function deleteRecord(id: string): Promise<ReconRecord[]> {
  const currentRecords = await getRecords();
  const updated = currentRecords.filter(r => r.id !== id);

  const api = getExtensionAPI();
  if (api) {
    await new Promise<void>((resolve) => {
      try {
        const res = api.storage.local.set({ [STORAGE_KEYS.RECORDS]: updated });
        if (res && typeof res.then === 'function') {
          res.then(() => resolve()).catch(() => resolve());
        } else {
          api.storage.local.set({ [STORAGE_KEYS.RECORDS]: updated }, () => resolve());
        }
      } catch {
        resolve();
      }
    });
  } else {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
  }

  return updated;
}

/**
 * Clear all records.
 */
export async function clearAllRecords(): Promise<void> {
  const api = getExtensionAPI();
  if (api) {
    await new Promise<void>((resolve) => {
      try {
        const res = api.storage.local.set({ [STORAGE_KEYS.RECORDS]: [] });
        if (res && typeof res.then === 'function') {
          res.then(() => resolve()).catch(() => resolve());
        } else {
          api.storage.local.set({ [STORAGE_KEYS.RECORDS]: [] }, () => resolve());
        }
      } catch {
        resolve();
      }
    });
  } else {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));
  }
}

/**
 * Fetch domain notes map.
 */
export async function getDomainNotes(): Promise<Record<string, DomainNote>> {
  const api = getExtensionAPI();
  if (api) {
    return new Promise((resolve) => {
      try {
        const result = api.storage.local.get([STORAGE_KEYS.NOTES]);
        if (result && typeof result.then === 'function') {
          result.then((res: any) => resolve(res[STORAGE_KEYS.NOTES] || {}))
                .catch(() => resolve({}));
        } else {
          api.storage.local.get([STORAGE_KEYS.NOTES], (res: any) => {
            resolve(res ? res[STORAGE_KEYS.NOTES] || {} : {});
          });
        }
      } catch {
        resolve({});
      }
    });
  } else {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    return safeJSONParse<Record<string, DomainNote>>(data, {});
  }
}

/**
 * Save or update a note for a specific domain.
 */
export async function saveDomainNote(domain: string, notes: string, pinned = false): Promise<Record<string, DomainNote>> {
  if (!domain) return await getDomainNotes();

  const notesMap = await getDomainNotes();
  const existing = notesMap[domain] || { domain, notes: '', updatedAt: new Date().toISOString(), pinned: false };
  
  notesMap[domain] = {
    domain,
    notes,
    updatedAt: new Date().toISOString(),
    pinned: pinned !== undefined ? pinned : existing.pinned,
  };

  const api = getExtensionAPI();
  if (api) {
    await new Promise<void>((resolve) => {
      try {
        const res = api.storage.local.set({ [STORAGE_KEYS.NOTES]: notesMap });
        if (res && typeof res.then === 'function') {
          res.then(() => resolve()).catch(() => resolve());
        } else {
          api.storage.local.set({ [STORAGE_KEYS.NOTES]: notesMap }, () => resolve());
        }
      } catch {
        resolve();
      }
    });
  } else {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notesMap));
    } catch {
      // Storage quota fallback
    }
  }

  return notesMap;
}

/**
 * Toggle pin status for a domain note.
 */
export async function togglePinDomainNote(domain: string): Promise<Record<string, DomainNote>> {
  const notesMap = await getDomainNotes();
  if (notesMap[domain]) {
    notesMap[domain].pinned = !notesMap[domain].pinned;
    notesMap[domain].updatedAt = new Date().toISOString();

    const api = getExtensionAPI();
    if (api) {
      await new Promise<void>((resolve) => {
        try {
          const res = api.storage.local.set({ [STORAGE_KEYS.NOTES]: notesMap });
          if (res && typeof res.then === 'function') {
            res.then(() => resolve()).catch(() => resolve());
          } else {
            api.storage.local.set({ [STORAGE_KEYS.NOTES]: notesMap }, () => resolve());
          }
        } catch {
          resolve();
        }
      });
    } else {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notesMap));
    }
  }
  return notesMap;
}

/**
 * Export records as JSON file.
 */
export function exportAsJSON(records: ReconRecord[]) {
  const jsonStr = JSON.stringify(records, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `web_recon_export_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export records as CSV file with formula injection protection.
 */
export function exportAsCSV(records: ReconRecord[]) {
  if (records.length === 0) return;

  const headers = ['Domain', 'URL', 'Title', 'Meta Description', 'Technologies', 'Notes', 'Timestamp'];
  const rows = records.map(r => [
    sanitizeCSVCell(r.domain || ''),
    sanitizeCSVCell(r.url || ''),
    sanitizeCSVCell(r.title || ''),
    sanitizeCSVCell(r.description || ''),
    sanitizeCSVCell((r.technologies || []).join('; ')),
    sanitizeCSVCell(r.notes || ''),
    sanitizeCSVCell(r.timestamp || '')
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `web_recon_export_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download a note as TXT file.
 */
export function downloadNoteAsTXT(domain: string, notes: string) {
  const content = `Website: ${domain}\nUpdated: ${new Date().toLocaleString()}\n----------------------------------------\n\n${notes}`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${domain.replace(/[^a-zA-Z0-9._-]/g, '_')}_notes.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Sanitize URL to ensure it starts with http:// or https:// before opening.
 */
export function isSafeURL(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
