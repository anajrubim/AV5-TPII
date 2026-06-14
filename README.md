# Atlantis — Sistema Hoteleiro (Aplicação Web)

Aplicação web completa do sistema Atlantis, evoluindo o protótipo navegável
(AV4) com um back-end em **Node.js + TypeScript + Express** e banco de dados
**SQLite**, mantendo a mesma interface gráfica validada com os clientes.

Este projeto reaproveita:

- A interface (layout, telas, fluxos e estilo visual) do protótipo **AV4-TPII**.
- O modelo de domínio (Cliente, Endereço, Telefone, Documento, Acomodação,
  Hospedagem) e as regras de negócio do sistema CLI **AV3-TPII**.

---

## Arquitetura

```
atlantis-web/
├── src/            # Front-end (React + TypeScript + Vite) — interface do protótipo AV4
├── server/         # Back-end (Express + TypeScript + SQLite)
│   ├── src/
│   │   ├── db/             # Conexão e schema do banco (SQLite)
│   │   ├── models/         # Tipos compartilhados
│   │   ├── repositories/    # Acesso a dados (CRUD)
│   │   ├── routes/          # Rotas da API REST
│   │   └── index.ts          # Servidor Express
│   └── atlantis.db  # Banco de dados (gerado automaticamente)
└── ...
```

A interface não muda em relação ao protótipo AV4: o componente `Armazem`
(`src/store/armazem.ts`) que antes salvava tudo no `localStorage` agora
consome a API REST do back-end, mantendo exatamente os mesmos métodos
(`getClientes`, `adicionarCliente`, `registrarHospedagem`, etc.), portanto
todas as telas e componentes continuam funcionando sem alterações de UI.

---

## Banco de dados

SGBD escolhido: **SQLite**, via módulo nativo `node:sqlite` do Node.js 22+
(não requer instalação de driver externo nem compilação nativa).

### Modelo de dados

- **clientes** — dados pessoais do hóspede (nome, nome social, datas de
  nascimento/cadastro). Possui `titularId` para representar dependentes
  (auto-relacionamento).
- **enderecos** — endereço (1:1 com cliente).
- **telefones** — telefones do cliente (1:N).
- **documentos** — documentos (CPF, RG, Passaporte) do cliente (1:N).
- **acomodacoes** — catálogo fixo dos 6 tipos de acomodação do Atlantis.
- **hospedagens** — registros de check-in/check-out, relacionando cliente e
  acomodação.

Todas as integridades (exclusão em cascata de endereço/telefones/documentos,
restrição para remover cliente com hospedagem ativa, restrição para
hospedagem duplicada) são garantidas tanto no banco (chaves estrangeiras)
quanto na camada de regras de negócio (`server/src/repositories`).

O banco é criado automaticamente (arquivo `server/atlantis.db`) na primeira
execução do servidor, já populado com o catálogo de acomodações e dois
hóspedes de exemplo.

---

## Funcionalidades (equivalentes ao sistema CLI original)

- **Dashboard** — visão geral com estatísticas e atividade recente.
- **Hóspedes** — CRUD completo de clientes (nome, nome social, nascimento,
  endereço, telefones, documentos).
- **Acomodações** — catálogo com os 6 tipos de acomodação.
- **Hospedagens** — registro de check-in, check-out (encerramento) e remoção,
  com a regra de que um hóspede só pode ter uma hospedagem ativa por vez.

---

## Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 22 ou superior (necessário para o módulo
  nativo `node:sqlite`)
- npm

### 1. Back-end (API + banco de dados)

```bash
cd server
npm install
npm run dev      # inicia em http://localhost:3001 com hot-reload
```

Para build de produção:

```bash
npm run build
npm start
```

### 2. Front-end (interface)

Em outro terminal:

```bash
npm install
npm run dev      # inicia em http://localhost:5173
```

Por padrão o front-end aponta para `http://localhost:3001/api`. Para alterar,
copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

### Build para produção (front-end)

```bash
npm run build
```

Os arquivos finais ficam na pasta `dist/`.

---

## API REST

| Método | Rota                                | Descrição                              |
|--------|-------------------------------------|-----------------------------------------|
| GET    | `/api/clientes`                     | Lista todos os hóspedes                |
| GET    | `/api/clientes/:id`                 | Detalha um hóspede                     |
| POST   | `/api/clientes`                     | Cadastra um novo hóspede                |
| PUT    | `/api/clientes/:id`                 | Atualiza um hóspede                     |
| DELETE | `/api/clientes/:id`                 | Remove um hóspede                       |
| GET    | `/api/acomodacoes`                  | Lista o catálogo de acomodações         |
| GET    | `/api/acomodacoes/:id`              | Detalha uma acomodação                  |
| GET    | `/api/hospedagens`                  | Lista todas as hospedagens              |
| GET    | `/api/hospedagens/ativa/:clienteId` | Hospedagem ativa de um cliente          |
| POST   | `/api/hospedagens`                  | Registra check-in                       |
| POST   | `/api/hospedagens/:id/encerrar`     | Registra check-out                      |
| DELETE | `/api/hospedagens/:id`              | Remove um registro de hospedagem        |

---

## Autores

Desenvolvido como atividade prática (AV5/Web) — Técnicas de Programação II,
evoluindo as entregas AV3 (sistema CLI) e AV4 (protótipo navegável).
