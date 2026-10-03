# Arquitetura

## Visão geral

```
UI (src/app + src/features)
  ↓ chama
Use cases (src/domain/use-cases)
  ↓ dependem de
Repositories (contratos em src/domain/repositories)
  ↓ implementados em
Data (src/data/repositories, SQLite)
  ↑ alimentados por
SyncService ← F1DataProvider (JolpicaF1Provider → api.jolpi.ca)
```

Regra central: **o domínio não conhece a API externa**. Nenhum tipo de `src/domain` importa DTOs, URLs ou `fetch`. Toda conversão acontece em `src/data/providers/jolpica/jolpica-schedule-mapper.ts`.

## Camadas

### core

- `core/config/app-config.ts` — constantes (User-Agent, base URL, frescor de sync, horizonte de lembretes, limites).
- `core/errors/app-errors.ts` — erros semânticos: `NetworkError`, `DataProviderError`, `InvalidScheduleError`, `NotificationPermissionDenied`, `AlarmPermissionDenied`, `CalendarPermissionDenied`, `StorageError`, `NotFoundError`.
- `core/networking/json-http-client.ts` — GET JSON com timeout, retry exponencial para 429/5xx e User-Agent identificável.
- `core/persistence/database.ts` — abertura do SQLite, WAL, foreign keys e migrações por `PRAGMA user_version`.
- `core/persistence/key-value-store.ts` — preferências em `expo-sqlite/kv-store`.
- `core/time/instant.ts` — formatação por timezone IANA com `Intl.DateTimeFormat` (cache de formatters).
- `core/time/countdown.ts` — aritmética pura de countdown.
- `core/time/presentation.ts` — apresentação de horários (local vs circuito).
- `core/localization/country-codes.ts` — ISO3→ISO2, nomes e bandeiras.
- `core/localization/device-locale.ts` — idioma e região do dispositivo via expo-localization.

### domain

- `models/` — `Season`, `GrandPrix`, `Circuit`, `Session`, `BroadcastInformation`, `ReminderSettings`, `UserPreferences`, `SeasonSchedule`.
- `repositories/` — contratos: `ScheduleRepository`, `BroadcastRepository`, `SyncStateRepository`, `CalendarLinkRepository`, `PreferencesRepository`.
- `services/` — regras puras e testáveis:
  - `schedule-query.ts` (próxima corrida/sessão, fase de sessão, status de temporada);
  - `session-duration.ts` (duração nominal por tipo — usada apenas para fim de evento no calendário e janela "ao vivo");
  - `reminder-planner.ts` (plano determinístico de lembretes);
  - `broadcast-directory.ts` (seleção por país/temporada/sessão com janela de validade).
- `use-cases/` — `getHomeSnapshot`, `getSeasonCalendar`, `getGrandPrixDetails`, `getSessionDetails`.

### data

- `providers/f1-data-provider.ts` — porta `F1DataProvider` (`listSeasonYears`, `fetchSeasonSchedule`).
- `providers/fallback-f1-data-provider.ts` — encadeia provedores em ordem; hoje registra apenas a Jolpica.
- `providers/jolpica/` — DTOs, mapper e provider. `mapJolpicaScheduleToDomain` produz `SeasonSchedule` completo com IDs determinísticos (`2026-01`, `2026-01-qualifying`).
- `repositories/sqlite-*` — implementações SQL tipadas.
- `cache/sync-service.ts` — orquestra provider + repositórios + estado de sincronização.

### features e app

- `src/app/` contém apenas rotas finas que renderizam telas de `src/features`.
- Cada feature tem `components/` semânticos (`NextRaceHero`, `SessionSchedule`, `BroadcastInformationList`, `ReminderControls`, ...).

### providers

- `create-app-services.ts` — composition root único, também usado pela background task.
- `services-provider.tsx` → `preferences-provider.tsx` → `i18n-provider.tsx` → `sync-provider.tsx`.
- `background-sync-task.ts` — define e registra a task de background.

## Fluxos principais

### Abertura do app

1. Providers carregam preferências do kv-store.
2. `SyncProvider` dispara `ensureBroadcastSeed` + `syncUpcomingSeasons(false)` em background.
3. Telas leem o SQLite imediatamente; a UI nunca espera a rede.
4. Ao final do sync, `reconcileSessionReminders` é executado.

### Sincronização

```
SyncService.syncSeason(year)
  ├─ frescor < 6h e dados locais existem → skipped
  ├─ provider.fetchSeasonSchedule(year)
  │     └─ mapper → SeasonSchedule (domínio)
  ├─ repository.replaceSeasonSchedule (transação exclusiva)
  │     ├─ upsert seasons/circuits
  │     └─ delete+insert grand_prix/sessions da temporada
  └─ sync_state.last_success_at = agora
```

Falha → `SyncResult { status: 'failed', error }`; dados locais permanecem intactos.

### Lembretes

```
ReminderSettings + sessões locais
  → planSessionReminders (domínio, puro)
  → reconcileSessionReminders (infra)
      ├─ notificationScheduler.reconcile (canal session-reminders)
      └─ alarmScheduler.reconcile (canal race-alarms)
```

## Decisões arquiteturais

| Decisão | Motivo |
| --- | --- |
| SQLite direto em vez de ORM | Esquema pequeno e estável; evita dependência e build extra; migrações explícitas e auditáveis |
| `Intl` em vez de date-fns-tz | Zero dependência, suporte a IANA no Hermes/Node; testável |
| NativeWind 4.2.7 (estável) | Suporte oficial ao SDK 57; v5 está em RC e não é recomendada para produção |
| Ícones SVG próprios | `@expo/vector-icons` está deprecated; evita fontes e pacotes extras |
| Sem biblioteca de i18n | Dicionários tipados garantem paridade por tipos e teste; sem dependência |
| Fallback provider desde o início | Permite plugar provedor oficial no futuro sem tocar no domínio |
| Durações nominais de sessão | A API não fornece fim de sessão; valores explícitos em `session-duration.ts` (60min prática/qualy, 45min SQ, 120min corrida) |
| Snapshot de transmissão datado | Não existe API pública; validade por registro permite trocar emissoras sem mudar código |
