import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { getDeviceLanguageTags } from '@/core/localization/device-locale';
import { resolveLanguage, translate, type ResolvedLanguage, type TranslationKey } from '@/i18n';
import { usePreferences } from '@/providers/preferences-provider';

export interface I18nContextValue {
  language: ResolvedLanguage;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { preferences } = usePreferences();
  const language = useMemo(
    () => resolveLanguage(preferences.language, getDeviceLanguageTags()),
    [preferences.language],
  );

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => translate(language, key, params),
    [language],
  );

  const value = useMemo(() => ({ language, t }), [language, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}
