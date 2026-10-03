# Build e distribuição

## Perfis EAS (`eas.json`)

| Perfil | Distribuição | Saída Android | Canal OTA | Uso |
| --- | --- | --- | --- | --- |
| `development` | interna | APK | `development` | dev client com módulos nativos |
| `preview` | interna | APK | `preview` | teste em dispositivos reais |
| `production` | lojas | AAB | `production` | publicação, `autoIncrement` |

## Pré-requisitos

- Conta Expo/EAS (`npx eas-cli@latest login`).
- `npx eas-cli@latest init` para gravar o `projectId` no `app.json` (não incluído no repositório).
- Android: nada local é necessário para EAS Build.
- iOS: conta Apple Developer para build de produção e `eas submit`.

## Comandos

```bash
# Android
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile preview --platform android
npx eas-cli@latest build --profile production --platform android

# iOS
npx eas-cli@latest build --profile development --platform ios
npx eas-cli@latest build --profile production --platform ios

# Publicação
npx eas-cli@latest submit --platform android
npx eas-cli@latest submit --platform ios

# Atualizações OTA
npx eas-cli@latest update --channel preview --message "fix: ..."
```

## O que roda no Windows

| Tarefa | Windows | Observação |
| --- | --- | --- |
| Metro / Expo start | sim | |
| Typecheck, lint, testes | sim | |
| Bundle JS (`expo export`) | sim | use `--no-bytecode` se o caminho tiver acentos; o EAS gera bytecode |
| Build Android local (`expo run:android`) | sim | requer Android SDK |
| Build Android via EAS | sim | recomendado |
| Build iOS via EAS | sim | na nuvem |
| Build iOS local | **não** | requer macOS + Xcode 26.4+ |
| Simulador iOS | **não** | requer macOS |
| Testes em dispositivo iOS | sim | development build via EAS + QR/ad hoc |

## Configuração nativa

- CNG (Continuous Native Generation): `ios/` e `android/` são gerados; nunca editar à mão.
- `app.json` define: bundle id `app.f1calendar.mobile`, dark mode forçado, ícones/splash próprios, permissões Android (`SCHEDULE_EXACT_ALARM`, `POST_NOTIFICATIONS`, `VIBRATE`, `RECEIVE_BOOT_COMPLETED`) e plugins (`expo-notifications`, `expo-calendar`, `expo-sqlite`, `expo-background-task`, `expo-localization`, `expo-splash-screen`, `expo-router`).
- `experiments.reactCompiler: true` e `typedRoutes: true`.

## Atualizações OTA

Com `channel` configurado nos perfis, correções de JS (ex.: atualizar a lista de transmissão) podem ser entregues por `eas update` sem novo binário, desde que não mudem código nativo.

## Checklist antes de publicar

1. `npm run typecheck && npm run lint && npm test`
2. `npx expo-doctor` → 21/21
3. `npx eas-cli@latest build --profile production` para Android e iOS
4. Testar deep links de notificação em build release
5. Revisar política de privacidade e declaração de `SCHEDULE_EXACT_ALARM` no Play Console
6. Atualizar o snapshot de transmissão se a temporada mudou
