# Bot SS com Echo Scanner

Bot Discord em TypeScript para equipe de SS/telagem de FiveM com painel fixo, geração privada de chave, acompanhamento em canal separado, polling automático e persistência em PostgreSQL com Prisma.

## Stack

- Node.js 22
- TypeScript
- discord.js v14
- PostgreSQL
- Prisma
- Docker e Docker Compose

## Fluxo

1. O bot garante um painel fixo no canal configurado em `KEY_PANEL_CHANNEL_ID`.
2. O botão `Gerar chave` valida o cargo do staff e abre um seletor privado de jogo.
3. O bot gera um PIN temporário na Echo Scanner para o jogo escolhido, persiste o caso e responde em mensagem ephemeral.
4. Uma mensagem de acompanhamento é criada no canal configurado em `TRACKING_CHANNEL_ID`.
5. O job de polling consulta periodicamente a API da Echo, procura o scan pelo PIN e depois carrega o detalhe por `scanID`.
6. Quando o scan termina, o painel de acompanhamento é atualizado e o botão `Ver resultado` é habilitado somente para visualização privada.

## Estrutura

```text
src/
  bot.ts
  config/env.ts
  database/prisma.ts
  interactions/buttonHandler.ts
  interactions/buttonHandler/
  jobs/scanPoller.job.ts
  jobs/scanPoller.job/
  panels/keyPanel.ts
  panels/keyPanel/
  panels/trackingPanel.ts
  panels/trackingPanel/
  services/echo.service/
  services/permission.service/
  services/scan.service/
  types/scan.ts
  utils/logger.ts
```

## Variáveis de ambiente

Use o arquivo `.env.example` como base.

Para o Prisma usar um schema específico do PostgreSQL, inclua o parâmetro na própria `DATABASE_URL`, por exemplo:

```text
postgresql://postgres:postgres@localhost:5432/bot_ss?schema=public
```

O campo `DATABASE_SCHEMA` foi mantido para padronização operacional do projeto, mas o Prisma lê o schema efetivo a partir da URL de conexão.

No startup do bot, a aplicação também tenta executar `CREATE SCHEMA IF NOT EXISTS` com base em `DATABASE_SCHEMA`. Se o usuário do Postgres não tiver permissão para criar schema, será necessário conceder a permissão no banco antes do primeiro uso.

## Subida local

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Docker

```bash
docker compose up --build
```

## Observações sobre Echo Scanner

O projeto usa os endpoints documentados oficialmente:

- `GET /v1/user/pin`
- `GET /v1/scan/{pin}`
- `GET /v1/scan/{scanID}`

O header de autenticação é `Authorization: SUA_API_KEY`, sem prefixo Bearer.