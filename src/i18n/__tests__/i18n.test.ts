import { en } from '@/i18n/translations/en';
import { ptBR } from '@/i18n/translations/pt-BR';
import { resolveLanguage, translate } from '@/i18n';

describe('i18n', () => {
  it('keeps both dictionaries in sync', () => {
    expect(Object.keys(ptBR).sort()).toEqual(Object.keys(en).sort());
  });

  it('resolves the system language from the device locale', () => {
    expect(resolveLanguage('system', ['pt-BR'])).toBe('pt-BR');
    expect(resolveLanguage('system', ['pt-PT'])).toBe('pt-BR');
    expect(resolveLanguage('system', ['en-US'])).toBe('en');
    expect(resolveLanguage('system', ['fr-FR'])).toBe('en');
  });

  it('honours an explicit language preference over the device locale', () => {
    expect(resolveLanguage('en', ['pt-BR'])).toBe('en');
    expect(resolveLanguage('pt-BR', ['en-US'])).toBe('pt-BR');
  });

  it('interpolates parameters', () => {
    expect(translate('en', 'calendar.round', { round: 24 })).toBe('Round 24');
    expect(translate('pt-BR', 'calendar.round', { round: 24 })).toBe('Etapa 24');
  });

  it('falls back to the default language for unknown keys', () => {
    const key = 'missing.key' as keyof typeof en;
    expect(translate('pt-BR', key)).toBe('missing.key');
  });

  it('translates session names in both languages', () => {
    expect(translate('pt-BR', 'session.QUALIFYING')).toBe('Classificação');
    expect(translate('en', 'session.SPRINT')).toBe('Sprint');
  });
});
