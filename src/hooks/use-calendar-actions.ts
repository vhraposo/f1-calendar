import { useCallback } from 'react';
import type { Circuit } from '@/domain/models/circuit';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Session } from '@/domain/models/session';
import { sessionName } from '@/i18n/session-labels';
import { usePreferences } from '@/providers/preferences-provider';
import { useServices } from '@/providers/services-provider';
import { useTranslation } from '@/providers/i18n-provider';

export interface CalendarActions {
  addSession: (session: Session, grandPrix: GrandPrix, circuit: Circuit | null) => Promise<'added' | 'already-added'>;
  addWeekend: (sessions: Session[], grandPrix: GrandPrix, circuit: Circuit | null) => Promise<number>;
  removeSession: (session: Session) => Promise<void>;
}

export function useCalendarActions(): CalendarActions {
  const services = useServices();
  const { language } = useTranslation();
  const { preferences, updatePreferences } = usePreferences();

  const recordConsent = useCallback(async () => {
    if (!preferences.calendarIntegrationEnabled) {
      await updatePreferences({ calendarIntegrationEnabled: true });
    }
  }, [preferences.calendarIntegrationEnabled, updatePreferences]);

  const addSession = useCallback(
    async (session: Session, grandPrix: GrandPrix, circuit: Circuit | null) => {
      const result = await services.calendarIntegration.addSession({
        session,
        grandPrix,
        circuit,
        title: `${sessionName(session, language)} \u2013 ${grandPrix.name}`,
      });
      if (result === 'added') {
        await recordConsent();
      }
      return result;
    },
    [language, recordConsent, services.calendarIntegration],
  );

  const addWeekend = useCallback(
    async (sessions: Session[], grandPrix: GrandPrix, circuit: Circuit | null) => {
      const added = await services.calendarIntegration.addWeekend(
        sessions.map((session) => ({
          session,
          grandPrix,
          circuit,
          title: `${sessionName(session, language)} \u2013 ${grandPrix.name}`,
        })),
      );
      if (added > 0) {
        await recordConsent();
      }
      return added;
    },
    [language, recordConsent, services.calendarIntegration],
  );

  const removeSession = useCallback(
    (session: Session) => services.calendarIntegration.removeSession(session.id, session.startAt),
    [services.calendarIntegration],
  );

  return { addSession, addWeekend, removeSession };
}
