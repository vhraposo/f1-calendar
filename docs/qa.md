# QA

## Matriz de verificação

| Feature | Esperado | Verificado | Status | Plataforma |
| --- | --- | --- | --- | --- |
| Calendário 2026–1950 | 77 temporadas listadas | Integração ao vivo | PASS | API |
| Mapeamento de sessões | UTC + IANA + Sprint + cancelados | Unit + integração | PASS | API |
| Próxima corrida/sessão | Ignora cancelados, mantém ao vivo | Unit | PASS | Lógica |
| Timezones/DST | BR, JP, AU, UK, US, PT | Unit | PASS | Lógica |
| Countdown | Recalcula ao focar/voltar do background | Unit + revisão | PASS (lógica) | Lógica |
| IDs determinísticos | `2026-24-race-60m` | Unit | PASS | Lógica |
| Duplicação de lembretes | Reconciliação idempotente | Unit (planner) + revisão | PASS (lógica) | Lógica |
| Broadcast por país | Filtro + validade + especificidade | Unit | PASS | Lógica |
| i18n pt-BR/en | Paridade + fallback + seleção | Unit | PASS | Lógica |
| SyncService | Frescor, falha preserva dados, seed | Unit | PASS | Lógica |
| Bundle Android | 1988 módulos, 3.2MB | `expo export` | PASS | Android |
| Bundle iOS | 1988 módulos, 3.1MB | `expo export` | PASS | iOS |
| Dependências | 21/21 checks | `expo-doctor` | PASS | Projeto |
| Typecheck | 0 erros | `tsc --noEmit` | PASS | Projeto |
| Lint | 0 erros/avisos | `expo lint` | PASS | Projeto |
| Testes | 67/67 | `jest` | PASS | Projeto |
| Notificações locais | Agenda/cancela sem duplicar | Revisão de código | NÃO VERIFICADO EM DISPOSITIVO | Android/iOS |
| Permissão de notificação | Solicita no momento certo | Revisão de código | NÃO VERIFICADO EM DISPOSITIVO | Android/iOS |
| Alarme Android exato | Canal MAX + permissão | Revisão de código | NÃO VERIFICADO EM DISPOSITIVO | Android |
| Alarme iOS time-sensitive | Notificação com som | Revisão de código | NÃO VERIFICADO EM DISPOSITIVO | iOS |
| Integração com calendário | Cria/remove evento, dedupe | Revisão de código | NÃO VERIFICADO EM DISPOSITIVO | Android/iOS |
| Background task | Sync + reconciliação a cada ~6h | Revisão de código | NÃO VERIFICADO EM DISPOSITIVO | Android/iOS |
| Deep link de notificação | Abre `/session/{id}` | Revisão de código | NÃO VERIFICADO EM DISPOSITIVO | Android/iOS |
| Build nativo EAS | APK/IPA | Não executado (requer login EAS) | BLOQUEADO | Android/iOS |
| Offline real | Home abre com dados locais sem rede | Revisão de código + arquitetura | NÃO VERIFICADO EM DISPOSITIVO | Android/iOS |

## Como executar a QA em dispositivo

1. `npx eas-cli@latest build --profile development --platform android` (ou `preview`).
2. Instalar o build e abrir; concluir o onboarding escolhendo país e ativando notificações.
3. Verificar:
   - [ ] Home com próxima corrida e countdown andando;
   - [ ] Calendário com seções Upcoming/Completed;
   - [ ] Temporadas 2026→1950 (abrir uma antiga para baixar sob demanda);
   - [ ] Detalhes do GP com sessões, onde assistir e circuito;
   - [ ] Sessão com horário local + horário do circuito;
   - [ ] Adicionar sessão ao calendário do dispositivo (uma vez; repetir não duplica);
   - [ ] Adicionar fim de semana inteiro;
   - [ ] Alterar lembrete/alarme e conferir agendamento no sistema;
   - [ ] Ativar modo avião, reabrir o app: dados continuam visíveis com banner offline;
   - [ ] Tocar na notificação e cair na sessão correta;
   - [ ] Trocar idioma para EN e conferir toda a interface;
   - [ ] No Android 12+, negar "Alarmes e lembretes" e conferir aviso/botão.

## Limitações conhecidas (honestas)

| Limitação | Detalhe |
| --- | --- |
| AlarmKit iOS 26 | não embarcado; alarme usa notificação time-sensitive |
| Comprimento do circuito | API não fornece; campo exibido como "Não disponível" |
| Fim de sessão | nominal, não oficial |
| Disponibilidade de transmissão | página oficial não informa live/highlights; campo `unknown` |
| iOS write-only | remoção de evento pode depender do usuário |
| Bytecode Hermes no Windows | falha com caminho acentuado; EAS gera normalmente |
| Builds EAS | não executados nesta sessão (exigem conta/login) |
| Sem testes de UI | componentes não cobertos por Testing Library |
