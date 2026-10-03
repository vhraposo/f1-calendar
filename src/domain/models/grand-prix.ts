export interface GrandPrix {
  id: string;
  seasonYear: number;
  round: number;
  name: string;
  officialName: string | null;
  country: string;
  countryCode: string | null;
  city: string;
  circuitId: string;
  startAt: string;
  endAt: string;
  isCancelled: boolean;
  sprintWeekend: boolean;
}
