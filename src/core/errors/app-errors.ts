export type AppErrorCode =
  | 'NETWORK_ERROR'
  | 'DATA_PROVIDER_ERROR'
  | 'INVALID_SCHEDULE'
  | 'BROADCAST_INFORMATION_UNAVAILABLE'
  | 'NOTIFICATION_PERMISSION_DENIED'
  | 'ALARM_PERMISSION_DENIED'
  | 'CALENDAR_PERMISSION_DENIED'
  | 'STORAGE_ERROR'
  | 'NOT_FOUND';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;

  constructor(code: AppErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.cause = options?.cause;
  }
}

export class NetworkError extends AppError {
  readonly status?: number;

  constructor(message: string, options?: { status?: number; cause?: unknown }) {
    super('NETWORK_ERROR', message, options);
    this.status = options?.status;
  }
}

export class DataProviderError extends AppError {
  readonly providerId: string;

  constructor(providerId: string, message: string, options?: { cause?: unknown }) {
    super('DATA_PROVIDER_ERROR', message, options);
    this.providerId = providerId;
  }
}

export class InvalidScheduleError extends AppError {
  constructor(message: string, options?: { cause?: unknown }) {
    super('INVALID_SCHEDULE', message, options);
  }
}

export class BroadcastInformationUnavailable extends AppError {
  constructor(message: string) {
    super('BROADCAST_INFORMATION_UNAVAILABLE', message);
  }
}

export class NotificationPermissionDenied extends AppError {
  constructor() {
    super('NOTIFICATION_PERMISSION_DENIED', 'Notification permission was not granted');
  }
}

export class AlarmPermissionDenied extends AppError {
  constructor(message = 'Alarm permission was not granted') {
    super('ALARM_PERMISSION_DENIED', message);
  }
}

export class CalendarPermissionDenied extends AppError {
  constructor() {
    super('CALENDAR_PERMISSION_DENIED', 'Calendar permission was not granted');
  }
}

export class StorageError extends AppError {
  constructor(message: string, options?: { cause?: unknown }) {
    super('STORAGE_ERROR', message, options);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NOT_FOUND', message);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
