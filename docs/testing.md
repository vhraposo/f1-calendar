# Testes

## Comandos

```bash
npm test              # 10 suítes / 67 testes unitários (herméticos)
npm run test:watch
npm run typecheck
npm run lint
```

Integração ao vivo (usa a rede; executar manualmente):

```bash
npx jest --config '{"preset":"jest-expo/node","testMatch":["**/__integration__/*.integration.ts"],"moduleNameMapper":{"^@/(.*)$":"<rootDir>/src/$1"}}'
```

## Configuração

- `jest.config.js` usa o preset `jest-expo/node` e `testMatch` restrito a `src/**/__tests__/**/*.test.ts`.
- Testes de integração ficam em `__integration__/` e **não** rodam no `npm test`.
- Alias `@/` mapeado para `src/`.

## Cobertura por arquivo

| Suíte | O que cobre |
| --- | --- |
| `core/time/__tests__/instant.test.ts` | Brasil, Japão, Austrália, Reino Unido (DST de primavera e outono no instante exato), EUA (DST), Portugal, UTC, intervalos de data, mesmo dia |
| `core/time/__tests__/countdown.test.ts` | dias/horas/minutos/segundos, alvo no passado, formatação compacta |
| `domain/services/__tests__/schedule-query.test.ts` | próxima corrida (ignora cancelados, mantém fim de semana ao vivo), próxima sessão, limite de listagem, fases (upcoming/live/finished), status de temporada com e sem datas |
| `domain/services/__tests__/reminder-planner.test.ts` | IDs determinísticos, leads, alarmes, gatilho no passado, horizonte de 60 dias, sessão cancelada, master desligado, dedupe, cap de 56 |
| `domain/services/__tests__/broadcast-directory.test.ts` | país, validade, especificidade de temporada/sessão, outros tipos, dedupe, vazio |
| `data/providers/jolpica/__tests__/jolpica-schedule-mapper.test.ts` | tipos de sessão, IDs, fim de semana padrão, Sprint, entrada sem timestamp, cancelados, cancelado sem round, código futuro → `OTHER`, status da temporada |
| `data/providers/jolpica/__tests__/jolpica-f1-provider.test.ts` | User-Agent enviado, ordenação de temporadas, mapeamento, erro 500 → `DataProviderError`, temporada sem sessões |
| `data/cache/__tests__/sync-service.test.ts` | skip por frescor, sync com registro de timestamp, falha preserva dados, seed de broadcasts idempotente, status heurístico |
| `i18n/__tests__/i18n.test.ts` | paridade dos dicionários, resolução de idioma, preferência explícita, interpolação, fallback, nomes de sessão |
| `core/localization/__tests__/country-codes.test.ts` | ISO3→ISO2, ISO2 direto, desconhecidos, bandeiras, nomes de região |

## Integração ao vivo

`src/data/providers/jolpica/__integration__/live-api.integration.ts` executa o provider e o mapper reais contra `api.jolpi.ca`:

- lista 77 temporadas (1950–2026);
- mapeia 2026: ≥20 GPs, ≥80 sessões, todas com timezone IANA e timestamp válido;
- confirma fim de semana Sprint com `SPRINT_QUALIFYING` e `SPRINT`;
- confirma cancelados com ID `2026-cancelled-*` e todas as sessões canceladas;
- confirma temporada histórica (1990) como `completed`.

Executado em 2026-10-03: **3/3 passaram**.

## Edge cases cobertos

- fim de semana Sprint (estrutura sem FP2/FP3);
- GP cancelado (inclusive sem número de round);
- sessão/entrada sem horário;
- DST nas transições exatas;
- API offline/erro 500 (dados locais preservados);
- país sem broadcaster;
- temporada inexistente (UI mostra estado vazio, não tela em branco);
- idioma do sistema não suportado (fallback `en`);
- calendário vazio.

## O que não é testado automaticamente

- Renderização de componentes (não há testes de UI com Testing Library);
- notificações/alarmes reais no dispositivo (requer build nativo);
- permissões de calendário e escrita de eventos;
- background task;
- builds Android/iOS completos (EAS) — o bundle JS é validado por `expo export` nos dois alvos.
