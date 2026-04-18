# Backend — ScraperCar

API orquestradora do ScraperCar. Toda decisão do sistema passa por aqui:
autenticação, agendamento dos jobs de scraping, chamada ao Worker, envio de
mensagens via WppConnect, persistência de alertas e anúncios.

> 📖 Contexto completo do sistema no [README raiz](../README.md).

---

## 🧰 Stack

| Camada | Tecnologia | Observação |
|---|---|---|
| Runtime | **Java 25** | LTS atual |
| Framework | **Spring Boot 4.0.3** | Web MVC + WebFlux (para `WebClient`) |
| ORM | Spring Data JPA / Hibernate | `ddl-auto=update` |
| Banco | PostgreSQL | Driver JDBC |
| Scheduler | **Quartz** | `job-store-type=jdbc` (persistente) |
| HTTP client | **WebClient** (WebFlux) | Chamadas não-bloqueantes ao Worker e WppConnect |
| Rate limiting | **Bucket4j** | Protege endpoints de auth, por IP |
| Auth | **Spring Security + JJWT** | JWT + refresh + pepper |
| Tipos JPA avançados | Hypersistence Utils | Suporte a JSONB, arrays Postgres |
| E-mail | Resend Java SDK | Transacional |
| Boilerplate | Lombok | |

---

## 📂 Estrutura de pacotes

```
com.august.ScraperCar/
├── config/        # SecurityConfig, WebClientConfig, QuartzConfig, CorsConfig, VeiculoDataConfig
├── controller/
│   ├── admin/         # Endpoints /admin/** (ROLE_ADMIN)
│   └── healthcheck/   # Endpoints /health/**
├── dto/
│   ├── admin/
│   ├── alerts/
│   ├── authentication/
│   ├── exception/
│   ├── scraper/
│   └── wpp/
├── exception/     # BusinessException + GlobalExceptionHandler
├── model/         # Entidades JPA (8 tabelas)
├── repository/    # Spring Data repositories
├── service/
│   ├── ad/            # AdProcessorService (decide quem notificar)
│   ├── admin/
│   ├── authentication/ # JwtService, UserService, RateLimitFilter
│   ├── health/
│   ├── scraper/       # ScrapingService + integração com worker
│   └── wpp/           # WhatsAppService + VerifyService
└── util/          # Pepper, Cookie
```

E em `src/main/resources/`:
- `application.properties` — perfil default (produção)
- `application-local.properties` — perfil de dev (não commitado)
- `quartz.properties` — 5 threads, instanceId AUTO
- `veiculos.json` — hierarquia de marcas → modelos → versões → anos

---

## 🚀 Perfis de execução

O Backend tem dois perfis:

- **`local`** (`application-local.properties`) — usado no IntelliJ apontando
  para dependências externas via `localhost`. As dependências (Postgres,
  Worker, WppConnect) sobem via Compose; apenas o Backend roda fora.
- **default** (`application.properties`) — usado dentro do contêiner via
  Compose, lê variáveis de ambiente injetadas.

> ⚠️ `application-local.properties` contém segredos e não é commitado.

---

## 🗄 Inicialização do schema

Duas classes de tabelas convivem no mesmo banco:

| Classe | Quem cria |
|---|---|
| **Tabelas de aplicação** (`users`, `user_alerts`, `scrape_cache`…) | Hibernate, via `spring.jpa.hibernate.ddl-auto=update` |
| **Tabelas do Quartz** (11 tabelas `qrtz_*`) | DDL manual, rodado uma vez em banco novo |

A propriedade `spring.quartz.jdbc.initialize-schema=never` impede que o Spring
tente recriar as tabelas do Quartz a cada subida. O DDL oficial para Postgres
está em
[`quartz-core/src/main/resources/org/quartz/impl/jdbcjobstore/tables_postgres.sql`](https://github.com/quartz-scheduler/quartz/blob/main/quartz-core/src/main/resources/org/quartz/impl/jdbcjobstore/tables_postgres.sql).

---

## 🔐 Modelo de autenticação

Três camadas complementares, cada uma cobrindo uma falha da outra:

| Camada | O que faz | Propriedade |
|---|---|---|
| **Access token (JWT)** | Identifica o usuário em cada request. Curto (~15 min). Assinado com HMAC-SHA. Carrega `email`, `role`, `type=access` e `verificado`. | `security.jwt.*` |
| **Refresh token** | Renova o access sem pedir senha. Armazenado em cookie `HttpOnly` + `Secure` em prod, `path=/auth/refresh`. Longo (~30 dias). | `security.refresh.*` |
| **Pepper** | String secreta concatenada à senha antes do hash. Mora fora do banco — se o DB vazar, ainda precisa do pepper pra fazer cracking. | `security.pepper` |
| **Argon2id** | Algoritmo de hash da senha. Configurado com `salt=16, hash=32, paralelismo=1, memória=64MB, iterações=3`. Resistente a ataques de GPU/ASIC. | `SecurityConfig` |

Endpoints públicos (login, cadastro, refresh) são protegidos por **Bucket4j +
Caffeine**: 10 requisições por IP a cada 2 minutos, com cache expirando em 1
hora de inatividade. O IP real é extraído do header `X-Forwarded-For` para
funcionar atrás de proxies reversos.

O `JwtAuthFilter` bloqueia com **403** qualquer requisição de usuário com
`verificado=false` em rotas não-públicas — exceto as rotas do próprio fluxo
de verificação.

Detalhes da justificativa em
[`docs/architecture.md`](../docs/architecture.md#jwt--refresh-token--pepper).

---

## 🌐 Endpoints

| Grupo | Rotas principais | Proteção |
|---|---|---|
| **Auth** | `POST /auth/cadastro`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/resetsenha/solicitar`, `POST /auth/resetsenha/confirmar` | Pública + Rate limit (10 req/2min por IP) |
| **Verify** | `GET /verify/status`, `POST /verify/gerar`, `POST /verify/trocar-numero` | Pública / JWT parcial |
| **Webhook** | `POST /webhook/wpp` | Pública (chamada pelo WppConnect) |
| **Alerts** | `POST /alerts/create`, `GET /alerts`, `PATCH /alerts/toggle/{id}`, `DELETE /alerts/{id}` | JWT (usuário verificado) |
| **Admin** | `GET /admin/users/all`, `GET /admin/alert/all`, `DELETE /admin/alert/{id}`, `GET /admin/job/all` | ROLE_ADMIN |
| **Health** | `GET /health/api`, `GET /health/worker`, `GET /health/wpp` | Pública |

### 📖 Documentação da API (Swagger UI)

Os endpoints são documentados automaticamente via **springdoc-openapi**.
Com o Backend no ar:

- **Swagger UI**: http://localhost:8080/swagger-ui/index.html
- **Spec OpenAPI (JSON)**: http://localhost:8080/v3/api-docs
