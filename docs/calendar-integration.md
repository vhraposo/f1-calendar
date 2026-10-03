# Integração com o calendário do dispositivo

## Biblioteca

`expo-calendar`, usando a **Next API** (estável desde o SDK 56, orientada a objetos). As funções antigas (`createEventAsync`, `getEventsAsync`, ...) estão deprecated e lançam em runtime — não são usadas.

## Permissões

| Plataforma | Permissão | Observação |
| --- | --- | --- |
| iOS | `requestCalendarPermissions(true)` (write-only) | só cria eventos; não lê o calendário inteiro |
| Android | `requestCalendarPermissions(true)` | leitura/escrita para localizar/criar o calendário do app |

O `app.json` configura o plugin `expo-calendar` com `writeOnlyAccess: true` e mensagens de permissão (localizadas via `src/i18n/app-metadata.pt-BR.json`).

## Calendário próprio

O app localiza (ou cria) um calendário chamado **"F1 Calendar"**, cor `#E10600`. Assim os eventos ficam agrupados e o usuário pode ocultá-los/removê-los facilmente.

## Criação de eventos

- **Sessão individual** ou **fim de semana inteiro** — sempre por ação explícita.
- Título: `{Sessão} – {Grand Prix}` no idioma ativo.
- Início: instante UTC da sessão. Fim: duração nominal (`session-duration.ts`) — a API não fornece fim.
- `timeZone`: timezone IANA do circuito (o evento aparece no horário correto independentemente do fuso do dispositivo).
- Local: circuito + cidade.
- Alarme do evento: 10 minutos antes.
- Notas: `{GP}\n[f1calendar:{sessionId}]`.

## Deduplicação

O usuário pode tocar várias vezes em "Adicionar ao calendário". O app evita duplicatas por dois mecanismos:

1. **Tabela `calendar_links`** (SQLite): `session_id → event_id, calendar_id`. Consultada antes de criar.
2. **Marcador nas notas** (`[f1calendar:{sessionId}]`) como fallback de auditoria.

Na remoção, o evento é localizado por ID no calendário e apagado, e o vínculo é removido. Com permissão write-only no iOS a leitura pode falhar — nesse caso o vínculo local é removido e nenhum erro é lançado (o evento pode continuar no calendário; o usuário pode apagá-lo manualmente). Documentado como limitação.

## Consentimento

- O botão "Adicionar ao calendário" só existe em telas de sessão/GP e exige toque.
- Ao primeiro evento criado com sucesso, a preferência `calendarIntegrationEnabled` é marcada como `true`.
- Nenhum evento é criado em background ou automaticamente.

## Limitações

| Limitação | Impacto | Mitigação |
| --- | --- | --- |
| iOS write-only não lê eventos | remoção pode não localizar o evento | vínculo local removido; usuário pode apagar manualmente |
| Duração nominal | evento pode terminar antes/depois do real | valores conservadores por tipo, documentados |
| Calendários de conta corporativa | criação pode falhar | erro capturado; usuário escolhe outro calendário do sistema manualmente |
| Android sem app de calendário | `isAvailableAsync` falso | UI pode ser desabilitada sem quebrar |
