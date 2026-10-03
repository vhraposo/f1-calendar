# Fontes de dados

Pesquisa realizada em 2026-10-03, com verificação ao vivo dos endpoints e leitura da documentação oficial de cada fonte.

## Comparação

| Fonte | Calendário | Sessões | Histórico | Sprint | Circuitos | Atualização | Licença | Risco |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Jolpica F1** (`api.jolpi.ca`) — alpha schedules | Sim (por temporada) | Sim, com UTC + IANA | 1950–presente (77 temporadas) | Sim (`SQ`, `SR`) | Sim (lat/long, país, localidade) | Diária/por evento | Open source; dados factuais | Médio: endpoint "alpha" pode mudar |
| **Jolpica F1** — Ergast `/ergast/f1` | Sim | Parcial (sem IANA, sem `is_cancelled` por sessão) | 1950–presente | Sim | Sim | Igual | Estável, mas será depreciado | Médio |
| **Formula1.com** (site oficial) | Sim (HTML) | Sim (HTML) | Sim | Sim | Sim | Imediata | Proprietária; sem API pública documentada | Alto para automação (scraping/ToS) |
| **OpenF1** (`api.openf1.org`) | Parcial | Sim (telemetria) | Somente 2023+ | Sim | Sim | Tempo real | Uso pessoal/não comercial | Alto para calendário (sem histórico, foco em telemetria) |
| **F1 Telemetry API** (GitHub Pages) | Parcial | Não | Parcial | Sim | Não | Comunitária | Open source | Alto (estático, mantido por um autor) |

## Verificação da fonte oficial (Formula1.com)

- O site oficial **não publica API pública documentada**. Os endpoints internos usados pelo site/app exigem chaves privadas e não são licenciados para uso de terceiros.
- Scraping do site oficial foi **descartado** como fonte de calendário: fragilidade de HTML, termos de uso restritivos e risco de bloqueio.
- A única informação extraída do site oficial é a **lista de transmissão por território**, que é conteúdo editorial estável e publicado justamente para consulta pública. Essa extração é manual, versionada e datada — não é scraping em runtime. Ver [broadcast-data.md](broadcast-data.md).

## Por que a Jolpica é a fonte primária

1. **Estrutura**: o endpoint `GET /f1/alpha/schedules/{year}/` entrega rounds, circuitos e sessões em uma única resposta.
2. **Horários corretos**: cada sessão traz `timestamp` em UTC **e** `timezone` IANA (`Australia/Melbourne`), o que dispensa heurísticas de offset.
3. **Sprint dirigido por dados**: os códigos `SQ`/`SR` aparecem apenas quando existem; nada é presumido.
4. **Cancelamentos**: `is_cancelled` no round e nas sessões (ex.: GP da Arábia Saudita 2026).
5. **Histórico**: 77 temporadas (1950–2026), com timestamps presentes inclusive em 1950.
6. **Manutenção**: sucessora oficial da Ergast, repositório ativo, documentação pública e API compatível.
7. **Custo**: gratuita, sem chave, com limites claros.

## Rate limits e conformidade

- Limites atuais: **4 req/s** (burst) e **500 req/h** (sustentado).
- Exigência: **User-Agent identificável**. O app envia `F1Calendar/1.0.0 (Expo; React Native)`.
- Estratégia: cache local de 6 horas; no máximo 2 requisições por sincronização (lista de temporadas + temporada atual); sem polling.
- Erros 429/5xx são tratados com retry exponencial (2 tentativas) e nunca apagam dados locais.

## Endpoints usados

| Uso | Endpoint | Observação |
| --- | --- | --- |
| Lista de temporadas | `GET /f1/alpha/schedules/` | 77 itens, `data[].year` |
| Calendário completo | `GET /f1/alpha/schedules/{year}/` | rounds + circuitos + sessões + timezone + laps |

## Campos mapeados para o domínio

| API | Domínio |
| --- | --- |
| `round.number` / `round.name` / `round.is_cancelled` | `GrandPrix.round`, `GrandPrix.name`, `GrandPrix.isCancelled` |
| `circuit.id`, `circuit.country_code`, `locality`, `latitude`, `longitude` | `Circuit.*` |
| `schedule[].code` (`FP1`, `FP2`, `FP3`, `SQ`, `SR`, `Q`, `R`) | `Session.type` (`PRACTICE_1`...`RACE`, `OTHER` para códigos futuros) |
| `schedule[].timestamp` | `Session.startAt` (UTC ISO) |
| `schedule[].timezone` | `Session.timezone` (IANA) |
| `sessions[].scheduled_laps` (corrida) | `Session.scheduledLaps`, `Circuit.laps` |

## Limitações conhecidas da fonte

- Não fornece **comprimento do circuito** nem distância da corrida — os campos existem no domínio e ficam `null`/“Não disponível”.
- Não fornece fim de sessão — o app usa durações nominais (`src/domain/services/session-duration.ts`).
- Endpoint marcado como "alpha": mudanças podem ocorrer. A abstração `F1DataProvider` e os testes de mapper isolam o impacto.
- Em 2026, o GP da Arábia Saudita aparece cancelado sem número de round; o mapper trata esse caso com ID determinístico (`2026-cancelled-*`).

## Licenças das bibliotecas principais

| Biblioteca | Licença |
| --- | --- |
| expo / expo-* | MIT |
| react / react-native | MIT |
| expo-router | MIT |
| nativewind | MIT |
| tailwindcss | MIT |
| react-native-svg | MIT |
| jest-expo | MIT |

Nenhum asset proprietário da F1 é distribuído. O ícone e o splash são desenhos próprios (faixas vermelhas + quadriculado), sem logotipos oficiais.
