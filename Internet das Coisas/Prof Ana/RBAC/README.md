# RBAC: comentários, pesquisa e rate limit no login

Continuação da atividade de controle de acesso (RBAC) da aula 16/09, agora com proteções contra falhas de segurança comuns.
Stack: Next.js + React + TypeScript (front-end) e Express + MySQL (back-end).

## O que foi implementado

| # | Atividade | Onde está |
|---|-----------|-----------|
| 1 | Comentários sobre um produto (material): cadastrar e visualizar | `backend/src/controllers/comments.js`, `frontend/desi20251/app/page/Comments.tsx` |
| 2 | Listagem de materiais com campo de pesquisa | `backend/src/controllers/materials.js`, `frontend/desi20251/app/page/Home.tsx` |
| 3 | Rate limit no login (5 tentativas + aviso de quando tentar de novo) | `backend/src/utils/rateLimiter.js`, `backend/src/controllers/auth.js`, `frontend/desi20251/app/page/Login.tsx` |

### 1. Comentários
- Rotas: `GET /api/materials/:id/comments` e `POST /api/materials/:id/comments` (exigem login; `user` e `admin` podem comentar).
- **Exibidos como texto**: o React escapa o conteúdo, então `<script>` digitado aparece escrito na tela e não é executado (não se usa `dangerouslySetInnerHTML`).
- **Validação no backend**: precisa ser `string` com 1 a 500 caracteres (após `trim`), sem caracteres de controle. Outros tipos (número, array, objeto, `null`) retornam 400.
- **Acentos, aspas e especiais continuam funcionando**: o texto é salvo exatamente como digitado (sem "limpar" ou trocar `"` por `&quot;`). A proteção está na saída (texto puro) e no SQL parametrizado, não em mutilar o conteúdo. A tabela usa `utf8mb4`.
- O autor vem do token JWT, nunca do corpo da requisição.

### 2. Pesquisa
- `GET /api/materials?search=texto` filtra por nome ou categoria.
- SQL parametrizado (`?`), com escape de `%`, `_` e `\`; limite de 100 caracteres.

### 3. Rate limit no login
- Máximo de **5 tentativas erradas** por IP + e-mail em 15 minutos. A 5ª falha já bloqueia (HTTP 429).
- A resposta informa **quando poderá tentar novamente** (`message`, `retryAfterSeconds`, `retryAt` e cabeçalho `Retry-After`). O front-end mostra o horário e uma contagem regressiva e desabilita o botão.
- Um segundo limite de 20 falhas por IP impede testar vários e-mails em sequência. Login correto zera o contador da conta.
- O limitador fica na memória do servidor (reinicia junto com ele). Em produção com vários servidores, use Redis.

## Como executar

1. **Banco**: no MySQL, no banco de `DB_NAME`, execute nesta ordem:
   - `backend/sql/users.sql`
   - `backend/sql/comments.sql`
   - `backend/sql/materials.sql` (só se você ainda não tem a tabela `materials` da aula)
2. **Back-end** (`backend/`): `npm install`, copie `.env.example` para `.env`, preencha a senha do MySQL e um `JWT_SECRET` com 32+ caracteres, depois `npm start` (porta 8081).
3. **Front-end** (`frontend/desi20251/`): `npm install` e `npm run dev`, depois abra http://localhost:3000.
4. Cadastre uma conta, entre e teste: pesquisar, abrir **Comentários** de um material e errar a senha 5 vezes.

No Windows, use `npm.cmd` se o PowerShell bloquear `npm.ps1`.

## Verificação

- Back-end: `npm test` (banco simulado; cobre comentários, pesquisa, rate limit, cadastro e permissões).
- Front-end: `npm run lint` e `npm run build`.

## Sugestão de testes manuais (para o relatório)

- Comentário `Ótimo produto! Ele disse: "não vale R$ 5,00" & 'funciona'` → aparece idêntico.
- Comentário `<script>alert(1)</script>` ou `<img src=x onerror=alert(1)>` → aparece como texto, sem executar.
- Comentário vazio ou com 501 caracteres → recusado.
- Pesquisa `' OR 1=1 --` → trata como texto, não retorna "tudo" por injeção.
- 5 senhas erradas → bloqueio com horário de nova tentativa.
