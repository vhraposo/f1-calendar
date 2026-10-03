# F1 Calendar

Aplicativo multiplataforma (Android + iOS) para calendário, sessões, onde assistir, lembretes, alarmes e integração com o calendário do dispositivo da Fórmula 1. Construído com Expo SDK 57, React Native 0.86, TypeScript estrito, Expo Router e EAS Build. Interface exclusivamente dark mode, em português do Brasil ou inglês, offline-first.

## Objetivo

Permitir que o usuário:

- consulte temporadas de 1950 até a temporada atual;
- visualize todos os Grands Prix e todas as sessões de cada fim de semana (incluindo Sprint);
- saiba exatamente quando cada sessão começa no horário local e no horário do circuito;
- descubra onde assistir no seu país;
- configure notificações e alarmes por tipo de sessão;
- adicione sessões ou o fim de semana inteiro ao calendário do dispositivo;
- use o aplicativo sem internet depois de uma sincronização bem-sucedida;
- alterne entre português (Brasil) e inglês.

## Stack

| Camada | Tecnologia | Versão |
| --- | --- | --- |
| Runtime | Expo SDK | 57 (`expo@~57.0.26`) |
| Framework | React Native | 0.86.3 |
| UI | React | 19.2.3 |
| Linguagem | TypeScript | strict (`~6.0.3`) |
| Navegação | Expo Router (file-based) | `~57.0.24` |
| Estilo | NativeWind + Tailwind CSS | `nativewind@4.2.7`, `tailwindcss@^3.4.17` |
| Persistência | expo-sqlite (SQL direto + migrações) + expo-sqlite/kv-store | `~57.x` |
| Notificações | expo-notifications (locais) | `~57.x` |
| Background | expo-background-task + expo-task-manager | `~57.x` |
| Calendário | expo-calendar (Next API) | `~57.x` |
| Localização | expo-localization | `~57.x` |
| Ícones | react-native-svg (conjunto próprio) | `15.15.4` |
| Testes | jest-expo | `~57.0.5` |
| Build | EAS Build (`eas.json`) | - |

## Arquitetura

```
UI (src/app, src/features)
        ↓
Use cases (src/domain/use-cases)
        ↓
Repositories (contratos em src/domain/repositories)
        ↓
Data (src/data: providers, mappers, SQLite, SyncService)
        ↓
Jolpica F1 API (https://api.jolpi.ca)
```

O domínio não conhece URLs, JSON externo, nomes de campos da API nem detalhes HTTP. O provider `F1DataProvider` é o único ponto que conhece a Jolpica; `FallbackF1DataProvider` permite encadear provedores futuros (ex.: um provedor oficial, caso exista API pública adequada).

Detalhes completos em [docs/architecture.md](docs/architecture.md).

## Estrutura

```
src/
├── app/                 rotas Expo Router (tabs, onboarding, grand-prix, session, seasons)
├── alarms/              AlarmScheduler + implementação notification-backed
├── calendar/            integração com expo-calendar (dedupe por metadados)
├── components/          design system (AppText, AppCard, AppButton, Countdown, ...)
├── core/                config, errors, networking, persistence, time, localization
├── data/                providers (Jolpica), DTOs, mappers, repositórios SQLite, SyncService
├── design-system/       tokens + ícones SVG próprios
├── domain/              models, repositories, services, use-cases
├── features/            home, calendar, seasons, grand-prix, session, settings, onboarding
├── hooks/               useAsyncData, useCountryCode, useReminderActions, useCalendarActions
├── i18n/                dicionários pt-BR/en, provider e labels de sessão
├── notifications/       canais, scheduler determinístico, reconciliação, conteúdo
├── providers/           composition root, providers React e background task
└── test-support/        fixtures de teste
```

## Execução

Pré-requisitos: Node.js 22.13+ (recomendado 24 LTS), npm, Expo CLI via `npx`.

```bash
npm install
npx expo start          # Metro
npx expo start --android
npx expo start --ios
npm run typecheck       # tsc --noEmit
npm run lint            # expo lint
npm test                # jest (67 testes unitários)
npx expo-doctor         # 21/21 checks
```

### Desenvolvimento no Windows

- Todo o fluxo de desenvolvimento (Metro, typecheck, lint, testes, EAS) roda no Windows.
- Testes em dispositivo/emulador Android: `npx expo start --android` com Expo Go para o que não usa módulos nativos; para notificações locais, calendário e background use um development build (`npx expo run:android` ou `eas build --profile development --platform android`).
- iOS **não** pode ser compilado localmente no Windows. Use:
  - Expo Go / development build na nuvem: `eas build --profile development --platform ios`;
  - build de produção: `eas build --profile production --platform ios`;
  - simulador apenas em macOS com Xcode 26.4+.
- O `expo export` (bundle JS) funciona no Windows. A geração de bytecode Hermes pode falhar em caminhos com caracteres não-ASCII (ex.: `Área de Trabalho`); use `--no-bytecode` para validar o bundle localmente. EAS Build gera bytecode normalmente.

## EAS

```bash
npx eas-cli@latest login
npx eas-cli@latest init            # vincula o projeto e grava o projectId
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile preview --platform android
npx eas-cli@latest build --profile production --platform android
npx eas-cli@latest build --profile production --platform ios
npx eas-cli@latest submit --platform ios
```

Perfis disponíveis em `eas.json`: `development` (dev client + APK), `preview` (APK interno), `production` (AAB/IPA, `autoIncrement`, canais de OTA). Passo a passo em [docs/build.md](docs/build.md).

## Providers e fontes de dados

- **Calendário/sessões**: Jolpica F1 API — endpoint `GET /f1/alpha/schedules/{year}/`, que retorna rounds, circuitos, sessões com `timestamp` UTC, `timezone` IANA, `scheduled_laps` e flag de cancelamento. A Jolpica é a sucessora da Ergast, mantida pela comunidade, com cobertura de 1950 até a temporada atual.
- **Onde assistir**: não existe API pública estruturada da Formula1.com. O aplicativo empacota um snapshot datado da página oficial "F1 Broadcast Information" (fonte e validade registradas em cada registro). Ver [docs/broadcast-data.md](docs/broadcast-data.md).
- **User-Agent obrigatório**: `F1Calendar/1.0.0 (Expo; React Native)`.
- **Rate limits**: 4 req/s e 500 req/h. O app faz no máximo 2 requisições por sincronização e mantém cache local por 6 horas.
- Comparação completa de fontes e licenças: [docs/data-sources.md](docs/data-sources.md).

## Offline-first e sincronização

1. O app abre e lê o SQLite imediatamente (sem bloquear a Home).
2. `SyncService` verifica frescor (6h), busca temporadas e a temporada atual, normaliza, persiste e reconcilia notificações.
3. Falhas de rede nunca apagam dados: a UI mostra o banner offline e continua com o calendário salvo.
4. `expo-background-task` (WorkManager/BGTaskScheduler, intervalo mínimo de 6h) mantém os dados e lembretes atualizados quando o sistema permite.

## Notificações

- Notificações locais via `expo-notifications`, sem servidor.
- IDs determinísticos derivados dos dados: `2026-24-race-60m`, `2026-24-race-15m`, `2026-24-race-alarm-30m`.
- `reconcileSessionReminders` cancela o que não está mais planejado e agenda o que falta — nunca duplica.
- Limite de proximidade: apenas sessões nos próximos 60 dias e no máximo 56 lembretes agendados (limite do iOS é 64 pendentes por app).
- Conteúdo com contexto: sessão, Grand Prix, dia/hora locais e emissora quando disponível. Deep link abre a sessão.
- Detalhes: [docs/notifications.md](docs/notifications.md).

## Alarmes

- Abstração `AlarmScheduler` com detecção de capacidades por plataforma.
- Implementação atual: canal Android `race-alarms` com importância máxima, `bypassDnd`, vibração forte e agendamento exato (requer acesso especial "Alarmes e lembretes" no Android 12+); no iOS usa notificações `timeSensitive`.
- AlarmKit (iOS 26+) não está embarcado nesta versão (exigiria módulo nativo). O ponto de extensão está preparado e documentado em [docs/alarms.md](docs/alarms.md).

## Calendário do dispositivo

- `expo-calendar` (Next API), calendário próprio "F1 Calendar".
- Eventos criados apenas por ação explícita do usuário, individualmente ou o fim de semana inteiro.
- Deduplicação por tabela `calendar_links` + marcador `[f1calendar:{sessionId}]` nas notas do evento.
- iOS usa permissão write-only; Android usa READ/WRITE_CALENDAR.
- Detalhes: [docs/calendar-integration.md](docs/calendar-integration.md).

## Localização

- Idiomas: `pt-BR` e `en`, com padrão no locale do dispositivo e seleção manual em Ajustes/Onboarding.
- Nomes oficiais dos Grands Prix não são traduzidos; nomes de sessões e toda a interface são.
- Chaves tipadas (`TranslationKey`) garantem que os dois dicionários permaneçam sincronizados (teste automatizado).
- Detalhes: [docs/localization.md](docs/localization.md).

## Testes

```bash
npm test                 # 67 testes unitários (10 suítes)
npm run typecheck
npm run lint
```

Teste de integração ao vivo (rede):

```bash
npx jest --config '{"preset":"jest-expo/node","testMatch":["**/__integration__/*.integration.ts"],"moduleNameMapper":{"^@/(.*)$":"<rootDir>/src/$1"}}'
```

Cobertura: timezones e DST (BR, JP, AU, UK, US, PT), countdown, próxima corrida/sessão, fase de sessão, status de temporada, planner de lembretes, IDs determinísticos, broadcast por país/temporada/sessão, mapper Jolpica (Sprint, cancelados sem round, códigos futuros), provider com User-Agent, SyncService, i18n e códigos de país. Detalhes: [docs/testing.md](docs/testing.md).

## Licença dos dados

- Dados de calendário: Jolpica F1 API (open source, MIT para o código). Os dados da F1 pertencem aos seus titulares; uso de dados factuais de agenda com atribuição.
- Informações de transmissão: snapshot da página oficial da Formula1.com, com fonte e validade por registro. Direitos mudam; consulte a programação local.
- Marcas "F1", "FORMULA 1", "GRAND PRIX" pertencem à Formula One Licensing B.V. Este aplicativo não usa logotipos oficiais e não é afiliado à F1.
- Fontes de bibliotecas e licenças: [docs/data-sources.md](docs/data-sources.md).

## Privacidade

Sem conta, sem analytics, sem GPS. Tudo é armazenado no dispositivo. Permissões (notificações, alarmes, calendário) são solicitadas apenas quando o usuário ativa o recurso correspondente.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | Camadas, módulos, fluxos e decisões |
| [docs/data-sources.md](docs/data-sources.md) | Comparação de fontes, licenças e decisão |
| [docs/broadcast-data.md](docs/broadcast-data.md) | Onde assistir: origem, validade e manutenção |
| [docs/notifications.md](docs/notifications.md) | Scheduler, IDs, limites, reconciliação |
| [docs/alarms.md](docs/alarms.md) | Android, iOS, AlarmKit e limitações |
| [docs/calendar-integration.md](docs/calendar-integration.md) | expo-calendar, dedupe, permissões |
| [docs/localization.md](docs/localization.md) | pt-BR/en, fallback e seleção |
| [docs/build.md](docs/build.md) | EAS, Windows, Android, iOS |
| [docs/testing.md](docs/testing.md) | Estratégia e comandos |
| [docs/qa.md](docs/qa.md) | Matriz de QA e limitações |
