import express from 'express';
import cors from 'cors';
import './db/database.js';
import { clientesRouter } from './routes/clientes.js';
import { acomodacoesRouter } from './routes/acomodacoes.js';
import { hospedagensRouter } from './routes/hospedagens.js';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

app.use('/api/clientes', clientesRouter);
app.use('/api/acomodacoes', acomodacoesRouter);
app.use('/api/hospedagens', hospedagensRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Atlantis API rodando em http://localhost:${PORT}`);
});
