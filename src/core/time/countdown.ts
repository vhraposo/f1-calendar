export interface CountdownParts {
  totalMilliseconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function computeCountdown(targetAt: string, now: number): CountdownParts {
  const target = new Date(targetAt).getTime();
  const totalMilliseconds = Math.max(0, target - now);
  return {
    totalMilliseconds,
    days: Math.floor(totalMilliseconds / DAY_MS),
    hours: Math.floor((totalMilliseconds % DAY_MS) / HOUR_MS),
    minutes: Math.floor((totalMilliseconds % HOUR_MS) / MINUTE_MS),
    seconds: Math.floor((totalMilliseconds % MINUTE_MS) / 1000),
    isComplete: totalMilliseconds === 0,
  };
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export function formatCountdownCompact(parts: CountdownParts): string {
  if (parts.isComplete) {
    return '0m';
  }
  if (parts.days > 0) {
    return `${parts.days}d ${pad(parts.hours)}h ${pad(parts.minutes)}m`;
  }
  if (parts.hours > 0) {
    return `${parts.hours}h ${pad(parts.minutes)}m ${pad(parts.seconds)}s`;
  }
  return `${parts.minutes}m ${pad(parts.seconds)}s`;
}
