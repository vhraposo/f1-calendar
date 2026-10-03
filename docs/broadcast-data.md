# Onde assistir (Broadcast Information)

## Origem dos dados

Não existe API pública estruturada de transmissão da Formula1.com. A fonte autoritativa é a página oficial:

`https://www.formula1.com/en/information/f1-broadcast-information.45y3LNsT1D6VoK0ZmX8ciJ`

Em **2026-10-03**, essa página foi extraída (68 territórios, 99 emissoras/plataformas) e transformada no dataset versionado `src/data/broadcast/broadcast-seed.ts`. A extração é um procedimento manual e datado — **não há scraping em runtime**.

Cada registro contém:

| Campo | Descrição |
| --- | --- |
| `id` | `broadcast-{ano}-{territorio}-{n}` |
| `seasonYear` | 2026 (ou `null` para regras gerais) |
| `countryCode` | ISO2 ou região (`LATAM`, `MENA`, `AFRICA`, `CARIBBEAN`, `EURASIA`, `INTL_TRANSPORT`) |
| `sessionType` | `null` = todas as sessões |
| `broadcaster` | Nome da emissora/serviço |
| `platform` | `streaming` quando o nome é um serviço de streaming conhecido; `unknown` caso contrário (não inventamos classificação) |
| `streamingService` | Preenchido quando `platform = streaming` |
| `availability` | `unknown` — a página oficial não informa live/highlights por emissora |
| `source` | URL da página oficial |
| `validFrom` / `validUntil` | `2026-01-01` / `2026-12-31` |

## Seleção no app

`selectBroadcasters(entries, { countryCode, seasonYear, sessionType, now })`:

1. filtra por país (case-insensitive);
2. filtra pela janela `validFrom <= now <= validUntil`;
3. aceita registros com `seasonYear` igual ao consultado ou `null` (genérico);
4. aceita registros com `sessionType` igual ou `null` (todas as sessões);
5. ordena por especificidade (temporada > sessão > disponibilidade `live`);
6. remove duplicatas por emissora+plataforma.

O país do usuário vem de: preferência manual (`settings.countryCode`) → região do dispositivo (`expo-localization.regionCode`) → nenhum (mostra "sem informação para seu país").

## Como atualizar (manutenção)

1. Abrir a página oficial de broadcast information.
2. Reexecutar a extração e regenerar `broadcast-seed.ts` (mesma estrutura, novos `id`/`validFrom`/`validUntil`).
3. Atualizar `BROADCAST_DATA_SOURCE` / `BROADCAST_DATA_VALID_FROM` / `BROADCAST_DATA_VALID_UNTIL`.
4. `npm test` — os testes de seleção cobrem validade, especificidade e dedupe.
5. Publicar via EAS Update (OTA) ou novo build.

> O `SyncService.ensureBroadcastSeed()` semeia a tabela `broadcasts` apenas quando ela está vazia, para não sobrescrever dados mais novos.

## Exemplos reais do snapshot 2026

| Território | Emissoras |
| --- | --- |
| Brazil | TV Globo, sportv |
| USA | Apple TV |
| United Kingdom & Republic of Ireland | Sky Sports, Channel 4 |
| Japan | Fuji TV |
| Australia | Fox Sports, Foxtel, Kayo |
| Portugal | DAZN |
| Germany | Sky Deutschland, RTL |
| Canada | RDS, RDS 2, TSN, Noovo |

## Limitações e honestidade

- A página oficial não informa disponibilidade (ao vivo/replay/highlights) por emissora — por isso `availability: unknown` e a UI não afirma nada além do nome.
- Direitos mudam no meio da temporada; o app mostra um aviso ("retrato da lista oficial... pode mudar") e a fonte.
- Países sem entrada recebem mensagem explícita em vez de dado inventado.
- Regras futuras (ex.: 2027) entram como novos registros com `seasonYear: 2027` — sem alteração de código.
