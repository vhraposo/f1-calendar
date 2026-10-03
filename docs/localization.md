# Localização

## Idiomas suportados

- `pt-BR` — português do Brasil
- `en` — inglês

## Resolução do idioma

`resolveLanguage(preference, deviceLanguageTags)`:

1. Preferência explícita `pt-BR` ou `en` sempre vence.
2. `system` → primeiro locale do dispositivo; se começar com `pt` → `pt-BR`, senão `en`.
3. Sem locale detectável → `en`.

A preferência é persistida em `expo-sqlite/kv-store` e alterada em Ajustes ou no Onboarding. A troca é imediata (sem reiniciar o app).

## Estrutura

```
src/i18n/
├── translations/en.ts        dicionário-fonte (define TranslationKey)
├── translations/pt-BR.ts     tipado como Record<TranslationKey, string>
├── index.ts                  resolveLanguage + translate (interpolação {param})
├── session-labels.ts         nomes e siglas de sessões
└── app-metadata.pt-BR.json   textos de permissão iOS localizados
```

## Garantias

- **Sem strings na UI**: todos os componentes usam `useTranslation().t('chave')`.
- **Chaves tipadas**: `TranslationKey` é `keyof typeof en`; uma chave inexistente é erro de compilação.
- **Paridade garantida**: `ptBR` é `Record<TranslationKey, string>` — o TypeScript exige todas as chaves, e um teste (`i18n.test.ts`) confirma que os dicionários têm exatamente o mesmo conjunto.
- **Interpolação**: `t('calendar.round', { round: 24 })` → `Etapa 24`.
- **Fallback**: chave ausente cai para `en`; parâmetro ausente mantém `{param}` literal.

## O que é traduzido

- Toda a interface, estados, erros, acessibilidade e conteúdo de notificações.
- Nomes de sessões (`Treino Livre 1`, `Classificação Sprint`, `Corrida`).
- Siglas (`TL1`, `CS`, `CL`, `COR` em pt-BR; `FP1`, `SQ`, `Q`, `RACE` em inglês).

## O que não é traduzido

- **Nomes oficiais dos Grands Prix** (`São Paulo Grand Prix`, `Australian Grand Prix`) — vêm da API e são mantidos como oficiais.
- Nomes de circuitos e cidades.
- Nomes de emissoras.

## Formatação de datas

`Intl.DateTimeFormat` com o locale ativo e timezone explícito:

- `pt-BR`: `sáb.`, `6 de nov.`
- `en`: `Sat`, `6 Nov`

## Formatação de números

Contagens simples usam interpolação (`{count} corridas`). Sem separadores complexos no MVP.

## Metadados do app

`app.json` registra `locales` apontando para `src/i18n/app-metadata.pt-BR.json`, que localiza o nome do app e a mensagem de permissão de calendário no iOS via prebuild.
