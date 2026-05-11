# Vertrau — Cadastro de Usuários

API REST em .NET + SPA Angular para cadastro, listagem e gerenciamento de usuários. O projeto cobre um fluxo de cadastro em duas etapas com integração ao ViaCEP, além de listagem com filtros, paginação, edição e exclusão.

## O que tem aqui

> - VertrauUsuarios.sln        → Solução .NET (API + testes)
> - UsuariosApi/               → ASP.NET Core · EF Core (SQLite) · Swagger
> - UsuariosApi.Tests/         → xUnit: testes de unidade e integração
> - UsuariosFront/cadastro/    → Angular 21 + PrimeNG

## Antes de começar

Você vai precisar de:

- [.NET SDK](https://dotnet.microsoft.com/download) compatível com `net10.0`
- [Node.js LTS](https://nodejs.org/) + npm

---

## Rodando a API

```bash
cd UsuariosApi
dotnet run
```

A porta aparece no console assim que o processo sobe — por padrão costuma ser `http://localhost:5278`.

| Recurso | URL |
|---|---|
| API | `http://localhost:5278` |
| Swagger | `http://localhost:5278/swagger` |

> **Banco de dados:** em desenvolvimento o SQLite é criado automaticamente via `EnsureCreatedAsync()`. Em produção, use migrations: `dotnet ef migrations add` + `dotnet ef database update`.

> **CORS:** configurado para aceitar requisições de `http://localhost:4200`.

### Filtros disponíveis em `GET /usuarios`

| Parâmetro | O que faz |
|---|---|
| `pagina` | Número da página |
| `tamanhoPagina` | Itens por página |
| `nome` | Busca parcial em nome ou sobrenome (case-insensitive) |
| `email` | Busca parcial no e-mail |
| `genero` | `Masculino`, `Feminino` ou `Outro` |

Exemplo de uso:
> GET /usuarios?pagina=1&tamanhoPagina=10&nome=Silva&genero=Feminino
---

## Rodando o front-end

```bash
cd UsuariosFront/cadastro
npm install
npm start
```

Acesse `http://localhost:4200`.

Se a porta da API for diferente de `5278`, atualize a variável `apiUrl` em `src/app/services/cadastro.service.ts`.

### Rotas da aplicação

| Rota | O que faz |
|---|---|
| `/` | Cadastro em duas etapas + confirmação em diálogo |
| `/lista` | Tabela com filtros, paginação, editar e excluir |
| `/usuarios/:id/editar` | Formulário de edição (PUT) |

---

## Rodando os testes

```bash
cd UsuariosApi.Tests
dotnet test
```

Cobre regras de negócio com mock e cenários de integração com banco em memória via `WebApplicationFactory`.

---

## Docker

Não implementado
