import { getLocales } from 'expo-localization';

export function getDeviceLanguageTags(): string[] {
  try {
    return getLocales().map((locale) => locale.languageTag);
  } catch {
    return [];
  }
}

export function getDeviceRegionCode(): string | null {
  try {
    const locales = getLocales();
    for (const locale of locales) {
      if (locale.regionCode) {
        return locale.regionCode.toUpperCase();
      }
    }
    return null;
  } catch {
    return null;
  }
}
