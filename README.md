# Atlantis — Sistema Hoteleiro (Aplicação Web)

Aplicação web completa do sistema Atlantis, evoluindo o protótipo navegável
(AV4) com um back-end em **Node.js + TypeScript + Express** e banco de dados
**SQLite**, mantendo a mesma interface gráfica validada com os clientes.

Este projeto reaproveita:

- A interface (layout, telas, fluxos e estilo visual) do protótipo **AV4-TPII**.
- O modelo de domínio (Cliente, Endereço, Telefone, Documento, Acomodação,
  Hospedagem) e as regras de negócio do sistema CLI **AV3-TPII**.

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
