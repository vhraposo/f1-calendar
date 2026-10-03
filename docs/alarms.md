# Alarmes

## Abstração

```ts
interface AlarmScheduler {
  getCapabilities(): AlarmCapabilities;
  getPermissionStatus(): Promise<PermissionStatus>;
  requestPermission(): Promise<PermissionStatus>;
  reconcile(planned, buildContent): Promise<ReconcileResult>;
  cancelAll(): Promise<void>;
  listScheduledAlarmIds(): Promise<string[]>;
  openSystemAlarmSettings(): Promise<void>;
}
```

A UI não conhece a implementação. Hoje existe uma implementação (`NotificationBackedAlarmScheduler`); a arquitetura permite plugar um módulo AlarmKit nativo sem tocar nas telas.

## Capacidades detectadas

```ts
getAlarmCapabilities()
```

| Plataforma | exactAlarms | nativeSystemAlarm | bypassDnd | Observação |
| --- | --- | --- | --- | --- |
| Android | sim | não | sim | canais de importância máxima + agendamento exato |
| iOS | sim | não | não | notificações `timeSensitive` |
| outros | não | não | não | recurso indisponível, UI degrada com aviso |

## Implementação Android

- Canal `race-alarms` com `importance: MAX`, `bypassDnd: true`, vibração forte e visibilidade pública na lockscreen.
- Agendamento exato via AlarmManager (interno ao expo-notifications). A permissão `android.permission.SCHEDULE_EXACT_ALARM` está declarada em `app.json`.
- Android 12+: o usuário pode precisar conceder o acesso especial "Alarmes e lembretes". A tela de Ajustes mostra o botão **"Permitir alarmes e lembretes"**, que abre `android.settings.REQUEST_SCHEDULE_EXACT_ALARM` via `expo-intent-launcher`.
- Não usamos `USE_EXACT_ALARM` porque a política da Google Play restringe essa permissão a apps cuja função principal é despertador/calendário; `SCHEDULE_EXACT_ALARM` é a via correta e declarada.

## Implementação iOS

- Notificações locais com `interruptionLevel: 'timeSensitive'` e som padrão.
- Não atravessa o modo silencioso/Focus por padrão (depende das configurações do usuário para notificações time-sensitive).
- **AlarmKit (iOS 26+) não está embarcado**: exigiria um módulo nativo em Swift. Escrever esse módulo sem poder compilar/testar (ambiente Windows, sem Xcode) violaria o requisito de não declarar sucesso sem evidência. O ponto de extensão `AlarmScheduler` está pronto; a integração está documentada como próximo passo.

## Fluxo de permissão

1. Usuário liga "Alarmes" em Ajustes (ou Onboarding).
2. `alarmScheduler.requestPermission()` cria o canal (Android) e pede permissão de notificação.
3. Negado → mensagem clara na tela, nada é agendado, o app continua funcional.
4. Aceito → `applyReminderSettings` persiste e reconcilia os alarmes planejados.

## Identificadores e reconciliação

- ID determinístico: `{sessionId}-alarm-{lead}m` (ex.: `2026-24-race-alarm-30m`).
- Mesmo algoritmo de reconciliação das notificações, filtrando `content.data.kind === 'alarm'` — os dois tipos nunca se misturam nem duplicam.

## Limitações declaradas

| Limitação | Impacto | Mitigação |
| --- | --- | --- |
| Sem AlarmKit nativo no iOS | alarme não toca em modo silencioso/Focus | notificação time-sensitive + som; documentado |
| Android pode atrasar sem acesso especial | alarme impreciso | botão para conceder o acesso; aviso na UI |
| Fabricantes agressivos (Doze/kill) | atraso ou supressão | canal `bypassDnd`, documentado em dontkillmyapp.com |
| Web/tvOS | sem alarme | `getCapabilities()` informa e a UI oculta/avisa |
