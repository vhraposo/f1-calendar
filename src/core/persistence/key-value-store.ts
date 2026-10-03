import Storage from 'expo-sqlite/kv-store';

export const StorageKeys = {
  userPreferences: 'f1calendar.user-preferences.v1',
  reminderSettings: 'f1calendar.reminder-settings.v1',
} as const;

export async function readJson<T>(key: string): Promise<T | null> {
  const raw = await Storage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  await Storage.setItem(key, JSON.stringify(value));
}

export async function removeValue(key: string): Promise<void> {
  await Storage.removeItem(key);
}
