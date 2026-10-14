# Back-end: login, cadastro e permissões

## Executar

1. Instale as dependências com `npm install`.
2. Configure `.env` usando `.env.example`: conexão com MySQL e `JWT_SECRET` com pelo menos 32 caracteres.
3. No banco indicado em `DB_NAME`, execute `sql/users.sql`. O arquivo cria a tabela de usuários sem cadastrar contas prontas. Se ela já existir, confira os campos e o índice UNIQUE de e-mail; o script não modifica tabelas existentes.
4. Execute `npm start`. A API usa a porta 8081 por padrão.

Execute também `sql/comments.sql` (comentários). Se você não tem a tabela `materials` da aula, `sql/materials.sql` cria a tabela com alguns exemplos (só insere se estiver vazia).

## Cadastro explicado

- `src/controllers/register.js`: valida nome, e-mail e senha; verifica duplicidade; gera o hash com bcrypt; salva com SQL parametrizado.
- `src/routers/auth.js`: publica `POST /api/register` e `POST /api/login`.
- `sql/users.sql`: define a tabela e impede e-mails duplicados com UNIQUE.

O cadastro recebe `name`, `email` e `password`. Nome aceita até 100 caracteres, e-mail até 254 e senha pelo menos 8 caracteres e no máximo 72 bytes (limite do bcrypt). A senha original não é salva nem devolvida.

A resposta de sucesso é HTTP 201 com uma mensagem. Dados inválidos retornam 400 e e-mail já cadastrado retorna 409. O aluno volta ao login para obter seu token.

## Perfis

O cadastro público sempre cria `user`, que pode consultar materiais. O perfil `admin` também pode excluir. Enviar `role: "admin"` no cadastro não concede essa permissão.

Para a atividade, o professor pode executar no banco, substituindo o e-mail pelo da conta criada:

```sql
UPDATE users SET role = 'admin' WHERE email = 'email-da-conta-cadastrada';
```

Depois, saia e entre novamente: o perfil do token é definido no login.

## Rotas

- `POST /api/register`: cadastro público.
- `POST /api/login`: login público; devolve token e dados do usuário. Após 5 falhas (IP + e-mail) retorna 429 com `retryAfterSeconds`, `retryAt` e `Retry-After`.
- `GET /api/materials`: consulta autenticada para os dois perfis. Aceita `?search=texto` (nome ou categoria, até 100 caracteres).
- `GET /api/materials/:id/comments`: lista os comentários do material.
- `POST /api/materials/:id/comments`: cria comentário. Corpo: `{ "content": "texto" }` com 1 a 500 caracteres; retorna 201, 400 (inválido) ou 404 (material inexistente).
- `DELETE /api/materials/:id`: exclusão apenas para admin.

As rotas protegidas recebem `Authorization: Bearer SEU_TOKEN`.

## Testes

Execute `npm test`. Os testes fazem chamadas HTTP com banco simulado e verificam cadastro, hash, duplicidade, validação, login e permissões. A integração com o MySQL deve ser conferida com o banco da aula.

## Rate limit do login

`src/utils/rateLimiter.js` guarda as falhas na memória. `src/controllers/auth.js` consulta o limitador antes de verificar a senha: 5 falhas por IP + e-mail e 20 por IP, em janela de 15 minutos. Atrás de proxy (Nginx, etc.), configure `app.set("trust proxy", ...)` para que `req.ip` seja o IP real do cliente.
