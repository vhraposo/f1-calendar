export interface JolpicaListMetadata {
  timestamp: string;
  count?: number;
  page_size?: number;
  current_page?: number;
  total_pages?: number;
}

export interface JolpicaSeasonSummary {
  id: string;
  url: string;
  year: number;
  wikipedia: string | null;
}

export interface JolpicaSchedulesListResponse {
  metadata: JolpicaListMetadata;
  data: JolpicaSeasonSummary[];
}

export interface JolpicaRound {
  id: string;
  url: string;
  number?: number;
  name: string;
  is_cancelled: boolean;
  race_number: number | null;
  wikipedia: string | null;
}

export interface JolpicaCircuit {
  id: string;
  url: string;
  name: string;
  locality: string | null;
  country_code: string | null;
  country: string;
  country_flag: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  wikipedia: string | null;
}

export interface JolpicaSessionRef {
  id: string;
  url: string;
  number: number;
  type: string;
  type_display: string;
  is_cancelled: boolean;
  scheduled_laps?: number;
}

export interface JolpicaScheduleEntry {
  code: string;
  title: string;
  sessions: JolpicaSessionRef[];
  timestamp: string | null;
  local_timestamp: string | null;
  timezone: string | null;
  results_url: string | null;
  laps_url: string | null;
}

export interface JolpicaEvent {
  round: JolpicaRound;
  circuit: JolpicaCircuit;
  schedule: JolpicaScheduleEntry[];
}

export interface JolpicaSeasonSchedule {
  id: string;
  url: string;
  year: number;
  wikipedia: string | null;
  events: JolpicaEvent[];
}

export interface JolpicaScheduleResponse {
  metadata: JolpicaListMetadata;
  data: JolpicaSeasonSchedule;
}
