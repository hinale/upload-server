# Upload Server — Resumo do repositório

## O que é

Backend **API REST** para upload, listagem e exportação de imagens. As imagens são enviadas para storage em nuvem (Cloudflare R2, compatível com S3) e os metadados são persistidos em PostgreSQL.

---

## Tecnologias

| Área | Tecnologia |
|------|------------|
| **Runtime** | Node.js (ESM) |
| **HTTP** | Fastify 5 |
| **Validação** | Zod + fastify-type-provider-zod |
| **Banco de dados** | PostgreSQL + Drizzle ORM |
| **Storage** | AWS SDK (S3) → Cloudflare R2 |
| **Documentação API** | Swagger/OpenAPI (@fastify/swagger + swagger-ui) em `/docs` |
| **Testes** | Vitest (E2E/integração) |
| **Lint/Format** | Biome |
| **CI** | GitHub Actions (testes em PR para `main`) |
| **Container** | Docker Compose (PostgreSQL) |

---

## Métodos e padrões

- **Arquitetura em camadas**: `app/functions` (regras de negócio), `infra` (HTTP, DB, storage).
- **Either (functional error handling)**: funções de aplicação retornam `Either<Erro, Sucesso>` em vez de lançar exceções; erros de domínio são tratados de forma explícita.
- **Validação com Zod**: entrada das rotas e das funções de aplicação validada com schemas Zod.
- **Streaming**: upload de arquivos e exportação CSV usando streams do Node.js (evita carregar tudo em memória).
- **IDs**: UUIDv7 para chave primária da tabela de uploads.

---

## Funcionalidades implementadas

1. **Upload de imagem** (`POST`)  
   - Multipart; aceita apenas `image/jpg`, `image/jpeg`, `image/png`, `image/webp`.  
   - Salva arquivo no R2 e metadados (nome, `remoteKey`, `remoteURL`) no PostgreSQL.

2. **Listar uploads** (`GET`)  
   - Paginação (`page`, `pageSize`).  
   - Busca por nome (`searchQuery`).  
   - Ordenação por `createdAt` (asc/desc).  
   - Retorna lista de uploads e total de registros.

3. **Exportar uploads** (`GET`)  
   - Filtro opcional por nome.  
   - Gera CSV em streaming a partir do banco, envia para o R2 e retorna a URL do arquivo para download.

---

## Estrutura de pastas (resumida)

```
src/
├── app/functions/          # Casos de uso (upload, get-uploads, export-uploads)
│   └── errors/             # Erros de domínio (ex.: InvalidFileFormat)
├── infra/
│   ├── db/                 # Drizzle: conexão, schemas, migrations
│   ├── http/               # Fastify: server, rotas, Swagger
│   └── storage/            # Cliente S3/R2 e upload em stream
├── shared/                 # Either e helpers
└── test/factories/         # Factories para testes
```

---

## Como rodar

- **Banco**: `docker-compose up -d` (PostgreSQL na porta 5432).
- **App**: configurar `.env` (DB + variáveis R2/Cloudflare) e `npm run dev` (servidor na porta 3333).
- **Testes**: `npm run test` (usa `.env.test` e roda migrations antes).
- **Documentação da API**: com o servidor rodando, acessar `http://localhost:3333/docs`.

---

## Relação com o curso

Este repositório corresponde às aulas de **backend fullstack**: API com Fastify, persistência com Drizzle, storage com R2/S3, validação com Zod, tratamento de erros com Either e testes com Vitest.
