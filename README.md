# Notas Fiscais — Frontend (Angular)

Interface web para **gestão de notas fiscais e despesas**: login com JWT, cadastro e
listagem de despesas com upload de comprovante, perfil do usuário, administração de
usuários (para perfil ADMIN) e busca de endereço por CEP. Construída com **Angular 14** e
**Angular Material**.

> API (Spring Boot) que esta aplicação consome:
> **[notas_fiscais_back](https://github.com/b0d3-crypt/notas_fiscais_back)** — suba o
> backend **antes** do frontend.

---

## Índice
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Passo a passo (do zero ao login)](#passo-a-passo-do-zero-ao-login)
- [Credenciais de acesso](#credenciais-de-acesso)
- [Configuração da URL da API](#configuração-da-url-da-api)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Problemas comuns (FAQ)](#problemas-comuns-faq)

---

## Stack

| Item            | Tecnologia                  |
|-----------------|-----------------------------|
| Framework       | **Angular 14**              |
| UI              | Angular Material 14 + Angular CDK |
| Estilização     | Tailwind CSS 3 + SCSS       |
| Reatividade     | RxJS 7                      |
| Linguagem       | TypeScript 4.7              |
| Testes          | Karma + Jasmine             |

---

## Pré-requisitos

| Ferramenta | Versão recomendada | Observação |
|------------|--------------------|------------|
| **Node.js** | 16.x ou **18.x** (LTS) | Angular 14 não suporta Node 20+. Confira com `node -v`. |
| **npm**     | 8+ ou 9+           | Vem com o Node. |
| **Backend** | rodando em `http://localhost:8080` | A aplicação só funciona com a API no ar. |

> O Angular CLI é instalado **localmente** pelo projeto (não precisa de instalação
> global). Os comandos abaixo usam `npm run` / `npx`.

---

## Passo a passo (do zero ao login)

### 1. Subir o backend primeiro
Siga o README de **[notas_fiscais_back](https://github.com/b0d3-crypt/notas_fiscais_back)**.
A API precisa estar respondendo em **http://localhost:8080**.

### 2. Clonar este repositório
```bash
git clone https://github.com/b0d3-crypt/notas_fiscais.git
cd notas_fiscais
```

### 3. Instalar as dependências
```bash
npm install
```

### 4. Rodar a aplicação
```bash
npm start          # equivale a "ng serve"
```
A aplicação sobe em **http://localhost:4200** e abre na tela de login.

### 5. Fazer login
Use uma das contas já cadastradas no backend (veja abaixo). Após o login você é
redirecionado para **`/principal/despesas`**.

---

## Credenciais de acesso

Os usuários já vêm criados pelo backend (via seed/migrations). Basta logar:

| Papel             | E-mail (login)     | Senha      |
|-------------------|--------------------|------------|
| **Administrador** | `admin@notas.com`  | `admin123` |
| **Usuário comum** | `user@notas.com`   | `user123`  |

- **Administrador:** acessa o menu de **Usuários** (listar/criar/editar) além das despesas.
- **Usuário comum:** gerencia as próprias despesas e o próprio perfil.

> O login é por **e-mail + senha**. O token JWT retornado é guardado no `localStorage`
> (chave `auth_user`) e enviado automaticamente em cada requisição pelo
> `AuthInterceptor`. Para sair, use o **logout** na barra lateral.

---

## Configuração da URL da API

O endereço do backend fica em `src/environments/`:

```ts
// src/environments/environment.ts  (desenvolvimento)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',   // <-- altere se o backend estiver em outra URL/porta
};
```

```ts
// src/environments/environment.prod.ts  (build de produção)
export const environment = {
  production: true,
  apiUrl: '',   // mesma origem do servidor que servir os arquivos estáticos
};
```

> Se o backend rodar em outra porta/host, ajuste `apiUrl` em `environment.ts`.
> O backend também precisa liberar essa origem no CORS (`cors.allowed-origins`).

---

## Scripts disponíveis

| Comando            | O que faz |
|--------------------|-----------|
| `npm start`        | Sobe o servidor de desenvolvimento em `http://localhost:4200`. |
| `npm run build`    | Gera o build de produção em `dist/`. |
| `npm run watch`    | Build contínuo em modo desenvolvimento. |
| `npm test`         | Roda os testes unitários (Karma + Jasmine). |

Para usar uma **porta diferente**: `npx ng serve --port 4300`.

---

## Estrutura do projeto

```
src/app/
├── core/
│   ├── auth/             # AuthService (sessão/token no localStorage)
│   └── interceptors/     # AuthInterceptor (injeta o Bearer token)
├── guards/               # AuthGuard (exige login) e AdminGuard (exige ADMIN)
├── services/             # despesa.service, usuario.service
├── shared/               # ApiService, componentes (button/card), pipes, diretivas, snackbar
└── views/                # Páginas
    ├── login/            # Tela de login
    ├── principal/        # Layout autenticado (com sidenav) + rotas filhas
    ├── despesas/         # Listagem e modal de despesa
    ├── usuarios/         # Administração de usuários (ADMIN)
    ├── perfil/           # Perfil do usuário logado
    └── sidenav/          # Barra de navegação lateral

src/environments/         # Configuração de ambiente (apiUrl)
```

**Rotas principais:**
- `/login` — autenticação (rota pública).
- `/principal/despesas` — área autenticada (protegida por `AuthGuard`).
- Rotas de usuários são protegidas adicionalmente pelo `AdminGuard`.

---

## Problemas comuns (FAQ)

**Erro de Node / `ng serve` não inicia**
Você provavelmente está no Node 20+. O Angular 14 exige Node 16 ou 18. Instale o Node 18
LTS (ex.: via `nvm install 18 && nvm use 18`).

**Login não funciona / erro de rede no console**
O backend não está no ar em `http://localhost:8080`. Suba a API primeiro.

**Erro de CORS no navegador**
A origem do frontend não está liberada no backend. Confirme `cors.allowed-origins`
(padrão `http://localhost:4200`) no `application.properties` da API.

**"Credenciais inválidas" com a senha certa**
Verifique no backend se a migration `V3` (correção dos hashes do seed) foi aplicada —
veja o FAQ do README da API.

**Porta 4200 ocupada**
Rode em outra porta: `npx ng serve --port 4300`.
```
