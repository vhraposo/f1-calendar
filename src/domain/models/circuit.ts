export interface Circuit {
  id: string;
  name: string;
  shortName: string | null;
  country: string;
  countryCode: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  lengthKm: number | null;
  laps: number | null;
  raceDistanceKm: number | null;
}
