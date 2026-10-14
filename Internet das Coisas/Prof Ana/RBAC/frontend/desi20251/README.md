# Front-end da aula: login e permissões

Interface simples em Next.js, React e TypeScript, com CSS comum e comentários em português.

## Executar

No terminal, dentro de `frontend/desi20251`:

```bash
npm install
npm run dev
```

Abra http://localhost:3000. A API usa `http://localhost:8081/api` por padrão. Para mudar, copie `.env.example` para `.env.local`, ajuste `NEXT_PUBLIC_API_URL` e reinicie o front-end.

O back-end e o MySQL precisam estar ativos. Prepare a tabela com `backend/sql/users.sql` no banco configurado em `DB_NAME`. Se a tabela já existir, confira os campos e a restrição UNIQUE para e-mail: o arquivo não altera tabelas existentes. Não há contas ou senhas fixas no front-end.

## Cadastrar uma conta

1. No login, clique em **Cadastrar usuário**.
2. Informe nome, e-mail e senha (pelo menos 8 caracteres e no máximo 72 bytes).
3. Clique em **Cadastrar**. O front-end envia `POST /api/register`.
4. A API valida os dados, gera o hash da senha e salva o usuário com perfil `user`.
5. Após o sucesso, a tela volta ao login. Digite as credenciais cadastradas para entrar.

E-mail repetido retorna HTTP 409; dados inválidos retornam HTTP 400. O cadastro não aceita escolher o perfil de administrador. Para testar `admin`, o professor pode alterar a role da conta no banco, conforme o README do back-end, e fazer um novo login.

## Roteiro para os alunos

1. Digite o e-mail e a senha de um usuário cadastrado com perfil `user` e clique em **Entrar**.
2. Observe o perfil `user` e a lista de materiais, sem botão de exclusão.
3. Clique em **Sair** e digite as credenciais de um usuário cadastrado com perfil `admin`.
4. Observe o perfil `admin` e o botão **Excluir**. A confirmação deixa claro que a exclusão ocorre no banco.
5. Saia e tente entrar com senha incorreta para observar a mensagem da API.
6. Recarregue a página: a sessão fica apenas na memória, portanto será necessário entrar novamente.

## Pesquisa, comentários e rate limit

- **Pesquisa**: o campo acima da lista envia `GET /materials?search=...`. Use **Limpar** para voltar à lista completa.
- **Comentários**: em cada material, o botão **Comentários** abre a área para ler e enviar comentários (1 a 500 caracteres). O texto é exibido como texto puro.
- **Rate limit**: após 5 tentativas de login incorretas, a tela mostra o horário em que será possível tentar de novo, com contagem regressiva.

## Onde estudar

- `app/page.tsx`: página inicial.
- `app/page/Login.tsx`: formulário e estado da sessão.
- `app/page/Comments.tsx` e `app/services/comments.ts`: comentários do material.
- `app/page/Register.tsx`: formulário de cadastro e retorno ao login.
- `app/services/register.ts`: envia o cadastro para a API.
- `app/page/Home.tsx`: consulta, exclusão e exibição conforme o perfil.
- `app/services/login.ts`: envia e-mail e senha e recebe a sessão.
- `app/services/api.ts`: endereço da API e mensagens de erro.
- `app/globals.css`: aparência e adaptação para telas pequenas.

## Fluxo de acesso

O formulário envia `POST /api/login`. O back-end verifica a senha e devolve `token` e `user`. As consultas e exclusões enviam `Authorization: Bearer <token>`.

Autenticação identifica quem entrou. Autorização determina o que esse usuário pode fazer. Nome, e-mail e perfil vêm da resposta da API. O front-end usa `user.role` para mostrar o botão de exclusão, mas é o middleware do back-end que realmente bloqueia a operação para usuários comuns (HTTP 403).

## Verificação

```bash
npm run lint
npm run build
```

O cadastro prepara usuários; a lista de materiais depende da tabela `materials` e dos dados usados na aula de back-end.
