const ISO3_TO_ISO2: Record<string, string> = {
  ARG: 'AR', AUS: 'AU', AUT: 'AT', AZE: 'AZ', BEL: 'BE', BRA: 'BR', BGR: 'BG',
  BHR: 'BH', CAN: 'CA', CHE: 'CH', CHN: 'CN', COL: 'CO', CZE: 'CZ', DEU: 'DE',
  DNK: 'DK', DZA: 'DZ', ESP: 'ES', EST: 'EE', FIN: 'FI', FRA: 'FR', GBR: 'GB',
  GRC: 'GR', HKG: 'HK', HRV: 'HR', HUN: 'HU', IDN: 'ID', IND: 'IN', IRL: 'IE',
  ISR: 'IL', ITA: 'IT', JPN: 'JP', KOR: 'KR', KWT: 'KW', LUX: 'LU', LVA: 'LV',
  MAR: 'MA', MCO: 'MC', MEX: 'MX', MYS: 'MY', NLD: 'NL', NOR: 'NO', NZL: 'NZ',
  OMN: 'OM', POL: 'PL', PRT: 'PT', QAT: 'QA', ROU: 'RO', RUS: 'RU', SAU: 'SA',
  SGP: 'SG', SRB: 'RS', SWE: 'SE', THA: 'TH', TUR: 'TR', TWN: 'TW', UKR: 'UA',
  USA: 'US', VNM: 'VN', ZAF: 'ZA', ARE: 'AE', BHS: 'BS', BRB: 'BB', CHL: 'CL',
  ECU: 'EC', GTM: 'GT', PAN: 'PA', PER: 'PE', PRI: 'PR', URY: 'UY', VEN: 'VE',
  SVK: 'SK', SVN: 'SI', LTU: 'LT', GEO: 'GE', ARM: 'AM', NGA: 'NG', KEN: 'KE',
};

const COUNTRY_NAMES: Record<string, string> = {
  AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan', BE: 'Belgium', BR: 'Brazil',
  BH: 'Bahrain', BG: 'Bulgaria', CA: 'Canada', CN: 'China', CZ: 'Czechia',
  DK: 'Denmark', FI: 'Finland', FR: 'France', DE: 'Germany', GB: 'United Kingdom',
  GR: 'Greece', HK: 'Hong Kong', HU: 'Hungary', IN: 'India', ID: 'Indonesia',
  IE: 'Ireland', IL: 'Israel', IT: 'Italy', JP: 'Japan', KR: 'South Korea',
  LU: 'Luxembourg', MY: 'Malaysia', MX: 'Mexico', MC: 'Monaco', NL: 'Netherlands',
  NZ: 'New Zealand', NO: 'Norway', PL: 'Poland', PT: 'Portugal', QA: 'Qatar',
  RO: 'Romania', RU: 'Russia', SA: 'Saudi Arabia', RS: 'Serbia', SG: 'Singapore',
  ZA: 'South Africa', ES: 'Spain', SE: 'Sweden', CH: 'Switzerland', TH: 'Thailand',
  TR: 'Turkey', AE: 'United Arab Emirates', US: 'United States', VN: 'Vietnam',
  AL: 'Albania', AM: 'Armenia', BA: 'Bosnia', CY: 'Cyprus', EE: 'Estonia',
  IS: 'Iceland', KH: 'Cambodia', LA: 'Laos', LV: 'Latvia', LT: 'Lithuania',
  MK: 'Macedonia', MT: 'Malta', ME: 'Montenegro', MM: 'Myanmar', PH: 'Philippines',
  SI: 'Slovenia', UA: 'Ukraine', XK: 'Kosovo', TW: 'Chinese Taipei', HR: 'Croatia',
  AFRICA: 'Africa', CARIBBEAN: 'Caribbean', EURASIA: 'Eurasia', LATAM: 'Latin America',
  MENA: 'MENA', INTL_TRANSPORT: 'In-Ship & In-Flight',
};

export function toIso2CountryCode(iso3: string | null | undefined): string | null {
  if (!iso3) {
    return null;
  }
  const normalized = iso3.trim().toUpperCase();
  if (normalized.length === 2) {
    return normalized;
  }
  return ISO3_TO_ISO2[normalized] ?? null;
}

export function countryNameForCode(countryCode: string): string | null {
  return COUNTRY_NAMES[countryCode.toUpperCase()] ?? null;
}

export function countryCodeToFlagEmoji(countryCode: string | null | undefined): string | null {
  if (!countryCode || countryCode.length !== 2) {
    return null;
  }
  const upper = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) {
    return null;
  }
  return String.fromCodePoint(...[...upper].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65));
}
