import {
  countryCodeToFlagEmoji,
  countryNameForCode,
  toIso2CountryCode,
} from '@/core/localization/country-codes';

describe('country codes', () => {
  it('maps ISO3 provider codes to ISO2', () => {
    expect(toIso2CountryCode('AUS')).toBe('AU');
    expect(toIso2CountryCode('bra')).toBe('BR');
    expect(toIso2CountryCode('GBR')).toBe('GB');
    expect(toIso2CountryCode('CHN')).toBe('CN');
  });

  it('accepts ISO2 codes as-is and rejects unknown values', () => {
    expect(toIso2CountryCode('us')).toBe('US');
    expect(toIso2CountryCode('XYZ')).toBeNull();
    expect(toIso2CountryCode(null)).toBeNull();
  });

  it('builds flag emojis from ISO2 codes', () => {
    expect(countryCodeToFlagEmoji('BR')).toBe('🇧🇷');
    expect(countryCodeToFlagEmoji('us')).toBe('🇺🇸');
    expect(countryCodeToFlagEmoji('LATAM')).toBeNull();
    expect(countryCodeToFlagEmoji(null)).toBeNull();
  });

  it('resolves display names including broadcast regions', () => {
    expect(countryNameForCode('BR')).toBe('Brazil');
    expect(countryNameForCode('MENA')).toBe('MENA');
    expect(countryNameForCode('LATAM')).toBe('Latin America');
    expect(countryNameForCode('ZZ')).toBeNull();
  });
});
