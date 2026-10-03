export type AppLanguage = 'system' | 'pt-BR' | 'en';

export interface UserPreferences {
  language: AppLanguage;
  countryCode: string | null;
  onboardingCompleted: boolean;
  calendarIntegrationEnabled: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  language: 'system',
  countryCode: null,
  onboardingCompleted: false,
  calendarIntegrationEnabled: false,
};
