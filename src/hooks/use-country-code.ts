import { useMemo } from 'react';
import { getDeviceRegionCode } from '@/core/localization/device-locale';
import { usePreferences } from '@/providers/preferences-provider';

export function useCountryCode(): string | null {
  const { preferences } = usePreferences();
  return useMemo(
    () => preferences.countryCode ?? getDeviceRegionCode(),
    [preferences.countryCode],
  );
}
