import type { Session, SessionType } from '@/domain/models/session';
import type { ResolvedLanguage, TranslationKey } from '@/i18n';
import { translate } from '@/i18n';

const SESSION_NAME_KEYS: Record<SessionType, TranslationKey> = {
  PRACTICE_1: 'session.PRACTICE_1',
  PRACTICE_2: 'session.PRACTICE_2',
  PRACTICE_3: 'session.PRACTICE_3',
  SPRINT_QUALIFYING: 'session.SPRINT_QUALIFYING',
  SPRINT: 'session.SPRINT',
  QUALIFYING: 'session.QUALIFYING',
  RACE: 'session.RACE',
  OTHER: 'session.OTHER',
};

const SESSION_SHORT_KEYS: Record<SessionType, TranslationKey> = {
  PRACTICE_1: 'session.short.PRACTICE_1',
  PRACTICE_2: 'session.short.PRACTICE_2',
  PRACTICE_3: 'session.short.PRACTICE_3',
  SPRINT_QUALIFYING: 'session.short.SPRINT_QUALIFYING',
  SPRINT: 'session.short.SPRINT',
  QUALIFYING: 'session.short.QUALIFYING',
  RACE: 'session.short.RACE',
  OTHER: 'session.short.OTHER',
};

export function sessionTypeName(type: SessionType, language: ResolvedLanguage): string {
  return translate(language, SESSION_NAME_KEYS[type]);
}

export function sessionName(session: Session, language: ResolvedLanguage): string {
  if (session.type === 'OTHER') {
    return session.name;
  }
  return sessionTypeName(session.type, language);
}

export function sessionShortName(type: SessionType, language: ResolvedLanguage): string {
  return translate(language, SESSION_SHORT_KEYS[type]);
}
