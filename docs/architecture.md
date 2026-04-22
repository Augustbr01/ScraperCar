# Arquitetura do ScraperCar

Este documento descreve **por que** o sistema é estruturado do jeito que é. O [README](https://github.com/Augustbr01/ScraperCar/blob/develop/README.md) cobre o _o quê_ e o _como rodar_; este documento captura as decisões de design, os trade-offs conscientes e os pontos fracos conhecidos.

---

## Índice

- [Princípios norteadores](https://claude.ai/chat/83d05ef1-369d-488a-a33b-dd087198e0c2#princ%C3%ADpios-norteadores)
- [Componentes e por que existem](https://claude.ai/chat/83d05ef1-369d-488a-a33b-dd087198e0c2#componentes-e-por-que-existem)
- [Fluxos do sistema](https://claude.ai/chat/83d05ef1-369d-488a-a33b-dd087198e0c2#fluxos-do-sistema)
- [Modelo de dados](https://claude.ai/chat/83d05ef1-369d-488a-a33b-dd087198e0c2#modelo-de-dados)
- [Segurança](https://claude.ai/chat/83d05ef1-369d-488a-a33b-dd087198e0c2#seguran%C3%A7a)
- [Pontos fracos conhecidos](https://claude.ai/chat/83d05ef1-369d-488a-a33b-dd087198e0c2#pontos-fracos-conhecidos)

---

## Princípios norteadores

Três ideias estruturam o resto:

1. **Um único orquestrador.** Toda decisão com consequência — quem está autenticado, quando rodar scrape, para quem enviar notificação — passa pelo Backend. Worker e WppConnect são peões: executam comandos e devolvem resultados, não tomam decisões.

2. **Separação entre agendamento e execução.** O Backend agenda, decide e persiste. O Worker executa o scraping e esquece. Essa divisão permite evoluir o scraper sem tocar na lógica de negócio.

3. **Resiliência barata.** Jobs persistidos em banco, cache simples, autenticação com múltiplas camadas — componentes sem infra extra que evitam dor de cabeça em reinícios.


---

## Componentes e por que existem

### Backend Spring Boot (orquestrador)

É o único ponto onde decisões acontecem. Todo o resto do sistema é periférico.

A escolha do Spring Boot veio do contexto de estudo: aprender Java, arquiteturas e APIs. O Spring oferece um ecossistema maduro — Spring Security, Data JPA, Quartz como starter — que cobria as necessidades sem precisar "remontar peças". A alternativa teórica seria um gateway fino em outra linguagem e serviços que se chamam entre si, mas isso duplicaria autenticação em três stacks (Java, Python, Node) e espalharia a lógica de agendamento.

### Worker FastAPI (stateless)

O scraping vive num serviço separado em Python por duas razões práticas:

- **Ecossistema de scraping é muito mais rico em Python.** Bibliotecas, parsers, ferramentas prontas — se o ShopCar mudar o HTML, trocar de lib é barato.
- **Praticar comunicação entre APIs em linguagens diferentes** era um dos objetivos do projeto.

O Worker não toca no banco. Recebe filtros, devolve JSON, não persiste nada. Isso faz dele descartável: um restart não perde estado, e se o scraping virar gargalo dá pra subir N instâncias sem mudar código.

### WppConnect (externo)

Não foi escrito — é consumido. Roda em contêiner próprio e expõe uma API REST para envio de mensagens e um mecanismo de webhook para recepção.

Um detalhe importante da integração: o WppConnect é configurado com uma URL de webhook (apontando para `POST /webhook/wpp` do Backend). Quando sobe, ele tenta um handshake nessa URL — se o Backend não estiver no ar, o WppConnect loga erro no startup. Ou seja, a ordem esperada é: Backend primeiro, WppConnect depois.

Em produção "séria" a troca natural seria por uma API paga de WhatsApp Business — o WppConnect depende de automação do WhatsApp Web, o que é frágil por natureza.

### Postgres

Armazena tudo que precisa sobreviver a restart: usuários, alertas, jobs compartilhados, anúncios já enviados, cache de scrape. Também hospeda as 11 tabelas do Quartz para que os jobs agendados sejam persistentes.

### WebClient (cliente HTTP para serviços externos)

Toda comunicação saindo do Backend para o Worker e o WppConnect passa pelo `WebClient` do Spring WebFlux. Duas instâncias são configuradas em `WebClientConfig`: uma apontando para o `SCRAPER_URL`, outra para o `WPP_URL`.

**Atenção ao detalhe:** apesar do WebClient vir da stack reativa, neste projeto ele é usado em **modo bloqueante** — chamadas terminam em `.block()`, o que faz cada request esperar a resposta antes de a thread seguir. O comportamento efetivo é equivalente a um `RestTemplate` ou `RestClient`.

A escolha do WebClient em vez desses dois foi deliberada: ele é a API mais moderna do Spring para HTTP e **suporta tanto modo síncrono quanto assíncrono**. Hoje o projeto inteiro é síncrono (Web MVC com Tomcat), então o `.block()` faz sentido e é simples. Se no futuro fizer sentido migrar pontos específicos para não-bloqueante (por exemplo, se o job do Quartz começar a gargalar esperando o Worker), a troca não exige substituir a biblioteca — só remover o `.block()` e ajustar o chamador para lidar com `Mono`/`Flux`.

É uma decisão que preserva flexibilidade futura sem custo hoje.

---

## Fluxos do sistema

### Cadastro do usuário

`POST /auth/cadastro` → `UserService.cadastro(dto)`. O método é `@Transactional`, então criação do usuário e geração do código OTP acontecem na mesma transação: se qualquer `save` falhar, nada é persistido.

```
1. Valida telefone (validarTelefone)
2. Checa unicidade de email e telefone
3. Aplica pepper na senha (PepperUtil.aplicar)
4. Persiste usuário com verificado=false
5. Gera código OTP (VerifyService.gerarCodigo)
6. Persiste código com expiração de 15 minutos
```

O número do bot WhatsApp que o usuário deve mensagear fica em variável de ambiente (`WPP_NUMERO`), não é persistido.

### Verificação do número (WhatsApp → Backend)

Funciona assim:

```
1. Usuário manda código para o bot pelo WhatsApp
2. WppConnect recebe e dispara POST /webhook/wpp (Backend)
3. Backend verifica se o número existe no banco
4. Busca código OTP ativo para esse número
5. Confere se não expirou e se bate com o que foi enviado
6. Marca usuário como verificado=true
```

**Como o Backend sabe da mensagem:** via webhook. A URL é configurada dentro do próprio WppConnect (não é registrada programaticamente no startup).

**Quando o WppConnect está fora:** o Backend não recebe nada. Novos códigos até continuam sendo gerados no cadastro, mas não têm como chegar. Usuários cadastrados nesse período ficam em estado "pendente" até o WppConnect voltar. Os jobs de scraping continuam rodando normalmente (eles não dependem do WppConnect para disparar), mas as notificações ficam represadas.


### Login

`POST /auth/login` → `UserService.login(dto)`.

```
1. authenticationManager.authenticate com email + (senha + pepper)
2. Extrai usuário autenticado via Authentication.getPrincipal()
3. Identifica role (USER / ADMIN)
4. Gera access token (JWT) com email, role e flag verificado
5. Gera refresh token com flags Secure, HttpOnly, SameSite
6. Retorna access no body, refresh no cookie
```

O pepper é concatenado à senha antes do `authenticate` — a lógica mora no `UserService`, não em um encoder customizado.

### Criação de alerta

Esse é o fluxo mais interessante do sistema. Implementa o núcleo do `SharedSearchJob`.

```
1. Valida filtros via ValidVeiculoService (confere marca/modelo/versão/ano
   contra veiculos.json)
2. Extrai email do token JWT
3. Calcula veiculoKey = Murmur3(marca, modelo, versao, anoMin, anoMax,
   valorInicio, valorFim, kmInicio, kmFim) como long
4. Converte para string

5. SE já existe SharedSearchJob com essa veiculoKey:
   5a. Se o usuário já tem alerta igual → 409 Conflict
   5b. Se o intervalo novo é menor que o do job:
       → Reagenda o trigger do Quartz com a nova frequência
       → Atualiza intervalo na tabela shared_search_jobs
   5c. Cria UserAlert vinculando usuário + job + intervalo dele

6. SE NÃO existe:
   6a. Busca a marca em marcas
   6b. Persiste novo SharedSearchJob
   6c. Cria JobDetail no Quartz
   6d. Cria Trigger no Quartz apontando pro JobDetail
   6e. Cria UserAlert

7. Dispara o job imediatamente (o usuário vê resultado sem esperar o próximo
   tick). A partir do segundo tick, só anúncios inéditos viram notificação.
```

A `veiculoKey` é a peça central aqui. Ela faz com que dois usuários com filtros idênticos compartilhem um único job — reduzindo drasticamente a carga no ShopCar. Se 100 usuários quiserem o mesmo Civic 2020, existe 1 job, não 100.

O reagendamento no caso 5b merece atenção. Suponha que o usuário A criou um alerta com intervalo de 60 minutos, depois o usuário B cria um alerta com o mesmo `veiculoKey` mas pedindo 30 minutos:

- O **job** (em `shared_search_jobs` e no Quartz) passa a rodar a cada 30 minutos — o menor intervalo entre os usuários participantes.
- Mas o **intervalo_alerta de cada usuário** permanece no seu próprio `user_alerts`: A continua com 60, B com 30.
- O `AdProcessorService` checa `deveNotificar(sent, alerta.intervaloAlerta)` antes de disparar mensagem. Para o usuário A, só envia se passaram 60+ minutos desde a última notificação dele, mesmo que o job tenha rodado duas vezes nesse meio-tempo.

Ou seja: o job **executa** com o menor intervalo (para cobrir o usuário mais exigente), mas cada usuário **recebe notificação** no seu próprio ritmo. Isso é o que torna o compartilhamento transparente para o usuário A — ele não vê diferença por outro usuário ter entrado.

### Execução do job periódico

```
Quartz dispara → JobExecutor.execute()
  ├─ Carrega SharedSearchJob do contexto
  ├─ ScrapingService.getAnuncios(job)
  │    ├─ Se cache válido em scrape_cache → retorna
  │    └─ Se não: ScraperService.scrapeCarro(request)
  │               → Persiste resultado em scrape_cache (JSONB)
  │
  └─ AdProcessorService.processar(job, result)
       └─ Para cada UserAlert vinculado ao job:
          └─ Para cada anúncio:
             └─ processarAnuncio(alerta, anuncio)
                ├─ deveNotificar(sent, alerta.intervaloAlerta)?
                ├─ Se anúncio é novo (nunca enviado a esse alerta):
                │    ├─ WhatsAppService.enviarAlerta(user, anuncio)
                │    ├─ Persiste em sent_announcement (com último preço)
                │    └─ Atualiza last_notified_at
                └─ Se anúncio já enviado mas preço mudou:
                     ├─ WhatsAppService.enviarAlertaPreço(...)
                     ├─ Atualiza último preço em sent_announcement
                     └─ Atualiza last_notified_at
```

Três decisões codificadas aqui:

**`@DisallowConcurrentExecution`** Garante que duas execuções do mesmo job nunca rodam em paralelo. Projeto pequeno, sem necessidade real de paralelismo, economiza recursos e elimina uma classe inteira de race conditions.

**Jitter de 0 a 30 segundos** Um delay aleatório no início de cada execução distribui a carga no Worker. Sem isso, quando o relógio bate 12:00, todos os jobs de 30 minutos disparariam exatamente no mesmo instante.

**Falha aborta o job inteiro, mas não contamina outros jobs** Não existe `try/catch` por iteração no `AdProcessorService`. Se qualquer passo falha — scrape, processamento de um anúncio, envio de WhatsApp para um usuário específico — a exception sobe até o `execute()` do Quartz e o job daquele tick é abortado. Os alertas ainda não processados nesse tick ficam sem notificação até o próximo. Outros jobs (com outras `veiculoKey`) continuam rodando normalmente — a falha fica contida dentro do job onde aconteceu, não se espalha.

Isso é uma fragilidade conhecida, listada em [pontos fracos](https://claude.ai/chat/83d05ef1-369d-488a-a33b-dd087198e0c2#pontos-fracos-conhecidos).

### Detecção de variação de preço

Anúncios já enviados não são descartados — ficam em `sent_announcement` junto com o último preço visto.

O `AdProcessorService` compara `ultimoPreco` (BigDecimal do banco) com `precoAtual` (BigDecimal do scrape) via `compareTo`. Se diferem, dispara `enviarAlertaPreço` com seta de ↑ / ↓ e percentual.

Não há limite de frequência — se um vendedor mexer no preço 5 vezes em 10 minutos, o usuário recebe o ultimo preço da plataforma ate o momento do scrape.

### Recuperação de senha

Dois endpoints: `POST /resetsenha/solicitar` e `POST /resetsenha/confirmar`.

```
Solicitação:
1. Recebe email
2. Verifica se já existe token para esse usuário
   ├─ Se existe: substitui o token e renova expiração (15 min)
   └─ Se não existe: cria nova tupla em tokens_passreset
3. Captura a segunda URL de URL_FRONTEND (ver observação abaixo)
4. Monta link: URL_FRONTEND[1] + rota + token
5. Envia email via Resend

Confirmação:
1. Recebe token + senha nova
2. Busca token no banco
3. Resolve o usuário dono do token
4. Aplica pepper + Argon2id na senha nova
5. Persiste senha criptografada
6. Deleta o token
```

**Observação sobre `URL_FRONTEND`:** essa variável é usada em dois contextos — lista de origens permitidas no CORS (split por vírgula) e também como base do link do email de reset (posição `[1]` do split). Isso implica que em produção precisam existir pelo menos duas entradas. É uma quirk documentada e não-óbvia, listada como débito em [pontos fracos](https://claude.ai/chat/83d05ef1-369d-488a-a33b-dd087198e0c2#pontos-fracos-conhecidos).

---

## Modelo de dados

### Tabelas principais

| Tabela               | O que guarda                                                                                                            | Observação                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `users`              | UUID como PK, `email` e `telefone` únicos, `verificado` (bool), `role`                                                  | Senha persistida já com pepper + Argon2id                              |
| `verification_codes` | Código OTP + expiração, FK para `users`                                                                                 | Expira em 15 min                                                       |
| `tokens_passreset`   | Token UUID + expiração, FK para `users`                                                                                 | Expira em 15 min                                                       |
| `marcas`             | Catálogo de marcas (id + nome)                                                                                          | Usada como FK em `shared_search_jobs`                                  |
| `shared_search_jobs` | Uma linha por combinação única de filtros. Contém `veiculo_key`, filtros completos, `intervalo`, `last_run_at`, `ativo` | Centro do sistema de agendamento                                       |
| `user_alerts`        | Associação entre usuário e job compartilhado. Cada usuário tem seu `intervalo_alerta`, `last_notified_at`, `ativo`      | Um usuário pode ter N alertas, cada alerta aponta pra exatamente 1 job |
| `sent_announcement`  | Anúncios já notificados por alerta. Guarda `anuncio_id`, `ultimo_preco`, `sent_at`                                      | **Unique constraint em `(user_alert_id, anuncio_id)`**                 |
| `scrape_cache`       | Resultado bruto do scrape em JSONB, indexado por `veiculo_key` + `scraped_at`                                           |                                                                        |

E 11 tabelas do Quartz (`qrtz_*`) que guardam detalhes de jobs, triggers, calendários, locks de cluster e estado de execução. Não são gerenciadas por JPA — foram criadas uma única vez via `spring.quartz.jdbc.initialize-schema=always` e a propriedade foi posteriormente alterada para `never` para evitar reinicialização do schema a cada subida (ver [Backend/README.md](https://claude.ai/Backend/README.md)).

### Campos JSONB

Apenas um: `scrape_cache.resultado`, mapeado via `@JdbcTypeCode(SqlTypes.JSON)` do Hypersistence Utils. Guarda o payload do Worker para reaproveitamento no próximo tick dentro da janela de cache.

---

## Segurança

Quatro camadas, cada uma cobrindo uma falha da outra:

### JWT (access token)

Token curto assinado com HMAC-SHA. Carrega `email`, `role`, `type=access` e `verificado`. Transita no header `Authorization: Bearer`. Validado pelo `JwtAuthFilter` em cada request protegida.

### Refresh token

Token longo, armazenado em cookie `HttpOnly` + `Secure` + `SameSite` em produção (caminho `/auth/refresh`). Não é acessível ao JavaScript, o que limita o vetor de XSS para roubo de sessão. Permite renovar o access sem pedir senha, e é invalidado pelo logout.

### Pepper + Argon2id

Senha passa por `pepper + senhaRaw` → `Argon2id.hash()`. Duas camadas:

- **Pepper**: string secreta em variável de ambiente, concatenada antes do hash. Se o banco vazar mas o servidor não, rainbow tables não funcionam — o atacante precisa do pepper também.
- **Argon2id**: vencedor do Password Hashing Competition. Resistente a ataques de GPU/ASIC por consumir memória explicitamente. Permite configurar memória, paralelismo e iterações como fator de custo.

Escolhido conscientemente sobre bcrypt: Argon2id tem proteção melhor contra hardware dedicado e trade-off configurável que bcrypt não oferece.

### Rate limiting (Bucket4j)

Aplicado nos endpoints públicos (`/auth/login`, `/auth/cadastro`, `/auth/refresh`): 10 requests por IP a cada 2 minutos, cache Caffeine expirando após 1 hora de inatividade. IP real extraído de `X-Forwarded-For` para funcionar atrás de proxy reverso.

Bucket4j foi escolhido por oferecer múltiplas regras por bucket e suporte nativo a backend Redis/JCache — útil quando o sistema escalar para múltiplas instâncias (hoje, com uma instância, o in-memory basta).

### `JwtAuthFilter`

Bloqueia com 403 qualquer request com JWT de usuário não-verificado em rotas não-públicas — exceto as rotas do próprio fluxo de verificação. Também rejeita refresh tokens sendo usados como access tokens (o campo `type` do token distingue).

---

## Pontos fracos conhecidos

Parte mais honesta da documentação. Nada aqui é teórico — são coisas que eu sei que existem e não priorizei resolver.

### Cadastro persiste antes da verificação

Usuário completa `POST /auth/cadastro` → fica no banco com `verificado=false`. Se ele nunca chegar a mandar o código no WhatsApp, o registro fica lá para sempre. Não há rotina de limpeza de cadastros incompletos, e ele ocupa o `email` + `telefone` (unique) — se tentar se cadastrar de novo, dá conflito.

Refazendo hoje: colocaria em tabela separada (`pending_registrations`) que o confirmação do código move para `users`. Ou TTL explícito com job de limpeza.

### Código OTP sem limite de tentativas

O `/webhook/wpp` processa toda mensagem que chega e simplesmente ignora códigos errados. Sem contador, sem bloqueio. Teoricamente, um atacante poderia bombardear o bot com tentativas até acertar um código de 6 dígitos dentro da janela de 15 minutos.

Na prática o risco é baixo: o atacante precisa enviar essas tentativas pelo WhatsApp, que tem seus próprios limites de rate e detecção de spam, e o número dele fica exposto. Mas arquiteturalmente é uma ausência que não deveria existir. Um contador em `verification_codes` com bloqueio após N tentativas resolveria.

### `scrape_cache` sem limpeza

Sem FK para `shared_search_jobs` e sem garbage collection. Jobs excluídos deixam caches órfãos. Em volume alto ao longo do tempo, a tabela cresce sem limite natural.

### Race condition na criação de alerta

Duas requisições simultâneas com o mesmo `veiculoKey` (mesmo usuário ou usuários diferentes) podem criar duas linhas em `shared_search_jobs` — ou tentar criar o mesmo `JobDetail` no Quartz e uma delas falhar com erro não tratado. Em produção com poucos usuários é improvável, mas o sintoma quando acontece é confuso: um usuário recebe 500 sem explicação clara, ou um job é agendado duas vezes, ou nenhuma das operações completa corretamente.

Solução: unique constraint em `shared_search_jobs.veiculo_key` no banco + tratamento do `DataIntegrityViolationException` como "concorrência, tente resolver reutilizando o job existente".

### Sem isolamento de falhas dentro do job

O `AdProcessorService.processar()` itera sobre todos os alertas e anúncios sem `try/catch` por iteração. Uma exception em qualquer ponto — scrape que falha, envio de WhatsApp rejeitado, anúncio com campo nulo inesperado — aborta o processamento de todos os alertas restantes daquele tick.

Exemplo concreto: 10 usuários compartilham o mesmo `SharedSearchJob`. O processamento começa pelo usuário A. Se o WppConnect rejeitar a mensagem para A (número inválido, sessão caída, timeout), os usuários B até J ficam sem notificação nesse tick — mesmo que o problema seja específico do A.

Solução: envolver cada iteração em `try/catch`, logar a falha com identificação do alerta e seguir para o próximo. O trade-off é que falhas silenciosas precisam de observabilidade para serem descobertas (ver item sobre observabilidade mais abaixo).

### Autenticação pode estar fazendo queries demais

A lógica do `UserDetailsService` + filtros de Spring Security pode estar consultando o banco mais vezes do que o necessário por request. Não medido, só suspeita. Valeria instrumentar com log SQL e perfilar.

Alternativa mais ambiciosa: migrar para um provedor externo (OAuth/OIDC) com login social (Google). Isso mudaria bastante o fluxo mas eliminaria toda a complexidade de gerenciar senhas e verificação.

### Sessão só client-side

Toda a "sessão" do usuário vive nos tokens JWT. Não há estado server-side de sessão (além dos refresh tokens). Isso simplifica escala mas dificulta "deslogar de todos os dispositivos" — precisa implementar blacklist de tokens ou rotação forçada do `JWT_SECRET` (que desloga todo mundo, inclusive quem não foi invadido).

### `URL_FRONTEND` como variável multifunção

A mesma variável serve como lista de origens CORS e como base de URL do email de reset (posição `[1]` do split por vírgula). Isso significa que a ordem das entradas importa e que o comportamento depende de convenção não documentada no código. Deveria ser duas variáveis separadas: `CORS_ALLOWED_ORIGINS` e `EMAIL_LINK_BASE_URL`.

### WppConnect como ponto único de falha

Se o WppConnect cair, verificações de novos usuários ficam represadas e notificações não saem. Os jobs continuam rodando e persistindo anúncios novos, mas nada chega ao usuário. Em cenário profissional, migrar para uma API paga de WhatsApp Business eliminaria essa fragilidade.

### Sem migrations versionadas

Schema gerenciado por `ddl-auto=update`. Qualquer mudança de entidade em produção é "salto de fé" — Hibernate tenta inferir a diff. Flyway ou Liquibase resolveriam com migrações revisáveis em PR e rollback explícito.

### Sem observabilidade estruturada

Logs são stdout do container. Se um tick do Quartz falha no meio de 50 alertas, descobrir qual alerta quebrou depende de ler logs brutos. `spring-boot-starter-actuator` + Prometheus + Grafana seria barato e daria visibilidade real.

### Limite de escala (estimativa)

Não medido. Chute informado: com mais de ~100 alertas ativos simultâneos, a combinação de "scrape a cada 30 min" + "potencialmente várias notificações por alerta" + "sem paginação em listagens admin" começaria a mostrar latência. O primeiro gargalo provavelmente seria o Worker (se todos os filtros forem diferentes e o cache não ajudar) ou o WppConnect (que é uma automação frágil de WhatsApp Web).

---

## O que eu faria diferente hoje

Um resumo consolidado dos "refaria" espalhados acima:

- **Flyway desde o dia 1** para schema versionado
- **Auth como módulo separado**, ou OAuth externo com login social
- **Observabilidade desde o começo** (actuator + Prometheus)
- **Estado de cadastro como máquina de estados explícita** (não flag boolean)
- **API paga de WhatsApp** em cenário profissional
- **Unique constraint + tratamento de concorrência** em `shared_search_jobs`
- **Variáveis de ambiente separadas** para CORS e links de email

Cada um desses seria trabalhoso de mudar agora. A lição que fica é simples:
algumas decisões (principalmente as de infra) crescem junto com o projeto, e
fazer certo no começo dá bem menos dor de cabeça do que consertar depois.