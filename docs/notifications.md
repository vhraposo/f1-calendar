# Notificações

## Biblioteca

`expo-notifications`, apenas **notificações locais** (sem servidor, sem push remoto no MVP). Não há coleta de token nem backend.

## Canais Android

| Canal | ID | Configuração |
| --- | --- | --- |
| Lembretes | `session-reminders` | importância `HIGH`, vibração `[0,200,120,200]`, cor `#E10600`, visível na lockscreen |
| Alarmes | `race-alarms` | importância `MAX`, `bypassDnd`, vibração `[0,600,300,600,300,600]`, lockscreen pública |

Os canais são criados antes de pedir permissão (exigência do Android 13+).

## IDs determinísticos

```
{sessionId}-{lead}m            → 2026-24-race-60m
{sessionId}-{lead}m            → 2026-24-qualifying-15m
{sessionId}-alarm-{lead}m      → 2026-24-race-alarm-30m
```

`sessionId` é determinístico (`{ano}-{round}-{tipo}`), então o mesmo lembrete sempre gera o mesmo ID — em qualquer dispositivo, reinstalação ou sincronização.

O `expo-notifications` não aceita ID customizado em `scheduleNotificationAsync`; por isso o ID semântico vai em `content.data.reminderId` e a reconciliação usa esse campo como chave. O comportamento observável é o mesmo: **nunca existem duas notificações para o mesmo lembrete**.

## Reconciliação (sem duplicatas)

`reconcileSessionReminders` (src/notifications/reminder-reconciliation.ts):

1. Se `notificationsEnabled = false` → cancela todos os lembretes.
2. Se `alarmsEnabled = false` → cancela todos os alarmes.
3. Lê as próximas sessões do SQLite.
4. `planSessionReminders` (domínio, puro) gera o plano determinístico.
5. `SessionNotificationScheduler.reconcile`:
   - cancela notificações do tipo cujo `reminderId` saiu do plano;
   - mantém as que já existem;
   - agenda apenas as que faltam, com gatilho `DATE` no instante calculado.
6. Conteúdo montado com i18n + emissora (quando existir).

Gatilhos a menos de 30 segundos do presente são ignorados. Chamadas repetidas são idempotentes.

## Limites respeitados

| Limite | Valor | Estratégia |
| --- | --- | --- |
| iOS — notificações pendentes | 64 por app | máximo de 56 agendadas (`maxScheduledReminders`) |
| Horizonte de agendamento | — | apenas sessões nos próximos 60 dias |
| Android — agendamento exato | Android 12+ | permissão `SCHEDULE_EXACT_ALARM` declarada no `app.json`; atalho para "Alarmes e lembretes" |
| Android — notificações | Android 13+ | permissão solicitada após criar o canal |

Nunca agendamos "todas as sessões de todas as temporadas": o plano é limitado por proximidade.

## Conteúdo

```
Título: Qualificação em 1 hora
Corpo:  GP de São Paulo
        sáb. · 18:00
        Assista no sportv        ← apenas se houver emissora
```

O corpo usa o fuso do dispositivo e o idioma ativo. Se a informação de transmissão não existir, a linha não é incluída.

## Deep link

`content.data.url = /session/{sessionId}`. O root layout escuta `addNotificationResponseReceivedListener` e `getLastNotificationResponse`, navegando direto para a sessão.

## Preferências

- Master: `notificationsEnabled` / `alarmsEnabled`.
- Por tipo de sessão: liga/desliga + múltiplos "avisar antes" (`1440`, `60`, `30`, `15` minutos).
- Alarmes têm lead próprio por tipo (padrão 30min para corrida, 15min para as demais).

## Ciclo de vida

- Ao final de cada sincronização, os lembretes são reconciliados.
- Ao alterar qualquer preferência, a reconciliação roda imediatamente.
- Background task (6h) sincroniza e reconcilia quando o sistema permite.
- O countdown é recalculado ao focar a tela e ao voltar do background — não há timer global.
