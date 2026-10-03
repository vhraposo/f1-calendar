import { en, type TranslationDictionary, type TranslationKey } from '@/i18n/translations/en';
import { ptBR } from '@/i18n/translations/pt-BR';
import type { AppLanguage } from '@/domain/models/user-preferences';

export type ResolvedLanguage = 'en' | 'pt-BR';

export const DICTIONARIES: Record<ResolvedLanguage, TranslationDictionary> = {
  en,
  'pt-BR': ptBR,
};

export const DEFAULT_LANGUAGE: ResolvedLanguage = 'en';

export function resolveLanguage(preference: AppLanguage, deviceLanguageTags: string[]): ResolvedLanguage {
  if (preference === 'en' || preference === 'pt-BR') {
    return preference;
  }
  const firstTag = deviceLanguageTags.find((tag) => Boolean(tag)) ?? '';
  if (firstTag.toLowerCase().startsWith('pt')) {
    return 'pt-BR';
  }
  return DEFAULT_LANGUAGE;
}

export function translate(
  language: ResolvedLanguage,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const template = DICTIONARIES[language][key] ?? DICTIONARIES[DEFAULT_LANGUAGE][key] ?? key;
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, token: string) => {
    const value = params[token];
    return value === undefined ? match : String(value);
  });
}

export type { TranslationKey };
